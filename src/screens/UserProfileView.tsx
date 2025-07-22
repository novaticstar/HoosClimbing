/**
 * User Profile View Screen
 * Used to view other users' profiles from the Friends screen
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Container, spacing, ThemedText, useTheme } from '../theme/ui';
import { User } from '../services/friendsService';

interface UserProfileViewProps {
  user: User;
  onClose: () => void;
}

export default function UserProfileView({ user, onClose }: UserProfileViewProps) {
  const { colors } = useTheme();

  const getDisplayName = () => {
    return user.username || user.full_name || user.email?.split('@')[0] || 'Unknown User';
  };

  const getAvatarText = () => {
    const name = getDisplayName();
    return name.charAt(0).toUpperCase();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText variant="h3" color="text">
          Profile
        </ThemedText>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Container style={styles.profileContainer}>
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <ThemedText variant="h1" color="onPrimary">
                {getAvatarText()}
              </ThemedText>
            </View>
            <View style={styles.userInfo}>
              <ThemedText variant="h2" color="text" style={styles.displayName}>
                {getDisplayName()}
              </ThemedText>
              {user.full_name && user.full_name !== getDisplayName() && (
                <ThemedText variant="body" color="textSecondary">
                  {user.full_name}
                </ThemedText>
              )}
              <ThemedText variant="body" color="textSecondary">
                {user.email}
              </ThemedText>
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <Card style={styles.statCard}>
              <ThemedText variant="h3" color="primary">
                0
              </ThemedText>
              <ThemedText variant="body" color="textSecondary">
                Routes
              </ThemedText>
            </Card>
            <Card style={styles.statCard}>
              <ThemedText variant="h3" color="accent">
                0
              </ThemedText>
              <ThemedText variant="body" color="textSecondary">
                Friends
              </ThemedText>
            </Card>
            <Card style={styles.statCard}>
              <ThemedText variant="h3" color="success">
                0
              </ThemedText>
              <ThemedText variant="body" color="textSecondary">
                Posts
              </ThemedText>
            </Card>
          </View>

          {/* Bio Section */}
          <Card style={styles.bioCard}>
            <ThemedText variant="h4" color="text" style={styles.sectionTitle}>
              About
            </ThemedText>
            <ThemedText variant="body" color="textSecondary">
              This climber hasn't added a bio yet.
            </ThemedText>
          </Card>

          {/* Recent Activity */}
          <Card style={styles.activityCard}>
            <ThemedText variant="h4" color="text" style={styles.sectionTitle}>
              Recent Activity
            </ThemedText>
            <View style={styles.emptyState}>
              <Ionicons name="camera-outline" size={48} color={colors.textSecondary} />
              <ThemedText variant="body" color="textSecondary" style={styles.emptyText}>
                No recent climbing activity
              </ThemedText>
            </View>
          </Card>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.messageButton, { backgroundColor: colors.primary }]}
            >
              <Ionicons name="chatbubble" size={20} color={colors.onPrimary} />
              <ThemedText variant="body" color="onPrimary" style={styles.buttonText}>
                Message
              </ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.secondaryButton, { borderColor: colors.border }]}
            >
              <Ionicons name="person-add" size={20} color={colors.text} />
              <ThemedText variant="body" color="text" style={styles.buttonText}>
                Add Friend
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
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  profileContainer: {
    padding: spacing.lg,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  userInfo: {
    alignItems: 'center',
  },
  displayName: {
    marginBottom: spacing.xs,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.lg,
  },
  bioCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  activityCard: {
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyText: {
    marginTop: spacing.md,
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    gap: spacing.sm,
  },
  messageButton: {},
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  buttonText: {
    fontWeight: '600',
  },
});
