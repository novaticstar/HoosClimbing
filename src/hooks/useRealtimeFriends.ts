/**
 * useRealtimeFriends Hook
 * Real-time friends management with Supabase subscriptions
 */

import { RealtimeChannel } from '@supabase/supabase-js';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { FriendsService, User } from '../services/friendsService';

export function useRealtimeFriends() {
  const { user } = useAuth();
  const [friends, setFriends] = useState<User[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<User[]>([]);
  const [pendingRequests, setPendingRequests] = useState<User[]>([]);
  const [sentRequests, setSentRequests] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Keep track of subscriptions
  const subscriptionRef = useRef<RealtimeChannel | null>(null);

  const loadFriends = async () => {
    if (!user?.id) return;
    
    try {
      // Ensure user profile exists first
      const profileEnsured = await FriendsService.ensureUserProfile(user);
      if (!profileEnsured) {
        console.error('Failed to ensure user profile exists');
        setLoading(false);
        setRefreshing(false);
        return;
      }
      
      // Debug: List all profiles and create test users if needed
      const allProfiles = await FriendsService.listAllProfiles();
      console.log('Total profiles in database:', allProfiles.length);
      
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

      setFriends(friendsData);
      setSuggestedUsers(suggestionsData);
      setPendingRequests(pendingData);
      setSentRequests(sentData);
    } catch (error) {
      console.error('Error loading friends data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Real-time subscription setup
  useEffect(() => {
    if (!user?.id) return;

    // Create a subscription to the friendships table
    const subscription = supabase
      .channel('friendships-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'friendships',
          filter: `user_id=eq.${user.id},friend_id=eq.${user.id}`, // Listen to changes involving this user
        },
        (payload) => {
          console.log('Real-time friendship change:', payload);
          handleFriendshipChange(payload);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
        },
        (payload) => {
          console.log('Real-time profile change:', payload);
          handleProfileChange(payload);
        }
      )
      .subscribe();

    subscriptionRef.current = subscription;

    // Cleanup subscription on unmount
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, [user?.id]);

  const handleFriendshipChange = async (payload: any) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    switch (eventType) {
      case 'INSERT':
        // New friend request received or sent
        if (newRecord.friend_id === user?.id && newRecord.status === 'pending') {
          // Someone sent us a friend request
          await refreshPendingRequests();
        } else if (newRecord.user_id === user?.id && newRecord.status === 'pending') {
          // We sent a friend request
          await refreshSentRequests();
        } else if (newRecord.status === 'accepted') {
          // Friend request was accepted
          await loadFriends(); // Refresh all data
        }
        break;
        
      case 'UPDATE':
        // Friend request status changed
        if (newRecord.status === 'accepted') {
          // Friend request accepted
          await loadFriends();
        } else if (newRecord.status === 'rejected') {
          // Friend request rejected
          await refreshPendingRequests();
          await refreshSentRequests();
        }
        break;
        
      case 'DELETE':
        // Friendship removed or request cancelled
        await loadFriends();
        break;
    }
  };

  const handleProfileChange = async (payload: any) => {
    // If someone updates their profile, we might need to refresh suggestions
    // This is less critical but can help keep user data fresh
    const { eventType, new: newRecord } = payload;
    
    if (eventType === 'INSERT') {
      // New user joined, refresh suggestions
      await refreshSuggestions();
    } else if (eventType === 'UPDATE') {
      // User updated their profile, update if they're in our lists
      updateUserInLists(newRecord);
    }
  };

  const refreshPendingRequests = async () => {
    if (!user?.id) return;
    try {
      const pendingData = await FriendsService.getPendingRequests(user.id);
      setPendingRequests(pendingData);
    } catch (error) {
      console.error('Error refreshing pending requests:', error);
    }
  };

  const refreshSentRequests = async () => {
    if (!user?.id) return;
    try {
      const sentData = await FriendsService.getSentRequests(user.id);
      setSentRequests(sentData);
    } catch (error) {
      console.error('Error refreshing sent requests:', error);
    }
  };

  const refreshSuggestions = async () => {
    if (!user?.id) return;
    try {
      const suggestionsData = await FriendsService.getSuggestedUsers(user.id, 8);
      setSuggestedUsers(suggestionsData);
    } catch (error) {
      console.error('Error refreshing suggestions:', error);
    }
  };

  const updateUserInLists = (updatedUser: User) => {
    // Update the user's info across all lists if they exist
    const updateUserInArray = (users: User[]) =>
      users.map(u => u.id === updatedUser.id ? { ...u, ...updatedUser } : u);

    setFriends(prev => updateUserInArray(prev));
    setSuggestedUsers(prev => updateUserInArray(prev));
    setPendingRequests(prev => updateUserInArray(prev));
    setSentRequests(prev => updateUserInArray(prev));
  };

  const sendFriendRequest = async (friendId: string) => {
    if (!user?.id) {
      console.error('No user ID available for sending friend request');
      return false;
    }
    
    console.log('useRealtimeFriends: Sending friend request from', user.id, 'to', friendId);
    const success = await FriendsService.sendFriendRequest(user.id, friendId);
    
    if (success) {
      // Remove from suggested users immediately for better UX
      setSuggestedUsers(prev => prev.filter(u => u.id !== friendId));
      // Real-time subscription will handle adding to sent requests
    }
    return success;
  };

  const cancelFriendRequest = async (friendId: string) => {
    if (!user?.id) return false;
    
    const success = await FriendsService.cancelFriendRequest(user.id, friendId);
    // Real-time subscription will handle UI updates
    return success;
  };

  const acceptFriendRequest = async (friendId: string) => {
    if (!user?.id) return false;
    
    const success = await FriendsService.acceptFriendRequest(user.id, friendId);
    // Real-time subscription will handle UI updates
    return success;
  };

  const removeFriend = async (friendId: string) => {
    if (!user?.id) return false;
    
    const success = await FriendsService.removeFriend(user.id, friendId);
    // Real-time subscription will handle UI updates
    return success;
  };

  const refresh = async () => {
    setRefreshing(true);
    await loadFriends();
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
