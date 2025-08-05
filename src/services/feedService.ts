/**
 * Feed Service
 * Handles database operations related to posts
 */

import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import { supabase } from '../lib/supabase';

export interface FeedItem {
  id: string;
  user_id: string;
  description: string;
  image_url?: string | null;
  likes: number;
  created_at: string;
  updated_at: string;
  profiles: {
    username: string;
    avatar_url?: string;
  } | null;
}

export interface CreatePostData {
  description: string;
  image_url?: string;
  tagged_users?: string[]; // Array of user IDs to tag
}

export interface TaggedUser {
  id: string;
  username: string;
  avatar_url?: string;
}

export class FeedService {
  /**
   * Create a new post
   */
  static async createPost(postData: CreatePostData): Promise<FeedItem | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Create the post
      const { data: post, error: postError } = await supabase
        .from('feed')
        .insert({
          user_id: user.id,
          description: postData.description,
          image_url: postData.image_url,
        })
        .select(`
          id,
          user_id,
          description,
          image_url,
          likes,
          created_at,
          updated_at,
          profiles!user_id ( username, avatar_url )
        `)
        .single();

      if (postError) {
        console.error('Error creating post:', postError);
        return null;
      }

      // Tag users if provided
      if (postData.tagged_users && postData.tagged_users.length > 0) {
        const tagData = postData.tagged_users.map(userId => ({
          post_id: post.id,
          user_id: userId,
          tagged_by: user.id,
        }));

        const { error: tagError } = await supabase
          .from('post_tags')
          .insert(tagData);

        if (tagError) {
          console.error('Error tagging users:', tagError);
          // Don't fail the post creation if tagging fails
        }
      }

      // Transform the data to match our type
      return {
        ...post,
        profiles: post.profiles ? {
          username: (post.profiles as any).username,
          avatar_url: (post.profiles as any).avatar_url ?? null,
        } : null,
      };
    } catch (err) {
      console.error('Exception creating post:', err);
      return null;
    }
  }

  /**
   * Upload image to Supabase storage
   */
  static async uploadImage(imageUri: string, fileName: string): Promise<string | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      console.log('Starting image upload:', { imageUri, fileName });

      // For React Native, we need to handle the image URI differently
      let imageBlob: Blob;
      
      if (imageUri.startsWith('file://') || imageUri.startsWith('content://')) {
        // React Native file URI - use FormData approach
        const formData = new FormData();
        
        // Create a file object for React Native
        const fileExtension = fileName.split('.').pop() || 'jpg';
        const mimeType = `image/${fileExtension === 'jpg' ? 'jpeg' : fileExtension}`;
        
        formData.append('file', {
          uri: imageUri,
          type: mimeType,
          name: fileName,
        } as any);

        // Convert FormData to blob for Supabase
        const response = await fetch(imageUri);
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.status}`);
        }
        imageBlob = await response.blob();
      } else {
        // Web or regular URL
        const response = await fetch(imageUri);
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.status}`);
        }
        imageBlob = await response.blob();
      }

      console.log('Image blob created:', { 
        size: imageBlob.size, 
        type: imageBlob.type 
      });

      // Ensure we have a valid blob
      if (imageBlob.size === 0) {
        throw new Error('Image blob is empty');
      }

      const filePath = `${user.id}/${Date.now()}-${fileName}`;

      console.log('Uploading to path:', filePath);

      const { data, error } = await supabase.storage
        .from('posts')
        .upload(filePath, imageBlob, {
          contentType: imageBlob.type || 'image/jpeg',
          upsert: false,
        });

      if (error) {
        console.error('Error uploading image:', error);
        return null;
      }

      console.log('Upload successful:', data);

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('posts')
        .getPublicUrl(filePath);

      console.log('Public URL generated:', urlData.publicUrl);

      return urlData.publicUrl;
    } catch (err) {
      console.error('Exception uploading image:', err);
      return null;
    }
  }

  /**
   * Search users for tagging
   */
  static async searchUsers(query: string): Promise<TaggedUser[]> {
    try {
      if (query.length < 2) return [];

      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .ilike('username', `%${query}%`)
        .limit(10);

      if (error) {
        console.error('Error searching users:', error);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error('Exception searching users:', err);
      return [];
    }
  }
  /**
   * Get all feed items ordered by most recent
   */
  static async getFeed(): Promise<FeedItem[]> {
    try {
      const { data, error } = await supabase
        .from('feed')
        .select(`
          id,
          user_id,
          description,
          image_url,
          likes,
          created_at,
          updated_at,
          profiles!user_id ( username, avatar_url )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching feed:', error);
        return [];
      }

      // Transform the data to match our type
      const transformedData = (data || []).map((item: any) => ({
        ...item,
        profiles: {
          ...item.profiles,
          avatar_url: item.profiles?.avatar_url ?? null,
        },
    }));

    return transformedData;
    } catch (err) {
      console.error('Exception fetching feed:', err);
      return [];
    }
  }

  /**
   * Like a post by incrementing the like count
   */
  static async likePost(postId: string, currentLikes: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('feed')
        .update({ likes: currentLikes + 1 })
        .eq('id', postId);

      if (error) {
        console.error('Error liking post:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Exception liking post:', err);
      return false;
    }
  }

  /**
   * Get the most liked and most recent post
   */
  static async getTopPost(): Promise<FeedItem | null> {
    try {
      const { data, error } = await supabase
        .from('feed')
        .select(`
          id,
          user_id,
          description,
          image_url,
          likes,
          created_at,
          updated_at,
          profiles!user_id ( username, avatar_url )
        `)
        .order('likes', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching top post:', error);
        return null;
      }

      // Transform the data to match our type
      return data
      ? {
          ...data,
          profiles: data.profiles ? {
            username: (data.profiles as any).username,
            avatar_url: (data.profiles as any).avatar_url ?? null,
          } : null,
        }
      : null;
    } catch (err) {
      console.error('Exception in getTopPost:', err);
      return null;
    }
  }

  /**
   * Get a single post by ID
   */
  static async getPostById(postId: string): Promise<FeedItem | null> {
    try {
      const { data, error } = await supabase
        .from('feed')
        .select(`
          id,
          user_id,
          description,
          image_url,
          likes,
          created_at,
          updated_at,
          profiles!user_id ( username, avatar_url )
        `)
        .eq('id', postId)
        .single();

      if (error) {
        console.error('Error fetching post by ID:', error);
        return null;
      }

      // Transform the data to match our type
      return data
      ? {
          ...data,
          profiles: data.profiles ? {
            username: (data.profiles as any).username,
            avatar_url: (data.profiles as any).avatar_url ?? null,
          } : null,
        }
      : null;
    } catch (err) {
      console.error('Exception in getPostById:', err);
      return null;
    }
  }
}