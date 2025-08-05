/**
 * Profile Hook
 * Custom hook for managing profile data and refreshing
 */

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ProfileService } from '../services/profileService';

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [userEvents, setUserEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const [profileData, posts, events] = await Promise.all([
        ProfileService.getUserProfile(),
        ProfileService.getUserPosts(),
        ProfileService.getUserEvents()
      ]);

      setProfile(profileData);
      setUserPosts(posts || []);
      setUserEvents(events || []);
    } catch (err) {
      console.error('Error loading profile:', err);
      setError('Failed to load profile data');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const refreshProfile = useCallback(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  return {
    profile,
    userPosts,
    userEvents,
    isLoading,
    error,
    refreshProfile,
  };
}
