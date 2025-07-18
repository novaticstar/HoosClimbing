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
   * Ensure user profile exists (manual fallback)
   */
  static async ensureUserProfile(user: any): Promise<boolean> {
    try {
      console.log('Ensuring user profile exists for:', user.id);
      
      // Check if profile exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();
        
      if (existingProfile) {
        console.log('Profile already exists');
        return true;
      }
      
      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('Error checking profile:', checkError);
        return false;
      }
      
      // Create profile if it doesn't exist
      const username = user.user_metadata?.username || user.email?.split('@')[0] || 'user';
      const full_name = user.user_metadata?.full_name || user.user_metadata?.name || username;
      
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          username: username,
          full_name: full_name
        });
        
      if (error) {
        console.error('Error creating profile:', error);
        return false;
      }
      
      console.log('Profile created successfully:', data);
      return true;
    } catch (error) {
      console.error('Exception ensuring user profile:', error);
      return false;
    }
  }

  /**
   * Test database connectivity and user profile existence
   */
  static async testUserProfile(userId: string): Promise<{ exists: boolean; profile?: any }> {
    try {
      console.log('Testing profile for user:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error) {
        console.error('Error checking user profile:', error);
        return { exists: false };
      }
      
      console.log('User profile found:', data);
      return { exists: true, profile: data };
    } catch (error) {
      console.error('Exception checking user profile:', error);
      return { exists: false };
    }
  }

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
      console.log('Getting suggested users for:', userId);
      
      // First, get all user IDs that are already connected (friends or pending)
      const { data: connectedUsers, error: connectError } = await supabase
        .from('friendships')
        .select('friend_id, user_id')
        .or(`user_id.eq.${userId},friend_id.eq.${userId}`);

      if (connectError) {
        console.error('Error fetching connected users:', connectError);
        throw connectError;
      }

      console.log('Connected users:', connectedUsers);

      // Extract all connected user IDs
      const connectedUserIds = new Set<string>();
      connectedUsers?.forEach(friendship => {
        if (friendship.user_id === userId) {
          connectedUserIds.add(friendship.friend_id);
        } else {
          connectedUserIds.add(friendship.user_id);
        }
      });

      console.log('Connected user IDs:', Array.from(connectedUserIds));

      // Get all users except current user and connected users
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, username, full_name, avatar_url, created_at')
        .neq('id', userId)
        .limit(limit * 2); // Get more to filter out connected users

      if (error) {
        console.error('Error fetching profiles:', error);
        throw error;
      }

      console.log('All profiles found:', data?.length || 0);
      data?.forEach(profile => {
        console.log('Profile:', profile.username || profile.email, profile.id);
      });

      // Filter out connected users and limit results
      const suggestedUsers = (data || [])
        .filter(user => !connectedUserIds.has(user.id))
        .slice(0, limit);

      console.log('Suggested users after filtering:', suggestedUsers.length);

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
      console.log('Sending friend request from', userId, 'to', friendId);
      
      // First check if both users exist in profiles table
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .in('id', [userId, friendId]);
        
      if (profileError) {
        console.error('Error checking profiles:', profileError);
        return false;
      }
      
      if (!profiles || profiles.length !== 2) {
        console.error('One or both users not found in profiles table');
        return false;
      }
      
      // Check if friendship already exists
      const { data: existingFriendship, error: checkError } = await supabase
        .from('friendships')
        .select('id, status')
        .or(`and(user_id.eq.${userId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${userId})`)
        .limit(1);
        
      if (checkError) {
        console.error('Error checking existing friendship:', checkError);
        return false;
      }
      
      if (existingFriendship && existingFriendship.length > 0) {
        console.error('Friendship already exists with status:', existingFriendship[0].status);
        return false;
      }
      
      const { data, error } = await supabase
        .from('friendships')
        .insert({
          user_id: userId,
          friend_id: friendId,
          status: 'pending'
        });

      if (error) {
        console.error('Detailed error sending friend request:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }
      
      console.log('Friend request sent successfully:', data);
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

  /**
   * Get sent friend requests (outgoing requests)
   */
  static async getSentRequests(userId: string): Promise<User[]> {
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
        .eq('status', 'pending');

      if (error) throw error;

      return data?.map(item => item.friend as unknown as User).filter(Boolean) || [];
    } catch (error) {
      console.error('Error fetching sent requests:', error);
      return [];
    }
  }

  /**
   * Cancel a sent friend request
   */
  static async cancelFriendRequest(userId: string, friendId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('user_id', userId)
        .eq('friend_id', friendId)
        .eq('status', 'pending');

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error cancelling friend request:', error);
      return false;
    }
  }
}
