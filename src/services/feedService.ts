/**
 * Feed Service
 * Handles database operations related to posts
 */

import { supabase } from '../lib/supabase';

export interface FeedItem {
  id: string;
  user_id: string;
  description: string;
  likes: number;
  created_at: string;
  updated_at: string;
  profiles: {
    username: string;
    avatar_url?: string;
  } | null;
}

export class FeedService {
  /**
   * Get all feed items ordered by most recent
   */
  static async getFeed(): Promise<FeedItem[]> {
    try {
      const { data, error } = await supabase
        .from('feed')
        .select(`
          id,
          user_id,
          description,
          likes,
          created_at,
          updated_at,
          profiles ( username, avatar_url )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching feed:', error);
        return [];
      }

      // Transform the data to match our type
      const transformedData = (data || []).map((item: any) => ({
        ...item,
        profiles: Array.isArray(item.profiles) && item.profiles.length > 0 
          ? item.profiles[0] 
          : { username: 'Unknown User', avatar_url: null }
      }));

      return transformedData;
    } catch (err) {
      console.error('Exception fetching feed:', err);
      return [];
    }
  }

  /**
   * Like a post by incrementing the like count
   */
  static async likePost(postId: string, currentLikes: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('feed')
        .update({ likes: currentLikes + 1 })
        .eq('id', postId);

      if (error) {
        console.error('Error liking post:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Exception liking post:', err);
      return false;
    }
  }

  /**
   * Get the most liked and most recent post
   */
  static async getTopPost(): Promise<FeedItem | null> {
    try {
      const { data, error } = await supabase
        .from('feed')
        .select(`
          id,
          user_id,
          description,
          likes,
          created_at,
          updated_at,
          profiles ( username, avatar_url )
        `)
        .order('likes', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching top post:', error);
        return null;
      }

      // Transform the data to match our type
      if (data) {
        return {
          ...data,
          profiles: Array.isArray(data.profiles) && data.profiles.length > 0 
            ? data.profiles[0] 
            : { username: 'Unknown User', avatar_url: null }
        };
      }

      return null;
    } catch (err) {
      console.error('Exception in getTopPost:', err);
      return null;
    }
  }
}