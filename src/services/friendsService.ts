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
   * Debug function to list all profiles in the database
   */
  static async listAllProfiles(): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(20);
        
      if (error) {
        console.error('Error listing profiles:', error);
        return [];
      }
      
      console.log('All profiles in database:', data);
      return data || [];
    } catch (error) {
      console.error('Exception listing profiles:', error);
      return [];
    }
  }

  /**
   * Create test users for development
   */
  static async createTestUsers(): Promise<boolean> {
    try {
      const testUsers = [
        {
          id: '11111111-1111-1111-1111-111111111111',
          email: 'alice@test.com',
          username: 'alice_climber',
          full_name: 'Alice Johnson'
        },
        {
          id: '22222222-2222-2222-2222-222222222222',
          email: 'bob@test.com',
          username: 'boulder_bob',
          full_name: 'Bob Smith'
        },
        {
          id: '33333333-3333-3333-3333-333333333333',
          email: 'carol@test.com',
          username: 'climbing_carol',
          full_name: 'Carol Davis'
        }
      ];

      for (const user of testUsers) {
        const { error } = await supabase
          .from('profiles')
          .upsert(user, { onConflict: 'id' });
          
        if (error) {
          console.error('Error creating test user:', user.username, error);
        } else {
          console.log('Created test user:', user.username);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Exception creating test users:', error);
      return false;
    }
  }

  /**
   * Ensure user profile exists (manual fallback)
   */
  static async ensureUserProfile(user: any): Promise<boolean> {
    try {
      console.log('Ensuring user profile exists for:', user.id);
      
      // Check if profile exists with better error handling
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('id', user.id)
        .maybeSingle(); // Use maybeSingle() instead of single() to avoid 406 errors
        
      if (existingProfile) {
        console.log('Profile already exists');
        return true;
      }
      
      if (checkError) {
        console.error('Error checking profile:', checkError);
        return false;
      }
      
      // Also check if email already exists (in case profile was created with different ID)
      const { data: emailProfile, error: emailError } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('email', user.email)
        .maybeSingle();
        
      if (emailProfile) {
        console.log('Profile with this email already exists, different user ID');
        // Email is already used by another profile, we can't create a duplicate
        // This might happen in edge cases, just return true since a profile exists
        return true;
      }
      
      if (emailError) {
        console.error('Error checking email profile:', emailError);
        return false;
      }
      
      // Create profile if it doesn't exist
      const baseUsername = user.user_metadata?.username || user.email?.split('@')[0] || 'user';
      const full_name = user.user_metadata?.full_name || user.user_metadata?.name || baseUsername;
      
      // Make username unique by appending user ID suffix
      const username = `${baseUsername}_${user.id.slice(-8)}`;
      
      // Try to insert (not upsert) since we've already checked for existence
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
        
        // Handle specific constraint violations
        if (error.code === '23505') {
          if (error.message.includes('profiles_email_key')) {
            console.log('Email already exists, profile creation skipped');
            return true; // Email exists, consider it successful
          } else if (error.message.includes('profiles_username_key')) {
            console.log('Username conflict, trying without username...');
            const { data: data2, error: error2 } = await supabase
              .from('profiles')
              .insert({
                id: user.id,
                email: user.email,
                full_name: full_name
              });
              
            if (error2) {
              console.error('Error creating profile without username:', error2);
              if (error2.code === '23505' && error2.message.includes('profiles_email_key')) {
                console.log('Email still exists, considering successful');
                return true;
              }
              return false;
            }
            console.log('Profile created without username:', data2);
            return true;
          }
        }
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
        .maybeSingle(); // Use maybeSingle() to avoid 406 errors
        
      if (error) {
        console.error('Error checking user profile:', error);
        return { exists: false };
      }
      
      if (data) {
        console.log('User profile found:', data);
        return { exists: true, profile: data };
      } else {
        console.log('User profile not found');
        return { exists: false };
      }
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
      console.log('Suggested user IDs:', suggestedUsers.map(u => u.id));

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
      
      console.log('Found profiles:', profiles);
      console.log('Looking for user IDs:', [userId, friendId]);
      
      if (!profiles || profiles.length !== 2) {
        console.error('One or both users not found in profiles table');
        console.error('Found profiles count:', profiles?.length || 0);
        console.error('Found profile IDs:', profiles?.map(p => p.id) || []);
        
        // Let's check each user individually
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', userId)
          .maybeSingle();
          
        const { data: friendProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', friendId)
          .maybeSingle();
          
        console.log('Current user profile exists:', !!userProfile);
        console.log('Friend profile exists:', !!friendProfile);
        
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
