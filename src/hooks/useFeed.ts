/**
 * useFeed Hook
 * Custom hook for managing feed functionality
 */

import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FeedService, FeedItem } from '../services/feedService';
import { LikeService } from '../services/likeService';

export interface FeedItemWithLike extends FeedItem {
  hasLiked: boolean;
}

export function useFeed() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  /**
   * Load feed items from Supabase
   */
  const loadFeed = async () => {
      if (!user?.id) return;

      try {
        const [feedData, likedPostIds] = await Promise.all([
          FeedService.getFeed(),
          LikeService.getLikedPostIds(user.id),
        ]);

        const postIds = new Set(likedPostIds); // fast lookup

        const enrichedFeed = feedData.map(post => ({
          ...post,
          hasLiked: postIds.has(post.id),
        }));

        setPosts(enrichedFeed);
      } catch (err) {
        console.error('Error loading feed:', err);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };

  /**
     * Toggle like/unlike
     */
    const handleLikeToggle = async (postId: string, hasLiked: boolean) => {
      if (!user?.id) return;

      const success = hasLiked
        ? await LikeService.unlike(postId, user.id)
        : await LikeService.like(postId, user.id);

      if (success) {
        setPosts(prev =>
          prev.map(p =>
            p.id === postId
              ? {
                  ...p,
                  hasLiked: !hasLiked,
                  likes: p.likes + (hasLiked ? -1 : 1),
                }
              : p
          )
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
    handleLikeToggle,
    refresh,
  };
}