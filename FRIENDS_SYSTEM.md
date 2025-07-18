# Friends System Implementation

## Overview

The HoosClimbing app now includes a comprehensive friend system that allows users to:
- View their current friends
- Discover new users to add as friends
- Send and receive friend requests
- Accept or decline friend requests
- Remove existing friends

## Components

### 1. Database Schema (`database/002_create_friends_tables.sql`)

- **profiles**: Extends Supabase auth.users with additional user information
- **friendships**: Manages friend relationships with status tracking
- **RLS Policies**: Ensures users can only see appropriate data
- **Triggers**: Automatically create profiles and update timestamps

### 2. Friends Service (`src/services/friendsService.ts`)

Handles all friend-related database operations:
- `getFriends()`: Get accepted friends for a user
- `getSuggestedUsers()`: Get users who aren't friends yet
- `sendFriendRequest()`: Send a friend request
- `acceptFriendRequest()`: Accept an incoming request
- `removeFriend()`: Remove a friendship
- `getPendingRequests()`: Get incoming friend requests

### 3. Friends Hook (`src/hooks/useFriends.ts`)

React hook that provides:
- State management for friends, suggestions, and pending requests
- Loading and refreshing states
- Methods to interact with the friends service
- Automatic data fetching and updates

### 4. Friend Card Component (`src/components/FriendCard.tsx`)

Displays individual users with appropriate actions:
- **Friend mode**: Shows friends with options menu
- **Suggestion mode**: Shows add friend button
- **Pending mode**: Shows accept friend button
- User avatar with initials
- Responsive design

### 5. Updated Home Screen (`src/screens/HomeScreen.tsx`)

Enhanced friends section that:
- Shows friends if the user has any
- Shows suggested users if the user has no friends
- Displays pending friend requests with badge
- Pull-to-refresh functionality
- Loading states

## Features

### Friend Discovery

When users have no friends, the system shows suggested users based on:
- Other users in the app
- Excludes users who are already friends
- Excludes users with pending requests

### Friend Requests

- Users can send friend requests to other users
- Recipients see pending requests with a badge
- Requests can be accepted or implicitly declined
- Accepted requests create bidirectional friendships

### Friend Management

- Users can view all their friends
- Friends can be removed through the interface
- Removed friends return to the suggestions pool

## UI/UX Features

### Visual Indicators

- **Badge**: Shows number of pending friend requests
- **Icons**: Different action buttons for each user type
- **Avatars**: User initials in colored circles
- **Loading states**: Skeleton placeholders during data fetch

### Responsive Design

- Horizontal scrolling for friend lists
- Touch-friendly button sizes
- Consistent UVA branding colors
- Proper spacing and typography

## Database Schema

```sql
-- profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- friendships table
CREATE TABLE friendships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  friend_id UUID REFERENCES profiles(id) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT no_self_friendship CHECK (user_id != friend_id),
  CONSTRAINT unique_friendship UNIQUE (user_id, friend_id)
);
```

## Security

- Row Level Security (RLS) enabled on all tables
- Users can only see their own friendships and public profiles
- Friendship operations require proper authentication
- Input validation prevents self-friending and duplicates

## Future Enhancements

1. **Search functionality**: Allow users to search for specific users
2. **Friend recommendations**: Algorithm-based friend suggestions
3. **Mutual friends**: Show mutual connections
4. **Activity feed**: Show friend activity in main feed
5. **Push notifications**: Real-time friend request notifications
6. **Privacy settings**: Control who can send friend requests

## Testing

To test the friend system:

1. Create multiple user accounts through the signup flow
2. Log in as different users to send friend requests
3. Accept/decline requests to see the system in action
4. Use the seed data file for quick testing with pre-created users

## Implementation Notes

- The system uses Supabase's real-time capabilities for potential future updates
- All database operations are optimized with proper indexing
- Error handling provides user-friendly feedback
- The design is mobile-first and touch-friendly
- Loading states prevent UI freezing during network requests
