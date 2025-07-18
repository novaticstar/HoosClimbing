/**
 * Friend Card Component
 * Displays a friend or suggested user with appropriate actions
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';
import { User } from '../services/friendsService';
import { spacing, ThemedText, useTheme } from '../theme/ui';

interface FriendCardProps {
  user: User;
  type: 'friend' | 'suggestion' | 'pending';
  onAddFriend?: (userId: string) => Promise<boolean>;
  onAcceptFriend?: (userId: string) => Promise<boolean>;
  onRemoveFriend?: (userId: string) => Promise<boolean>;
}

export function FriendCard({ 
  user, 
  type, 
  onAddFriend, 
  onAcceptFriend, 
  onRemoveFriend 
}: FriendCardProps) {
  const { colors } = useTheme();

  const handleAddFriend = async () => {
    if (!onAddFriend) return;
    
    const success = await onAddFriend(user.id);
    if (success) {
      Alert.alert('Success', `Friend request sent to ${user.username || user.full_name || 'user'}!`);
    } else {
      Alert.alert('Error', 'Failed to send friend request. Please try again.');
    }
  };

  const handleAcceptFriend = async () => {
    if (!onAcceptFriend) return;
    
    const success = await onAcceptFriend(user.id);
    if (success) {
      Alert.alert('Success', `You are now friends with ${user.username || user.full_name || 'user'}!`);
    } else {
      Alert.alert('Error', 'Failed to accept friend request. Please try again.');
    }
  };

  const handleRemoveFriend = () => {
    if (!onRemoveFriend) return;
    
    Alert.alert(
      'Remove Friend',
      `Are you sure you want to remove ${user.username || user.full_name || 'this user'} as a friend?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            const success = await onRemoveFriend(user.id);
            if (!success) {
              Alert.alert('Error', 'Failed to remove friend. Please try again.');
            }
          }
        }
      ]
    );
  };

  const getDisplayName = () => {
    return user.username || user.full_name || user.email.split('@')[0];
  };

  const getAvatarText = () => {
    const name = getDisplayName();
    return name.charAt(0).toUpperCase();
  };

  const renderActionButton = () => {
    switch (type) {
      case 'suggestion':
        return (
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={handleAddFriend}
          >
            <Ionicons name="person-add" size={16} color={colors.onPrimary} />
          </TouchableOpacity>
        );
      case 'pending':
        return (
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: colors.success }]}
            onPress={handleAcceptFriend}
          >
            <Ionicons name="checkmark" size={16} color={colors.onPrimary} />
          </TouchableOpacity>
        );
      case 'friend':
        return (
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: colors.surfaceVariant }]}
            onPress={handleRemoveFriend}
          >
            <Ionicons name="ellipsis-horizontal" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
        {user.avatar_url ? (
          <View style={styles.avatarPlaceholder}>
            <ThemedText variant="h4" color="onPrimary">
              {getAvatarText()}
            </ThemedText>
          </View>
        ) : (
          <ThemedText variant="h4" color="onPrimary">
            {getAvatarText()}
          </ThemedText>
        )}
        {renderActionButton()}
      </View>
      <ThemedText variant="caption" color="text" style={styles.name}>
        {getDisplayName()}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginRight: spacing.lg,
    width: 70,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
    position: 'relative',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButton: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  name: {
    textAlign: 'center',
    width: '100%',
  },
});
