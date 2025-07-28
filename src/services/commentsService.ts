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
  } | null;
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

      // Transform the data to match our type
      const transformedData = (data || []).map((comment: any) => ({
        ...comment,
        profiles: Array.isArray(comment.profiles) && comment.profiles.length > 0 
          ? comment.profiles[0] 
          : { username: 'Unknown User' }
      }));

      return transformedData;
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

  /**
   * Update a comment's text
   */
  static async updateComment(commentId: string, newText: string): Promise<boolean> {
    const { error } = await supabase
      .from('comments')
      .update({ text: newText })
      .eq('id', commentId);

    if (error) {
      console.error('Error updating comment:', error);
      return false;
    }
    return true;
  }

  /**
   * Delete a comment
   */
  static async deleteComment(commentId: string): Promise<boolean> {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (error) {
      console.error('Error deleting comment:', error);
      return false;
    }
    return true;
  }

  /**
   * Get three most recent comments
  */
  static async getRecentComments(postId: string): Promise<Comment[]> {
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
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) {
        console.error('Error fetching recent comments:', error);
        return [];
      }

      // Transform the data to match our type
      const transformedData = (data || []).map((comment: any) => ({
        ...comment,
        profiles: Array.isArray(comment.profiles) && comment.profiles.length > 0 
          ? comment.profiles[0] 
          : { username: 'Unknown User' }
      }));

      return transformedData;
    } catch (err) {
      console.error('Exception fetching recent comments:', err);
      return [];
    }
  }
}