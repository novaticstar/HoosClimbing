# Feed System Implementation

## Overview

The HoosClimbing app includes a social feed system that allows users to:
- Create and share text-based posts (with future support for photos/videos)
- View posts in reverse chronological order
- Like or unlike posts (one like per user)
- Add, edit, and delete their own comments on posts
- See the top-liked post highlighted on the Home screen

## Components

### 1. Database Schema (`database/002_create_feed_table.sql`)

- **feed**: Stores all posts with metadata like description, likes, timestamps, and user_id
- **comments**: Stores all comments related to posts, with editing and deletion support
- **likes**: Stores likes as a join between users and posts to prevent multiple likes per user
- **RLS Policies**: Ensure users can only see and edit the appropriate data
- **Triggers**: Automatically update feed posts, likes, and comments


### 2. Feed Service (`src/services/feedService.ts`)

Handles all feed-related database operations:
- `getFeed()`: Fetches all posts with user profiles and like info
- `likePost()`: Increments a post’s like count via likes table triggers
- `getTopPost()`: Fetches the most recent post with the most likes

### 3. Like Service (`src/services/likeService.ts`)

Provides logic for toggling likes:
- `hasLiked()`: Checks if the current user liked the post
- `like()`: Inserts a like entry (if not already liked)
- `unlike()`: Deletes a like entry
- `getLikedPostIds()`: Retrieves all liked post IDs for a user

### 4. Comments Service (`src/services/commentsService.ts`)

Handles all comment-related operations:
- `getCommentsForPost()`: Fetches all comments for a post
- `addComment()`: Adds a new comment to a post
- `updateComment()`: Edits a user’s own comment
- `deleteComment()`: Deletes a user’s own comment
- `getRecentComments()`: Fetches the 3 most recent comments

### 5. Feed Hook (`src/hooks/useFeed.ts`)

React hook that provides:
- All posts and their state
- `handleLikeToggle()` to like/unlike posts
- `refresh()` to reload feed
- Efficient updates on interactions

### 6. Feed Card Component (`src/components/FeedCard.tsx`)

Displays each post with:
- Username
- Post content
- Like and comment buttons
- Comments preview (top 3 shown initially)
- Expandable comment section
- Real-time comment edit/delete tools

### 7. Comments Section Component (`src/components/CommentSection.tsx`)

Displays and manages comments per post:
- Shows top 3 comments by default
- Expandable to full list
- Includes time-ago timestamps (e.g., “2 hours ago”)
- Includes user-specific edit/delete tools
- Includes built-in form for adding new comments

### 8. Feed Screen (`src/screens/FeedScreen.tsx`)

Displays the full feed:
- Renders FeedCard for each post
- Displays in reverse chronological order
- Supports pull-to-refresh behavior

### 9. Updated Home Screen (`src/screens/HomeScreen.tsx`)

Highlights the top post by likes:
- Shows username and description (no comments)
- Enabled button to navigate to Feed from pop-up

## Features

### Likes System

- Users are only allowed to like a post once
- Like count is updated in real-time
- Users can like and unlike a post with real-time, visual feedback

### Comment Management

- Users can add, edit, and delete their own comments
- Users can see edit and delete buttons with icons on just their own comments
- Each comment has time-relative timestamps (e.g., "5 minutes ago")

## Database Schema

```sql
-- Create feed table
create table if not exists public.feed (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles on delete cascade,
  description text,
  likes integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create comments table
create table if not exists public.comments (
  id uuid primary key default uuid_generate_v4(),
  post_id uuid references public.feed on delete cascade,
  user_id uuid references public.profiles on delete cascade,
  text text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create likes table
create table if not exists public.likes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles on delete cascade,
  post_id uuid references public.feed on delete cascade,
  created_at timestamptz default now(),
  unique (user_id, post_id)
);
```

## Security

- Row Level Security (RLS) enabled on all tables
- Authenticated users can:
  - View all posts and comments
  - Like/unlike posts once
  - Modify their own content (posts or comments)

## Getting Started

1. **Run SQL Migration in Supabase**:
   - Go to same Supabase project used to create user authentification and profiles
   - Run the SQL migration in `database/002_create_feed_table.sql`

2. **Install Dependency**:
   ```bash
   npm install date-fns
   ```

3. ***Run the App***:
   ```bash
   npm start
   ```

## Implementation Notes

- Uses date-fns for human-readable timestamps (x minutes ago)
- All likes and comments are reactive due to Supabase triggers
- Optimized for mobile viewing and real-time interaction
- Edit and delete buttons are only visible to comment authors

## Future Enhancements

- Add image/video uploads for posts
- Push notifications for new comments
- Privacy settings so only friends can view posts