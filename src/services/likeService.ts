/**
 * Like Service
 * Handles like/unlike logic for posts
 */

import { supabase } from '../lib/supabase';

export class LikeService {
  /**
   * Check if the user has already liked a post
   */
  static async hasLiked(postId: string, userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error checking like status:', error);
      return false;
    }

    return !!data;
  }

  /**
   * Like a post
   */
  static async like(postId: string, userId: string): Promise<boolean> {
    const { error } = await supabase
    .from('likes')
    .insert({
      post_id: postId,
      user_id: userId,
    });

    if (error) {
      console.error('Error liking post:', error);
      return false;
    }

    return true;
  }

  /**
   * Unlike a post
   */
  static async unlike(postId: string, userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error unliking post:', error);
      return false;
    }

    return true;
  }

/**
 * Get all posts liked by user
 */
  static async getLikedPostIds(userId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('likes')
      .select('post_id')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching liked post IDs:', error);
      return [];
    }

    return data.map(row => row.post_id);
  }
}