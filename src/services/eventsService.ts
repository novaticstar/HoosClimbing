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

export interface CreateEventData {
  title: string;
  description: string;
  event_date: string;
  image_url?: string;
}

export class EventService {
  /**
   * Create a new event
   */
  static async createEvent(eventData: CreateEventData): Promise<EventItem | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('events')
        .insert({
          user_id: user.id,
          title: eventData.title,
          description: eventData.description,
          event_date: eventData.event_date,
          image_url: eventData.image_url,
        })
        .select(`
          id, user_id, title, description, event_date, image_url,
          profiles!user_id ( username )
        `)
        .single();

      if (error) {
        console.error('Error creating event:', error);
        return null;
      }

      return {
        ...data,
        profiles: data.profiles ? {
          username: (data.profiles as any).username,
        } : undefined,
      };
    } catch (err) {
      console.error('Exception creating event:', err);
      return null;
    }
  }

  /**
   * Upload event image to Supabase storage
   */
  static async uploadEventImage(imageUri: string, fileName: string): Promise<string | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Convert image URI to blob for upload
      const response = await fetch(imageUri);
      const blob = await response.blob();

      const filePath = `events/${user.id}/${Date.now()}-${fileName}`;

      const { data, error } = await supabase.storage
        .from('posts') // Using the same bucket for consistency
        .upload(filePath, blob, {
          contentType: blob.type,
          upsert: false,
        });

      if (error) {
        console.error('Error uploading event image:', error);
        return null;
      }

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('posts')
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (err) {
      console.error('Exception uploading event image:', err);
      return null;
    }
  }

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
      profiles: event.profiles ? {
        username: (event.profiles as any).username,
      } : undefined,
    }));
  }
}