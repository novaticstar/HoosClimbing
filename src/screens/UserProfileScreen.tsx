/**
 * User Profile Screen
 * View another user's profile
 */

import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';
import { Container, spacing, ThemedText, useTheme } from '../theme/ui';

type UserProfileScreenRouteProp = {
  userId: string;
  username?: string;
};

type UserProfile = {
  id: string;
  username: string;
  avatar_url?: string;
  created_at: string;
};

export default function UserProfileScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { userId, username } = route.params as UserProfileScreenRouteProp;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <ThemedText variant="body" color="textSecondary">
            User not found
          </ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText variant="h3" color="text" style={styles.headerTitle}>
          {profile.username}
        </ThemedText>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content}>
        <Container>
          {/* Profile Section */}
          <View style={styles.profileSection}>
            {profile.avatar_url ? (
              <Image
                source={{ uri: profile.avatar_url }}
                style={styles.avatar}
              />
            ) : (
              <View style={[styles.avatar, { backgroundColor: colors.surfaceVariant }]}>
                <ThemedText variant="h1" color="textSecondary">
                  {profile.username.charAt(0).toUpperCase()}
                </ThemedText>
              </View>
            )}

            <ThemedText variant="h2" color="text" style={styles.username}>
              {profile.username}
            </ThemedText>

            <ThemedText variant="caption" color="textSecondary" style={styles.joinDate}>
              Joined {new Date(profile.created_at).toLocaleDateString()}
            </ThemedText>
          </View>

          {/* Stats Section */}
          <View style={styles.statsSection}>
            <View style={styles.statItem}>
              <ThemedText variant="h3" color="text">0</ThemedText>
              <ThemedText variant="caption" color="textSecondary">Posts</ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText variant="h3" color="text">0</ThemedText>
              <ThemedText variant="caption" color="textSecondary">Friends</ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText variant="h3" color="text">0</ThemedText>
              <ThemedText variant="caption" color="textSecondary">Climbs</ThemedText>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionSection}>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.accent }]}>
              <ThemedText variant="body" color="surface" style={styles.actionButtonText}>
                Add Friend
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }]}>
              <ThemedText variant="body" color="text" style={styles.actionButtonText}>
                Message
              </ThemedText>
            </TouchableOpacity>
          </View>
        </Container>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '600',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  username: {
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  joinDate: {
    marginBottom: spacing.lg,
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: spacing.lg,
  },
  statItem: {
    alignItems: 'center',
  },
  actionSection: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
  },
  actionButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    fontWeight: '600',
  },
});
