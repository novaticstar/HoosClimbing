/**
 * Events Service
 * Handles database operations related to events
 */

import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
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

      console.log('Starting event image upload:', { imageUri, fileName });

      const filePath = `events/${user.id}/${Date.now()}-${fileName}`;
      
      let uploadData;
      
      if (Platform.OS === 'web') {
        // Web platform - use fetch to get blob
        const response = await fetch(imageUri);
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.status}`);
        }
        uploadData = await response.blob();
        console.log('Web blob created:', { size: uploadData.size, type: uploadData.type });
      } else {
        // React Native - use FileSystem + base64-arraybuffer
        try {
          console.log('Reading file with FileSystem...');
          const base64 = await FileSystem.readAsStringAsync(imageUri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          
          console.log('Base64 read successfully, length:', base64.length);
          
          // Convert base64 to ArrayBuffer using base64-arraybuffer
          const arrayBuffer = decode(base64);
          console.log('ArrayBuffer created, byteLength:', arrayBuffer.byteLength);
          
          uploadData = arrayBuffer;
        } catch (error) {
          console.error('Error reading file:', error);
          throw new Error(`Failed to read image file: ${error}`);
        }
      }

      const { data, error } = await supabase.storage
        .from('posts') // Using the same bucket for consistency
        .upload(filePath, uploadData, {
          contentType: 'image/jpeg',
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