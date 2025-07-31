/**
 * Friend Card Component
 * Displays a friend or suggested user with appropriate actions
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, Image, StyleSheet, TouchableOpacity, View } from 'react-native';
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
  const [showDropdown, setShowDropdown] = useState(false);
  const [imageError, setImageError] = useState(false);

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
    setShowDropdown(!showDropdown);
  };

  const handleUnadFriend = async () => {
    setShowDropdown(false);
    if (onRemoveFriend) {
      const success = await onRemoveFriend(user.id);
      if (!success) {
        Alert.alert('Error', 'Failed to remove friend. Please try again.');
      }
    } else {
      Alert.alert('Error', 'Remove friend function not available.');
    }
  };

  const handleBlockUser = () => {
    setShowDropdown(false);
    const displayName = user.username || user.full_name || 'this user';
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
    return user.username || user.full_name || (user.email ? user.email.split('@')[0] : 'Unknown');
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
    const firstChar = name.charAt(0).toUpperCase();
    return firstChar || '?';
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
    <View style={[styles.container, { position: 'relative' }]}>
      <View style={[styles.avatarContainer, { position: 'relative' }]}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          {user.avatar_url && user.avatar_url.trim() && user.avatar_url.trim() !== '' && !imageError ? (
            <Image
              source={{ uri: user.avatar_url }}
              style={styles.avatarImage}
              onError={() => {
                setImageError(true);
              }}
            />
          ) : (
            <ThemedText variant="h4" color="onPrimary">
              {getAvatarText()}
            </ThemedText>
          )}
        </View>
        {renderActionButton()}
      </View>
      <ThemedText variant="caption" color="text" style={styles.name}>
        {getDisplayName()}
      </ThemedText>
      
      {/* Dropdown Menu */}
      {showDropdown && type === 'friend' && (
        <>
          {/* Backdrop to close dropdown */}
          <TouchableOpacity
            style={styles.dropdownBackdrop}
            onPress={() => setShowDropdown(false)}
            activeOpacity={0}
          />
          <View style={[styles.dropdown, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <TouchableOpacity
              style={[styles.dropdownItem, { borderBottomColor: colors.border }]}
              onPress={handleUnadFriend}
            >
              <Ionicons name="person-remove" size={18} color={colors.error} />
              <ThemedText variant="body" color="error" style={styles.dropdownText}>
                Unadd Friend
              </ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={handleBlockUser}
            >
              <Ionicons name="ban" size={18} color={colors.error} />
              <ThemedText variant="body" color="error" style={styles.dropdownText}>
                Block User
              </ThemedText>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginRight: spacing.lg,
    width: 70,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: spacing.sm,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
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
    zIndex: 100,
    elevation: 5,
  },
  actionButtons: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: -4,
    right: -4,
    gap: 4,
    zIndex: 100,
    elevation: 5,
  },
  name: {
    textAlign: 'center',
    width: '100%',
  },
  dropdown: {
    position: 'absolute',
    top: 70,
    right: -80,
    minWidth: 160,
    borderRadius: 8,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 15,
    zIndex: 99999,
  },
  dropdownBackdrop: {
    position: 'absolute',
    top: -2000,
    left: -2000,
    right: -2000,
    bottom: -2000,
    zIndex: 99998,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  dropdownText: {
    marginLeft: spacing.sm,
    fontSize: 14,
  },
});
