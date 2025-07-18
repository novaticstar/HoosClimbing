-- Seed data for testing friends functionality
-- This creates some test users to demonstrate the friend system

-- Insert some test profiles (these would normally be created via auth signup)
INSERT INTO profiles (id, email, username, full_name, created_at) VALUES
  ('11111111-1111-1111-1111-111111111111', 'alice@virginia.edu', 'alice_climber', 'Alice Johnson', NOW()),
  ('22222222-2222-2222-2222-222222222222', 'bob@virginia.edu', 'boulder_bob', 'Bob Smith', NOW()),
  ('33333333-3333-3333-3333-333333333333', 'carol@virginia.edu', 'climbing_carol', 'Carol Davis', NOW()),
  ('44444444-4444-4444-4444-444444444444', 'david@virginia.edu', 'route_finder', 'David Wilson', NOW()),
  ('55555555-5555-5555-5555-555555555555', 'emma@virginia.edu', 'peak_seeker', 'Emma Brown', NOW()),
  ('66666666-6666-6666-6666-666666666666', 'frank@virginia.edu', 'rock_crusher', 'Frank Miller', NOW()),
  ('77777777-7777-7777-7777-777777777777', 'grace@virginia.edu', 'wall_warrior', 'Grace Taylor', NOW()),
  ('88888888-8888-8888-8888-888888888888', 'henry@virginia.edu', 'crag_hunter', 'Henry Anderson', NOW())
ON CONFLICT (id) DO NOTHING;

-- Note: In a real application, you would not insert friendship data directly
-- This is just for testing purposes to show how the system works
-- Normally, friendships would be created through the app interface

-- Example friendships (commented out for safety)
-- INSERT INTO friendships (user_id, friend_id, status) VALUES
--   ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'accepted'),
--   ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'accepted'),
--   ('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'accepted'),
--   ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'accepted')
-- ON CONFLICT (user_id, friend_id) DO NOTHING;
