-- Migration: Create friendships table and related functionality
-- Note: profiles table already exists from 001_create_profiles_table.sql

-- Add missing columns to profiles table if they don't exist
DO $$ 
BEGIN
  -- Add email column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'email') THEN
    ALTER TABLE profiles ADD COLUMN email TEXT UNIQUE;
  END IF;
  
  -- Add username column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'username') THEN
    ALTER TABLE profiles ADD COLUMN username TEXT UNIQUE;
  END IF;
  
  -- Add full_name column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'full_name') THEN
    ALTER TABLE profiles ADD COLUMN full_name TEXT;
  END IF;
  
  -- Add avatar_url column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'avatar_url') THEN
    ALTER TABLE profiles ADD COLUMN avatar_url TEXT;
  END IF;
END $$;

-- Create friendships table
CREATE TABLE IF NOT EXISTS friendships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  friend_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT CHECK (status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  
  -- Ensure users can't friend themselves and no duplicate friendships
  CONSTRAINT no_self_friendship CHECK (user_id != friend_id),
  CONSTRAINT unique_friendship UNIQUE (user_id, friend_id)
);

-- Enable Row Level Security (RLS) on friendships table
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

-- Create policies for friendships table (only if they don't exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'friendships' AND policyname = 'Users can view friendships they''re involved in') THEN
    EXECUTE 'CREATE POLICY "Users can view friendships they''re involved in" ON friendships FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_id)';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'friendships' AND policyname = 'Users can insert their own friendship requests') THEN
    EXECUTE 'CREATE POLICY "Users can insert their own friendship requests" ON friendships FOR INSERT WITH CHECK (auth.uid() = user_id)';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'friendships' AND policyname = 'Users can update friendships they''re involved in') THEN
    EXECUTE 'CREATE POLICY "Users can update friendships they''re involved in" ON friendships FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = friend_id)';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'friendships' AND policyname = 'Users can delete friendships they''re involved in') THEN
    EXECUTE 'CREATE POLICY "Users can delete friendships they''re involved in" ON friendships FOR DELETE USING (auth.uid() = user_id OR auth.uid() = friend_id)';
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_friendships_user_id ON friendships(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_friend_id ON friendships(friend_id);
CREATE INDEX IF NOT EXISTS idx_friendships_status ON friendships(status);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_full_name ON profiles(full_name);

-- Update the function to handle new user creation with proper full_name handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  has_email_column BOOLEAN;
  has_username_column BOOLEAN;
  has_full_name_column BOOLEAN;
  extracted_username TEXT;
  extracted_full_name TEXT;
BEGIN
  -- Check which columns exist
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'email'
  ) INTO has_email_column;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'username'
  ) INTO has_username_column;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'full_name'
  ) INTO has_full_name_column;
  
  -- Extract username with fallback to email prefix if not provided
  extracted_username := COALESCE(
    new.raw_user_meta_data->>'username',
    split_part(new.email, '@', 1)
  );
  
  -- Extract full_name with multiple fallback options
  extracted_full_name := COALESCE(
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'display_name',
    extracted_username
  );
  
  -- Insert with all available columns
  IF has_email_column AND has_username_column AND has_full_name_column THEN
    INSERT INTO public.profiles (id, email, username, full_name)
    VALUES (
      new.id,
      new.email,
      extracted_username,
      extracted_full_name
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      username = COALESCE(EXCLUDED.username, profiles.username),
      full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
      updated_at = NOW();
  ELSIF has_email_column AND has_username_column THEN
    INSERT INTO public.profiles (id, email, username)
    VALUES (
      new.id,
      new.email,
      extracted_username
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      username = COALESCE(EXCLUDED.username, profiles.username),
      updated_at = NOW();
  ELSIF has_username_column AND has_full_name_column THEN
    INSERT INTO public.profiles (id, username, full_name)
    VALUES (
      new.id,
      extracted_username,
      extracted_full_name
    )
    ON CONFLICT (id) DO UPDATE SET
      username = COALESCE(EXCLUDED.username, profiles.username),
      full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
      updated_at = NOW();
  ELSIF has_username_column THEN
    INSERT INTO public.profiles (id, username)
    VALUES (
      new.id,
      extracted_username
    )
    ON CONFLICT (id) DO UPDATE SET
      username = COALESCE(EXCLUDED.username, profiles.username),
      updated_at = NOW();
  ELSE
    -- Fallback: just insert the ID
    INSERT INTO public.profiles (id)
    VALUES (new.id)
    ON CONFLICT (id) DO UPDATE SET
      updated_at = NOW();
  END IF;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle auth user updates (email changes, profile updates, etc.)
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER AS $$
DECLARE
  has_email_column BOOLEAN;
  has_full_name_column BOOLEAN;
  extracted_full_name TEXT;
BEGIN
  -- Check which columns exist
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'email'
  ) INTO has_email_column;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'full_name'
  ) INTO has_full_name_column;
  
  -- Extract full_name with fallbacks
  extracted_full_name := COALESCE(
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'display_name'
  );
  
  -- Update profile with available data
  IF has_email_column AND has_full_name_column THEN
    UPDATE public.profiles 
    SET 
      email = new.email,
      full_name = COALESCE(extracted_full_name, full_name),
      updated_at = NOW()
    WHERE id = new.id;
  ELSIF has_email_column THEN
    UPDATE public.profiles 
    SET 
      email = new.email,
      updated_at = NOW()
    WHERE id = new.id;
  ELSIF has_full_name_column THEN
    UPDATE public.profiles 
    SET 
      full_name = COALESCE(extracted_full_name, full_name),
      updated_at = NOW()
    WHERE id = new.id;
  ELSE
    UPDATE public.profiles 
    SET 
      updated_at = NOW()
    WHERE id = new.id;
  END IF;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create/update triggers for auth integration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_update();

-- Trigger for updated_at on friendships table (use existing handle_updated_at function)
DROP TRIGGER IF EXISTS friendships_updated_at ON friendships;
CREATE TRIGGER friendships_updated_at
  BEFORE UPDATE ON friendships
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();