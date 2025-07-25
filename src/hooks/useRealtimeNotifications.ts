/**
 * useRealtimeNotifications Hook
 * Simplified notifications for friend requests
 */

import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FriendsService } from '../services/friendsService';

export interface Notification {
  id: string;
  type: 'friend_request' | 'friend_accepted' | 'new_message';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  data?: any;
}

export function useRealtimeNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadUnreadCount = async () => {
    if (!user?.id) return;
    
    try {
      const pendingRequests = await FriendsService.getPendingRequests(user.id);
      setUnreadCount(pendingRequests.length);
      
      // Create simple notifications for pending requests
      const newNotifications = pendingRequests.map(request => ({
        id: `friend_request_${request.id}`,
        type: 'friend_request' as const,
        title: 'Friend Request',
        message: `${request.full_name || 'Someone'} sent you a friend request`,
        timestamp: new Date(),
        read: false,
        data: { userId: request.id }
      }));
      
      setNotifications(newNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
    setUnreadCount(0);
  };

  const clearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  // Load initial count
  useEffect(() => {
    loadUnreadCount();
  }, [user?.id]);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    refresh: loadUnreadCount,
  };
}
