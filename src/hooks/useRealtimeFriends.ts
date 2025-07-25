/**
 * useRealtimeFriends Hook
 * Simplified and reliable friends management with optimistic updates
 */

import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FriendsService, User } from '../services/friendsService';

export function useRealtimeFriends() {
  const { user } = useAuth();
  const [friends, setFriends] = useState<User[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<User[]>([]);
  const [pendingRequests, setPendingRequests] = useState<User[]>([]);
  const [sentRequests, setSentRequests] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadFriends = async (showRefreshing = false) => {
    if (!user?.id) return;
    
    if (showRefreshing) setRefreshing(true);
    
    try {
      console.log('Loading friends data for user:', user.id);
      
      // Ensure user profile exists first
      const profileEnsured = await FriendsService.ensureUserProfile(user);
      if (!profileEnsured) {
        console.error('Failed to ensure user profile exists');
        return;
      }
      
      // Create test users if needed for development
      const allProfiles = await FriendsService.listAllProfiles();
      if (allProfiles.length < 3) {
        console.log('Creating test users for development...');
        await FriendsService.createTestUsers();
      }
      
      const [friendsData, suggestionsData, pendingData, sentData] = await Promise.all([
        FriendsService.getFriends(user.id),
        FriendsService.getSuggestedUsers(user.id, 8),
        FriendsService.getPendingRequests(user.id),
        FriendsService.getSentRequests(user.id)
      ]);

      console.log('Loaded friends data:', {
        friends: friendsData.length,
        suggestions: suggestionsData.length,
        pending: pendingData.length,
        sent: sentData.length
      });

      setFriends(friendsData);
      setSuggestedUsers(suggestionsData);
      setPendingRequests(pendingData);
      setSentRequests(sentData);
    } catch (error) {
      console.error('Error loading friends data:', error);
    } finally {
      setLoading(false);
      if (showRefreshing) setRefreshing(false);
    }
  };

  const sendFriendRequest = async (friendId: string) => {
    if (!user?.id) {
      console.error('No user ID available for sending friend request');
      return false;
    }
    
    console.log('Sending friend request from', user.id, 'to', friendId);
    
    // Find the user in suggestions
    const userToMove = suggestedUsers.find(u => u.id === friendId);
    
    // Optimistic update: Remove from suggestions immediately
    setSuggestedUsers(prev => prev.filter(u => u.id !== friendId));
    
    // Optimistic update: Add to sent requests
    if (userToMove) {
      setSentRequests(prev => [...prev, userToMove]);
    }
    
    try {
      const success = await FriendsService.sendFriendRequest(user.id, friendId);
      
      if (!success) {
        // Rollback optimistic updates if failed
        console.log('Friend request failed, rolling back optimistic updates');
        if (userToMove) {
          setSuggestedUsers(prev => [...prev, userToMove]);
          setSentRequests(prev => prev.filter(u => u.id !== friendId));
        }
      }
      
      return success;
    } catch (error) {
      console.error('Error sending friend request:', error);
      // Rollback optimistic updates
      if (userToMove) {
        setSuggestedUsers(prev => [...prev, userToMove]);
        setSentRequests(prev => prev.filter(u => u.id !== friendId));
      }
      return false;
    }
  };

  const acceptFriendRequest = async (friendId: string) => {
    if (!user?.id) return false;
    
    console.log('Accepting friend request from', friendId);
    
    // Find the user in pending requests
    const userToMove = pendingRequests.find(u => u.id === friendId);
    
    // Optimistic update: Remove from pending requests
    setPendingRequests(prev => prev.filter(u => u.id !== friendId));
    
    // Optimistic update: Add to friends
    if (userToMove) {
      setFriends(prev => [...prev, userToMove]);
    }
    
    try {
      const success = await FriendsService.acceptFriendRequest(user.id, friendId);
      
      if (!success) {
        // Rollback optimistic updates if failed
        console.log('Accept friend request failed, rolling back optimistic updates');
        if (userToMove) {
          setFriends(prev => prev.filter(u => u.id !== friendId));
          setPendingRequests(prev => [...prev, userToMove]);
        }
      }
      
      return success;
    } catch (error) {
      console.error('Error accepting friend request:', error);
      // Rollback optimistic updates
      if (userToMove) {
        setFriends(prev => prev.filter(u => u.id !== friendId));
        setPendingRequests(prev => [...prev, userToMove]);
      }
      return false;
    }
  };

  const removeFriend = async (friendId: string) => {
    if (!user?.id) return false;
    
    console.log('Removing friend', friendId);
    
    // Find the user in friends
    const userToMove = friends.find(u => u.id === friendId);
    
    // Optimistic update: Remove from friends immediately
    setFriends(prev => prev.filter(f => f.id !== friendId));
    
    // Optimistic update: Add back to suggestions
    if (userToMove) {
      setSuggestedUsers(prev => [...prev, userToMove]);
    }
    
    try {
      const success = await FriendsService.removeFriend(user.id, friendId);
      
      if (!success) {
        // Rollback optimistic updates if failed
        console.log('Remove friend failed, rolling back optimistic updates');
        if (userToMove) {
          setFriends(prev => [...prev, userToMove]);
          setSuggestedUsers(prev => prev.filter(u => u.id !== friendId));
        }
      }
      
      return success;
    } catch (error) {
      console.error('Error removing friend:', error);
      // Rollback optimistic updates
      if (userToMove) {
        setFriends(prev => [...prev, userToMove]);
        setSuggestedUsers(prev => prev.filter(u => u.id !== friendId));
      }
      return false;
    }
  };

  const cancelFriendRequest = async (friendId: string) => {
    if (!user?.id) return false;
    
    console.log('Cancelling friend request to', friendId);
    
    // Find the user in sent requests
    const userToMove = sentRequests.find(u => u.id === friendId);
    
    // Optimistic update: Remove from sent requests
    setSentRequests(prev => prev.filter(u => u.id !== friendId));
    
    // Optimistic update: Add back to suggestions
    if (userToMove) {
      setSuggestedUsers(prev => [...prev, userToMove]);
    }
    
    try {
      const success = await FriendsService.cancelFriendRequest(user.id, friendId);
      
      if (!success) {
        // Rollback optimistic updates if failed
        console.log('Cancel friend request failed, rolling back optimistic updates');
        if (userToMove) {
          setSentRequests(prev => [...prev, userToMove]);
          setSuggestedUsers(prev => prev.filter(u => u.id !== friendId));
        }
      }
      
      return success;
    } catch (error) {
      console.error('Error cancelling friend request:', error);
      // Rollback optimistic updates
      if (userToMove) {
        setSentRequests(prev => [...prev, userToMove]);
        setSuggestedUsers(prev => prev.filter(u => u.id !== friendId));
      }
      return false;
    }
  };

  const refresh = async () => {
    await loadFriends(true);
  };

  // Initial load
  useEffect(() => {
    loadFriends();
  }, [user?.id]);

  return {
    friends,
    suggestedUsers,
    pendingRequests,
    sentRequests,
    loading,
    refreshing,
    sendFriendRequest,
    acceptFriendRequest,
    removeFriend,
    cancelFriendRequest,
    refresh,
  };
}
