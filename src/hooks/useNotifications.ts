import { useEffect, useState } from 'react';
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

  useEffect(() => {
    const fetchNotifications = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('notifications')
        .select(`
          id, recipient_id, sender_id, type, post_id, read, created_at,
          sender:profiles!sender_id ( username )
        `)
        .eq('recipient_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching notifications:', error);
      } else {
        setNotifications(data || []);
      }
      setLoading(false);
    };

    fetchNotifications();
  }, []);

  return { notifications, loading };
};