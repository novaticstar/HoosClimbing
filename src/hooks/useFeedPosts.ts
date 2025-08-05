/**
 * Custom hook for managing feed posts
 */

import { useCallback, useEffect, useState } from 'react';
import { CreatePostData, FeedItem, FeedService } from '../services/feedService';

export const useFeedPosts = () => {
  const [posts, setPosts] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await FeedService.getFeed();
      setPosts(data);
    } catch (err) {
      setError('Failed to load posts');
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createPost = useCallback(async (postData: CreatePostData): Promise<FeedItem | null> => {
    try {
      const newPost = await FeedService.createPost(postData);
      if (newPost) {
        setPosts(prevPosts => [newPost, ...prevPosts]);
      }
      return newPost;
    } catch (err) {
      console.error('Error creating post:', err);
      return null;
    }
  }, []);

  const likePost = useCallback(async (postId: string, currentLikes: number): Promise<boolean> => {
    try {
      const success = await FeedService.likePost(postId, currentLikes);
      if (success) {
        setPosts(prevPosts =>
          prevPosts.map(post =>
            post.id === postId ? { ...post, likes: post.likes + 1 } : post
          )
        );
      }
      return success;
    } catch (err) {
      console.error('Error liking post:', err);
      return false;
    }
  }, []);

  const refreshPosts = useCallback(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return {
    posts,
    loading,
    error,
    createPost,
    likePost,
    refreshPosts,
  };
};

export const useSearchUsers = (query: string) => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const searchUsers = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setUsers([]);
      return;
    }

    setLoading(true);
    try {
      const results = await FeedService.searchUsers(searchQuery);
      setUsers(results);
    } catch (err) {
      console.error('Error searching users:', err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    searchUsers(query);
  }, [query, searchUsers]);

  return {
    users,
    loading,
    searchUsers,
  };
};
