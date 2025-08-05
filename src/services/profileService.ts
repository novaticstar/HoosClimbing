/**
 * Profile Service
 * Handles database operations related to user profiles
 */

import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import { supabase } from '../lib/supabase';

export interface UpdateProfileData {
  username?: string;
  bio?: string;
  avatar_url?: string;
}

export class ProfileService {
  /**
   * Upload profile image to Supabase storage
   */
  static async uploadProfileImage(imageUri: string, fileName: string): Promise<string | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      console.log('Starting profile image upload:', { imageUri, fileName });

      const filePath = `${user.id}/${Date.now()}-${fileName}`;
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

      console.log('Uploading to path:', filePath);

      const { data, error } = await supabase.storage
        .from('profile-pictures')
        .upload(filePath, uploadData, {
          contentType: Platform.OS === 'web' ? (uploadData as Blob).type || 'image/jpeg' : 'image/jpeg',
          upsert: false,
        });

      if (error) {
        console.error('Error uploading profile image:', error);
        return null;
      }

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(filePath);

      console.log('Profile image uploaded successfully:', urlData.publicUrl);
      return urlData.publicUrl;

    } catch (error) {
      console.error('Error in uploadProfileImage:', error);
      return null;
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(profileData: UpdateProfileData): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Update profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          ...profileData,
          updated_at: new Date().toISOString(),
        });

      if (profileError) {
        console.error('Error updating profile:', profileError);
        return false;
      }

      // Update auth metadata if username or avatar_url changed
      if (profileData.username || profileData.avatar_url) {
        const updateData: any = {};
        if (profileData.username) updateData.username = profileData.username;
        if (profileData.avatar_url) updateData.avatar_url = profileData.avatar_url;

        const { error: authError } = await supabase.auth.updateUser({
          data: updateData
        });

        if (authError) {
          console.error('Error updating auth metadata:', authError);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Error in updateProfile:', error);
      return false;
    }
  }

  /**
   * Get user profile
   */
  static async getUserProfile(userId?: string): Promise<any | null> {
    try {
      let targetUserId = userId;
      
      if (!targetUserId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;
        targetUserId = user.id;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', targetUserId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getUserProfile:', error);
      return null;
    }
  }

  /**
   * Get user's posts
   */
  static async getUserPosts(userId?: string): Promise<any[] | null> {
    try {
      let targetUserId = userId;
      
      if (!targetUserId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;
        targetUserId = user.id;
      }

      const { data, error } = await supabase
        .from('feed')
        .select(`
          id,
          description,
          image_url,
          likes,
          created_at,
          updated_at,
          profiles!inner(username, avatar_url)
        `)
        .eq('user_id', targetUserId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user posts:', error);
        return null;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getUserPosts:', error);
      return null;
    }
  }

  /**
   * Get user's events
   */
  static async getUserEvents(userId?: string): Promise<any[] | null> {
    try {
      let targetUserId = userId;
      
      if (!targetUserId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;
        targetUserId = user.id;
      }

      const { data, error } = await supabase
        .from('events')
        .select(`
          id,
          title,
          description,
          image_url,
          event_date,
          created_at,
          profiles!inner(username, avatar_url)
        `)
        .eq('user_id', targetUserId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user events:', error);
        return null;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getUserEvents:', error);
      return null;
    }
  }
}
