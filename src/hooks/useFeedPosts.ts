/**
 * Custom hook for managing feed posts
 */

import { useCallback, useEffect, useState } from 'react';
import { CreatePostData, FeedItem, FeedService } from '../services/feedService';
import { LikeService } from '../services/likeService';
import { useAuth } from '../context/AuthContext';

export const useFeedPosts = () => {
  const [posts, setPosts] = useState<FeedItem[]>([]);
  const {user} = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [likingPosts, setLikingPosts] = useState<Set<string>>(new Set());

  const fetchPosts = useCallback(async () => {
    try {
          setLoading(true);
          setError(null);

          if (!user?.id) {
            const data = await FeedService.getFeed();
            setPosts(data.map(post => ({ ...post, hasLiked: false })));
            return;
          }

          // Get both feed data and user's liked posts
          const [feedData, likedPostIds] = await Promise.all([
            FeedService.getFeed(),
            LikeService.getLikedPostIds(user.id),
          ]);

          const likedPostsSet = new Set(likedPostIds);

          // Enrich posts with hasLiked status
          const enrichedPosts = feedData.map(post => ({
            ...post,
            hasLiked: likedPostsSet.has(post.id),
          }));

          setPosts(enrichedPosts);
        } catch (err) {
          setError('Failed to load posts');
          console.error('Error fetching posts:', err);
        } finally {
          setLoading(false);
        }
      }, [user?.id]);

  const createPost = useCallback(async (postData: CreatePostData): Promise<FeedItem | null> => {
    try {
          const newPost = await FeedService.createPost(postData);
          if (newPost) {
            // New posts start with hasLiked: false
            const enrichedPost = { ...newPost, hasLiked: false };
            setPosts(prevPosts => [enrichedPost, ...prevPosts]);
            return enrichedPost;
          }
          return newPost;
        } catch (err) {
          console.error('Error creating post:', err);
          return null;
        }
      }, []);

  const handleLikeToggle = useCallback(async (postId: string, hasLiked: boolean): Promise<boolean> => {
      if (!user?.id || likingPosts.has(postId)) {
          return false;
        }

        setLikingPosts(prev => new Set([...prev, postId]));

        // Optimistic update
        setPosts(prevPosts => {
          const updatedPosts = prevPosts.map(post =>
            post.id === postId
              ? {
                  ...post,
                  hasLiked: !hasLiked,
                  likes: post.likes + (hasLiked ? -1 : 1),
                }
              : post
          );
          return updatedPosts;
        });

        try {
          const likeSuccess = hasLiked
            ? await LikeService.unlike(postId, user.id)
            : await LikeService.like(postId, user.id);

          if (!likeSuccess) {
            // Revert optimistic update
            setPosts(prevPosts =>
              prevPosts.map(post =>
                post.id === postId
                  ? {
                      ...post,
                      hasLiked: hasLiked,
                      likes: post.likes + (hasLiked ? 1 : -1),
                    }
                  : post
              )
            );
            return false;
          }

          // Update feed table - use the calculated like count
          const newLikeCount = hasLiked ?
            (posts.find(p => p.id === postId)?.likes || 0) - 1 :
            (posts.find(p => p.id === postId)?.likes || 0) + 1;

          await FeedService.updateLikeCount(postId, newLikeCount);
          return true;
        } catch (err) {
          console.error('Error toggling like:', err);
          // Revert on error
          setPosts(prevPosts =>
            prevPosts.map(post =>
              post.id === postId
                ? {
                    ...post,
                    hasLiked: hasLiked,
                    likes: post.likes + (hasLiked ? 1 : -1),
                  }
                : post
            )
          );
          return false;
        } finally {
          setLikingPosts(prev => {
            const newSet = new Set(prev);
            newSet.delete(postId);
            return newSet;
          });
        }
      }, [user?.id, likingPosts]);

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
    handleLikeToggle,
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
