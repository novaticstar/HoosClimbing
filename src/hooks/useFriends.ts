/**
 * useFriends Hook
 * Custom hook for managing friends functionality
 */

import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FriendsService, User } from '../services/friendsService';

export function useFriends() {
  const { user } = useAuth();
  const [friends, setFriends] = useState<User[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<User[]>([]);
  const [pendingRequests, setPendingRequests] = useState<User[]>([]);
  const [sentRequests, setSentRequests] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  const sendFriendRequest = async (friendId: string) => {
    if (!user?.id) {
      console.error('No user ID available for sending friend request');
      return false;
    }
    
    console.log('useFriends: Sending friend request from', user.id, 'to', friendId);
    const success = await FriendsService.sendFriendRequest(user.id, friendId);
    if (success) {
      // Remove from suggested users and add to sent requests
      setSuggestedUsers(prev => prev.filter(u => u.id !== friendId));
      await loadFriends(); // Refresh to show in sent requests
    }
    return success;
  };

  const cancelFriendRequest = async (friendId: string) => {
    if (!user?.id) return false;
    
    const success = await FriendsService.cancelFriendRequest(user.id, friendId);
    if (success) {
      // Remove from sent requests and refresh suggestions
      await loadFriends(); 
    }
    return success;
  };

  const acceptFriendRequest = async (friendId: string) => {
    if (!user?.id) return false;
    
    const success = await FriendsService.acceptFriendRequest(user.id, friendId);
    if (success) {
      await loadFriends(); // Refresh all data
    }
    return success;
  };

  const removeFriend = async (friendId: string) => {
    if (!user?.id) return false;
    
    const success = await FriendsService.removeFriend(user.id, friendId);
    if (success) {
      setFriends(prev => prev.filter(f => f.id !== friendId));
      // Add back to suggestions
      await loadFriends();
    }
    return success;
  };

  const refresh = async () => {
    setRefreshing(true);
    await loadFriends();
  };

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
