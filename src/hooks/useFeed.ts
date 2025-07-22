/**
 * useFeed Hook
 * Custom hook for managing feed functionality
 */

import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FeedService, FeedItem } from '../services/feedService';

export function useFeed() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  /**
   * Load feed items from Supabase
   */
  const loadFeed = async () => {
    try {
      const data = await FeedService.getFeed();
      setPosts(data);
    } catch (err) {
      console.error('Error loading feed:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /**
   * Like a post and update the UI
   */
  const likePost = async (postId: string, currentLikes: number) => {
    const success = await FeedService.likePost(postId, currentLikes);
    if (success) {
      setPosts(prev =>
        prev.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p)
      );
    }
  };

  /**
   * Manually refresh the feed
   */
  const refresh = async () => {
    setRefreshing(true);
    await loadFeed();
  };

  useEffect(() => {
    loadFeed();
  }, [user?.id]);

  return {
    posts,
    loading,
    refreshing,
    likePost,
    refresh,
  };
}