/**
 * Friends Service
 * Handles friend relationships and user discovery
 */

import { supabase } from '../lib/supabase';

export interface User {
  id: string;
  email: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
}

export interface Friendship {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  user: User;
  friend: User;
}

export class FriendsService {
  /**
   * Get all friends for the current user
   */
  static async getFriends(userId: string): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('friendships')
        .select(`
          friend_id,
          friend:profiles!friendships_friend_id_fkey(
            id,
            email,
            username,
            full_name,
            avatar_url,
            created_at
          )
        `)
        .eq('user_id', userId)
        .eq('status', 'accepted');

      if (error) throw error;

      return data?.map(item => item.friend as unknown as User).filter(Boolean) || [];
    } catch (error) {
      console.error('Error fetching friends:', error);
      return [];
    }
  }

  /**
   * Get suggested users to add as friends
   */
  static async getSuggestedUsers(userId: string, limit: number = 10): Promise<User[]> {
    try {
      // First, get all user IDs that are already connected (friends or pending)
      const { data: connectedUsers, error: connectError } = await supabase
        .from('friendships')
        .select('friend_id, user_id')
        .or(`user_id.eq.${userId},friend_id.eq.${userId}`);

      if (connectError) throw connectError;

      // Extract all connected user IDs
      const connectedUserIds = new Set<string>();
      connectedUsers?.forEach(friendship => {
        if (friendship.user_id === userId) {
          connectedUserIds.add(friendship.friend_id);
        } else {
          connectedUserIds.add(friendship.user_id);
        }
      });

      // Get all users except current user and connected users
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, username, full_name, avatar_url, created_at')
        .neq('id', userId)
        .limit(limit * 2); // Get more to filter out connected users

      if (error) throw error;

      // Filter out connected users and limit results
      const suggestedUsers = (data || [])
        .filter(user => !connectedUserIds.has(user.id))
        .slice(0, limit);

      return suggestedUsers;
    } catch (error) {
      console.error('Error fetching suggested users:', error);
      return [];
    }
  }

  /**
   * Send a friend request
   */
  static async sendFriendRequest(userId: string, friendId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('friendships')
        .insert({
          user_id: userId,
          friend_id: friendId,
          status: 'pending'
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error sending friend request:', error);
      return false;
    }
  }

  /**
   * Accept a friend request
   */
  static async acceptFriendRequest(userId: string, friendId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('friendships')
        .update({ status: 'accepted' })
        .eq('user_id', friendId)
        .eq('friend_id', userId)
        .eq('status', 'pending');

      if (error) throw error;

      // Create reciprocal friendship
      await supabase
        .from('friendships')
        .insert({
          user_id: userId,
          friend_id: friendId,
          status: 'accepted'
        });

      return true;
    } catch (error) {
      console.error('Error accepting friend request:', error);
      return false;
    }
  }

  /**
   * Remove a friend
   */
  static async removeFriend(userId: string, friendId: string): Promise<boolean> {
    try {
      // Remove both directions of the friendship
      await supabase
        .from('friendships')
        .delete()
        .or(`and(user_id.eq.${userId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${userId})`);

      return true;
    } catch (error) {
      console.error('Error removing friend:', error);
      return false;
    }
  }

  /**
   * Get pending friend requests (received)
   */
  static async getPendingRequests(userId: string): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('friendships')
        .select(`
          user_id,
          user:profiles!friendships_user_id_fkey(
            id,
            email,
            username,
            full_name,
            avatar_url,
            created_at
          )
        `)
        .eq('friend_id', userId)
        .eq('status', 'pending');

      if (error) throw error;

      return data?.map(item => item.user as unknown as User).filter(Boolean) || [];
    } catch (error) {
      console.error('Error fetching pending requests:', error);
      return [];
    }
  }
}
