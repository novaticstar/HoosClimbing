import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface NotificationItem {
  id: string;
  recipient_id: string;
  sender_id: string;
  type: string;
  post_id?: string;
  read: boolean;
  created_at: string;
  sender?: { username: string };
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('notifications')
      .select(`
        id, recipient_id, sender_id, type, post_id, read, created_at,
        sender:profiles!notifications_sender_id_fkey (username)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notifications:', error);
    } else {
      setNotifications(data ?? []);
    }
    setLoading(false);
  }, []);

  const markAllAsRead = useCallback(async () => {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('read', false); // only update unread

      if (error) {
        console.error('Failed to mark notifications as read:', error);
      } else {
        await fetchNotifications();
      }
    }, [fetchNotifications]);

  const refreshNotifications = fetchNotifications;

  useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

  return { notifications, loading, markAllAsRead, refreshNotifications };
};