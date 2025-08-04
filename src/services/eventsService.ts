/**
 * Events Service
 * Handles database operations related to events
 */

import { supabase } from '../lib/supabase';

export interface EventItem {
  id: string;
  user_id: string;
  title: string;
  description: string;
  event_date: string;
  image_url?: string | null;
  profiles?: {
    username: string;
  };
}

export class EventService {
  static async getEvents(): Promise<EventItem[]> {
    const { data, error } = await supabase
      .from('events')
      .select(`
        id, user_id, title, description, event_date, image_url,
        profiles!user_id ( username )
      `)
      .order('event_date', { ascending: true });

    if (error) {
      console.error('Error loading events:', error);
      return [];
    }

    return (data || []).map(event => ({
      ...event,
      image_url: event.image_url, // already a full signed URL
    }));
  }
}