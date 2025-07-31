/**
 * Comment Service
 * Handles database operations related to comments, replies, and comment likes
 */

import { supabase } from '../lib/supabase';

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  text: string;
  created_at: string;
  updated_at?: string;
  parent_comment_id: string | null;
  likes: number;
  hasLiked?: boolean;
  replies?: Comment[];
  profiles: {
    username: string;
    avatar_url?: string | null;
  } | null;
}

export class CommentService {
  /**
   * Get all comments for a specific post with replies nested
   */
  static async getCommentsForPost(postId: string, userId?: string): Promise<Comment[]> {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          post_id,
          user_id,
          text,
          created_at,
          updated_at,
          parent_comment_id,
          likes,
          profiles!user_id (
            username,
            avatar_url
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching comments:', error);
        return [];
      }

      // Get comment likes for the user if provided
      let userLikedComments: Set<string> = new Set();
      if (userId) {
        const { data: likedData } = await supabase
          .from('comment_likes')
          .select('comment_id')
          .eq('user_id', userId);
        
        userLikedComments = new Set(likedData?.map(like => like.comment_id) || []);
      }

      // Transform the data and separate parent comments from replies
      const allComments = (data || []).map((comment: any) => ({
        ...comment,
        hasLiked: userLikedComments.has(comment.id),
        profiles: comment.profiles || { username: 'Unknown User', avatar_url: null },
        replies: [] as Comment[]
      }));

      // Organize comments into parent comments with nested replies
      const parentComments: Comment[] = [];
      const repliesMap: { [parentId: string]: Comment[] } = {};

      allComments.forEach(comment => {
        if (comment.parent_comment_id === null) {
          parentComments.push(comment);
        } else {
          if (!repliesMap[comment.parent_comment_id]) {
            repliesMap[comment.parent_comment_id] = [];
          }
          repliesMap[comment.parent_comment_id].push(comment);
        }
      });

      // Attach replies to their parent comments
      parentComments.forEach(parentComment => {
        parentComment.replies = repliesMap[parentComment.id] || [];
      });

      return parentComments;
    } catch (err) {
      console.error('Exception fetching comments:', err);
      return [];
    }
  }

  /**
   * Add a new comment or reply to a post
   */
  static async addComment(postId: string, userId: string, text: string, parentCommentId?: string): Promise<boolean> {
    try {
      const { error } = await supabase.from('comments').insert([
        {
          post_id: postId,
          user_id: userId,
          text,
          parent_comment_id: parentCommentId || null,
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
   * Get three most recent comments (parent comments only)
   */
  static async getRecentComments(postId: string, userId?: string): Promise<Comment[]> {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          post_id,
          user_id,
          text,
          created_at,
          updated_at,
          parent_comment_id,
          likes,
          profiles!user_id (
            username,
            avatar_url
          )
        `)
        .eq('post_id', postId)
        .is('parent_comment_id', null) // Only get parent comments
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) {
        console.error('Error fetching recent comments:', error);
        return [];
      }

      // Get comment likes for the user if provided
      let userLikedComments: Set<string> = new Set();
      if (userId) {
        const { data: likedData } = await supabase
          .from('comment_likes')
          .select('comment_id')
          .eq('user_id', userId);
        
        userLikedComments = new Set(likedData?.map(like => like.comment_id) || []);
      }

      // Transform the data to match our type
      const transformedData = (data || []).map((comment: any) => ({
        ...comment,
        hasLiked: userLikedComments.has(comment.id),
        profiles: comment.profiles || { username: 'Unknown User', avatar_url: null },
        replies: [] as Comment[]
      }));

      return transformedData;
    } catch (err) {
      console.error('Exception fetching recent comments:', err);
      return [];
    }
  }

  /**
   * Like or unlike a comment
   */
  static async toggleCommentLike(commentId: string, userId: string): Promise<boolean> {
    try {
      // Check if user already liked the comment
      const { data: existingLike } = await supabase
        .from('comment_likes')
        .select('id')
        .eq('comment_id', commentId)
        .eq('user_id', userId)
        .maybeSingle();

      if (existingLike) {
        // Unlike the comment
        const { error } = await supabase
          .from('comment_likes')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', userId);

        if (error) {
          console.error('Error unliking comment:', error);
          return false;
        }
      } else {
        // Like the comment
        const { error } = await supabase
          .from('comment_likes')
          .insert([{
            comment_id: commentId,
            user_id: userId,
          }]);

        if (error) {
          console.error('Error liking comment:', error);
          return false;
        }
      }

      return true;
    } catch (err) {
      console.error('Exception toggling comment like:', err);
      return false;
    }
  }

  /**
   * Get replies for a specific comment
   */
  static async getRepliesForComment(commentId: string, userId?: string): Promise<Comment[]> {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          post_id,
          user_id,
          text,
          created_at,
          updated_at,
          parent_comment_id,
          likes,
          profiles!user_id (
            username,
            avatar_url
          )
        `)
        .eq('parent_comment_id', commentId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching replies:', error);
        return [];
      }

      // Get comment likes for the user if provided
      let userLikedComments: Set<string> = new Set();
      if (userId) {
        const { data: likedData } = await supabase
          .from('comment_likes')
          .select('comment_id')
          .eq('user_id', userId);
        
        userLikedComments = new Set(likedData?.map(like => like.comment_id) || []);
      }

      // Transform the data to match our type
      const transformedData = (data || []).map((comment: any) => ({
        ...comment,
        hasLiked: userLikedComments.has(comment.id),
        profiles: comment.profiles || { username: 'Unknown User', avatar_url: null },
        replies: [] as Comment[]
      }));

      return transformedData;
    } catch (err) {
      console.error('Exception fetching replies:', err);
      return [];
    }
  }
}