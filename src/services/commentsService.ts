/**
 * Comment Service
 * Handles database operations related to comments
 */

import { supabase } from '../lib/supabase';

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  text: string;
  created_at: string;
  profiles: {
    username: string;
  };
}

export class CommentService {
  /**
   * Get all comments for a specific post
   */
  static async getCommentsForPost(postId: string): Promise<Comment[]> {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          post_id,
          user_id,
          text,
          created_at,
          profiles ( username )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching comments:', error);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error('Exception fetching comments:', err);
      return [];
    }
  }

  /**
   * Add a comment to a post
   */
  static async addComment(postId: string, userId: string, text: string): Promise<boolean> {
    try {
      const { error } = await supabase.from('comments').insert([
        {
          post_id: postId,
          user_id: userId,
          text,
        },
      ]);

      if (error) {
        console.error('Error adding comment:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Exception adding comment:', err);
      return false;
    }
  }
}