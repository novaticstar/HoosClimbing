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
  type: 'friend' | 'suggestion' | 'pending' | 'sent';
  onAddFriend?: (userId: string) => Promise<boolean>;
  onAcceptFriend?: (userId: string) => Promise<boolean>;
  onRemoveFriend?: (userId: string) => Promise<boolean>;
  onCancelRequest?: (userId: string) => Promise<boolean>;
}

export function FriendCard({ 
  user, 
  type, 
  onAddFriend, 
  onAcceptFriend, 
  onRemoveFriend,
  onCancelRequest
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
    
    const displayName = user.username || user.full_name || 'this user';
    
    Alert.alert(
      'Friend Options',
      `What would you like to do with ${displayName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unadd Friend',
          style: 'destructive',
          onPress: async () => {
            const success = await onRemoveFriend(user.id);
            if (!success) {
              Alert.alert('Error', 'Failed to remove friend. Please try again.');
            }
          }
        },
        {
          text: 'Block User',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Block User',
              `Are you sure you want to block ${displayName}? This will remove them as a friend and prevent them from contacting you.`,
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Block',
                  style: 'destructive',
                  onPress: () => {
                    // Stub implementation for block feature
                    Alert.alert('User Blocked', `${displayName} has been blocked. This feature is coming soon!`);
                  }
                }
              ]
            );
          }
        }
      ]
    );
  };

  const handleCancelRequest = () => {
    if (!onCancelRequest) return;
    
    Alert.alert(
      'Cancel Friend Request',
      `Cancel friend request to ${user.username || user.full_name || 'this user'}?`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Cancel Request',
          style: 'destructive',
          onPress: async () => {
            const success = await onCancelRequest(user.id);
            if (success) {
              Alert.alert('Success', 'Friend request cancelled');
            } else {
              Alert.alert('Error', 'Failed to cancel friend request. Please try again.');
            }
          }
        }
      ]
    );
  };

  const getDisplayName = () => {
    return user.username || user.full_name || user.email.split('@')[0];
  };

  const handleSuggestionOptions = () => {
    const displayName = getDisplayName();
    
    Alert.alert(
      'User Options',
      `Options for ${displayName}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add Friend',
          onPress: handleAddFriend
        },
        {
          text: 'Block User',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Block User', 
              `Are you sure you want to block ${displayName}? They won't appear in your suggestions anymore.`,
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Block',
                  style: 'destructive',
                  onPress: () => {
                    Alert.alert('User Blocked', `${displayName} has been blocked. This feature is coming soon!`);
                  }
                }
              ]
            );
          }
        }
      ]
    );
  };

  const getAvatarText = () => {
    const name = getDisplayName();
    return name.charAt(0).toUpperCase();
  };

  const renderActionButton = () => {
    switch (type) {
      case 'suggestion':
        return (
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: colors.primary, position: 'relative' }]}
              onPress={handleAddFriend}
            >
              <Ionicons name="person-add" size={16} color={colors.onPrimary} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: colors.surfaceVariant, position: 'relative' }]}
              onPress={handleSuggestionOptions}
            >
              <Ionicons name="ellipsis-horizontal" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
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
      case 'sent':
        return (
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: colors.warning }]}
            onPress={handleCancelRequest}
          >
            <Ionicons name="time" size={16} color={colors.onPrimary} />
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
  actionButtons: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: -4,
    right: -4,
    gap: 4,
  },
  name: {
    textAlign: 'center',
    width: '100%',
  },
});
