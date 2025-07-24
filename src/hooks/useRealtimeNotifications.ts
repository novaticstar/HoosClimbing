/**
 * useRealtimeNotifications Hook
 * Real-time notifications for friend requests and other updates
 */

import { RealtimeChannel } from '@supabase/supabase-js';
import { useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

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
  const subscriptionRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    // Create notification subscription
    const subscription = supabase
      .channel('user-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'friendships',
          filter: `friend_id=eq.${user.id}`,
        },
        async (payload) => {
          if (payload.new?.status === 'pending') {
            // Someone sent us a friend request
            await handleFriendRequestNotification(payload.new);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'friendships',
          filter: `user_id=eq.${user.id}`,
        },
        async (payload) => {
          if (payload.new?.status === 'accepted' && payload.old?.status === 'pending') {
            // Our friend request was accepted
            await handleFriendAcceptedNotification(payload.new);
          }
        }
      )
      .subscribe();

    subscriptionRef.current = subscription;

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, [user?.id]);

  const handleFriendRequestNotification = async (friendshipData: any) => {
    try {
      // Get the user who sent the request
      const { data: senderData } = await supabase
        .from('profiles')
        .select('username, full_name, email')
        .eq('id', friendshipData.user_id)
        .single();

      if (senderData) {
        const senderName = senderData.username || senderData.full_name || senderData.email?.split('@')[0] || 'Someone';
        
        const notification: Notification = {
          id: `friend_request_${friendshipData.id}`,
          type: 'friend_request',
          title: 'New Friend Request',
          message: `${senderName} wants to be your friend`,
          timestamp: new Date(),
          read: false,
          data: { userId: friendshipData.user_id, friendshipId: friendshipData.id }
        };

        addNotification(notification);

        // Show in-app notification (optional - you might want to use a toast library)
        Alert.alert(
          '👋 New Friend Request!',
          `${senderName} wants to be your friend`,
          [
            { text: 'Later', style: 'cancel' },
            { text: 'View', onPress: () => {
              // Navigate to friends tab or profile
              // You'll need to implement navigation here
            }}
          ]
        );
      }
    } catch (error) {
      console.error('Error handling friend request notification:', error);
    }
  };

  const handleFriendAcceptedNotification = async (friendshipData: any) => {
    try {
      // Get the user who accepted our request
      const { data: friendData } = await supabase
        .from('profiles')
        .select('username, full_name, email')
        .eq('id', friendshipData.friend_id)
        .single();

      if (friendData) {
        const friendName = friendData.username || friendData.full_name || friendData.email?.split('@')[0] || 'Someone';
        
        const notification: Notification = {
          id: `friend_accepted_${friendshipData.id}`,
          type: 'friend_accepted',
          title: 'Friend Request Accepted',
          message: `${friendName} accepted your friend request!`,
          timestamp: new Date(),
          read: false,
          data: { userId: friendshipData.friend_id, friendshipId: friendshipData.id }
        };

        addNotification(notification);

        // Show celebration notification
        Alert.alert(
          '🎉 Friend Request Accepted!',
          `${friendName} accepted your friend request!`,
          [
            { text: 'Great!', style: 'default' }
          ]
        );
      }
    } catch (error) {
      console.error('Error handling friend accepted notification:', error);
    }
  };

  const addNotification = (notification: Notification) => {
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const clearNotification = (notificationId: string) => {
    setNotifications(prev => {
      const notification = prev.find(n => n.id === notificationId);
      if (notification && !notification.read) {
        setUnreadCount(count => Math.max(0, count - 1));
      }
      return prev.filter(n => n.id !== notificationId);
    });
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAllNotifications,
  };
}
