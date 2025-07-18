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
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadFriends = async () => {
    if (!user?.id) return;
    
    try {
      const [friendsData, suggestionsData, pendingData] = await Promise.all([
        FriendsService.getFriends(user.id),
        FriendsService.getSuggestedUsers(user.id, 8),
        FriendsService.getPendingRequests(user.id)
      ]);

      setFriends(friendsData);
      setSuggestedUsers(suggestionsData);
      setPendingRequests(pendingData);
    } catch (error) {
      console.error('Error loading friends data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const sendFriendRequest = async (friendId: string) => {
    if (!user?.id) return false;
    
    const success = await FriendsService.sendFriendRequest(user.id, friendId);
    if (success) {
      // Remove from suggested users
      setSuggestedUsers(prev => prev.filter(u => u.id !== friendId));
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
    loading,
    refreshing,
    sendFriendRequest,
    acceptFriendRequest,
    removeFriend,
    refresh,
  };
}
