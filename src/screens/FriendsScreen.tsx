/**
 * Friends Screen
 * Dedicated page for managing friend relationships
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert,
    Modal,
    RefreshControl,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useAppStateSync } from '../hooks/useAppStateSync';
import { useRealtimeFriends as useFriends } from '../hooks/useRealtimeFriends';
import { useRealtimeNotifications } from '../hooks/useRealtimeNotifications';
import { User } from '../services/friendsService';
import { Card, Container, spacing, ThemedText, useTheme } from '../theme/ui';
import UserProfileView from './UserProfileView';

type TabType = 'friends' | 'requests' | 'suggestions';

interface FriendListItemProps {
  user: User;
  type: 'friend' | 'pending' | 'sent' | 'suggestion';
  onMessage?: (userId: string) => void;
  onViewProfile?: (userId: string) => void;
  onAddFriend?: (userId: string) => Promise<boolean>;
  onAcceptFriend?: (userId: string) => Promise<boolean>;
  onRemoveFriend?: (userId: string) => Promise<boolean>;
  onCancelRequest?: (userId: string) => Promise<boolean>;
}

const FriendListItem: React.FC<FriendListItemProps> = ({
  user,
  type,
  onMessage,
  onViewProfile,
  onAddFriend,
  onAcceptFriend,
  onRemoveFriend,
  onCancelRequest,
}) => {
  const { colors } = useTheme();
  const [showDropdown, setShowDropdown] = useState(false);

  const getDisplayName = () => {
    return user.username || user.full_name || user.email?.split('@')[0] || 'Unknown';
  };

  const getAvatarText = () => {
    const name = getDisplayName();
    return name.charAt(0).toUpperCase();
  };

  const handleMessage = () => {
    Alert.alert('Message Friend', `Messaging ${getDisplayName()} - Coming soon!`);
  };

  const handleViewProfile = () => {
    if (onViewProfile) {
      onViewProfile(user.id);
    }
  };

  const handleAddFriend = async () => {
    if (!onAddFriend) return;
    const success = await onAddFriend(user.id);
    if (success) {
      Alert.alert('Success', `Friend request sent to ${getDisplayName()}!`);
    } else {
      Alert.alert('Error', 'Failed to send friend request. Please try again.');
    }
  };

  const handleAcceptFriend = async () => {
    if (!onAcceptFriend) return;
    const success = await onAcceptFriend(user.id);
    if (success) {
      Alert.alert('Success', `You are now friends with ${getDisplayName()}!`);
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
    Alert.alert(
      'Block User',
      `Are you sure you want to block ${getDisplayName()}? This will remove them as a friend and prevent them from contacting you.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Block',
          style: 'destructive',
          onPress: () => {
            // Stub implementation for block feature
            Alert.alert('User Blocked', `${getDisplayName()} has been blocked. This feature is coming soon!`);
          }
        }
      ]
    );
  };

  const handleCancelRequest = () => {
    if (!onCancelRequest) return;
    Alert.alert(
      'Cancel Request',
      `Cancel friend request to ${getDisplayName()}?`,
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
              Alert.alert('Error', 'Failed to cancel request. Please try again.');
            }
          }
        }
      ]
    );
  };

  const renderActionButtons = () => {
    switch (type) {
      case 'friend':
        return (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.messageButton, { backgroundColor: colors.primary }]}
              onPress={handleMessage}
            >
              <Ionicons name="chatbubble" size={16} color={colors.onPrimary} />
              <ThemedText variant="caption" color="onPrimary" style={styles.buttonText}>
                Message
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryButton, { borderColor: colors.border }]}
              onPress={handleViewProfile}
            >
              <ThemedText variant="caption" color="text" style={styles.buttonText}>
                Profile
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.iconButton, { backgroundColor: colors.surfaceVariant }]}
              onPress={handleRemoveFriend}
            >
              <Ionicons name="ellipsis-horizontal" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        );
      case 'pending':
        return (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.acceptButton, { backgroundColor: colors.success }]}
              onPress={handleAcceptFriend}
            >
              <Ionicons name="checkmark" size={16} color={colors.onPrimary} />
              <ThemedText variant="caption" color="onPrimary" style={styles.buttonText}>
                Accept
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryButton, { borderColor: colors.border }]}
              onPress={handleViewProfile}
            >
              <ThemedText variant="caption" color="text" style={styles.buttonText}>
                Profile
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.iconButton, { backgroundColor: colors.surfaceVariant }]}
              onPress={() => {
                Alert.alert(
                  'Request Options',
                  `What would you like to do with ${getDisplayName()}'s friend request?`,
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Decline',
                      style: 'destructive',
                      onPress: () => {
                        Alert.alert('Request Declined', `Friend request from ${getDisplayName()} has been declined.`);
                      }
                    },
                    {
                      text: 'Block User',
                      style: 'destructive',
                      onPress: () => {
                        Alert.alert('User Blocked', `${getDisplayName()} has been blocked. This feature is coming soon!`);
                      }
                    }
                  ]
                );
              }}
            >
              <Ionicons name="ellipsis-horizontal" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        );
      case 'sent':
        return (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton, { backgroundColor: colors.warning }]}
              onPress={handleCancelRequest}
            >
              <Ionicons name="time" size={16} color={colors.onPrimary} />
              <ThemedText variant="caption" color="onPrimary" style={styles.buttonText}>
                Cancel
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryButton, { borderColor: colors.border }]}
              onPress={handleViewProfile}
            >
              <ThemedText variant="caption" color="text" style={styles.buttonText}>
                Profile
              </ThemedText>
            </TouchableOpacity>
          </View>
        );
      case 'suggestion':
        return (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.addButton, { backgroundColor: colors.primary }]}
              onPress={handleAddFriend}
            >
              <Ionicons name="person-add" size={16} color={colors.onPrimary} />
              <ThemedText variant="caption" color="onPrimary" style={styles.buttonText}>
                Add Friend
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryButton, { borderColor: colors.border }]}
              onPress={handleViewProfile}
            >
              <ThemedText variant="caption" color="text" style={styles.buttonText}>
                Profile
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.iconButton, { backgroundColor: colors.surfaceVariant }]}
              onPress={() => {
                Alert.alert(
                  'User Options',
                  `What would you like to do with ${getDisplayName()}?`,
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Block User',
                      style: 'destructive',
                      onPress: () => {
                        Alert.alert('User Blocked', `${getDisplayName()} has been blocked. This feature is coming soon!`);
                      }
                    }
                  ]
                );
              }}
            >
              <Ionicons name="ellipsis-horizontal" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        );
    }
  };

  return (
    <View style={{ position: 'relative' }}>
      <Card style={styles.friendItem}>
        <View style={styles.friendInfo}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <ThemedText variant="h4" color="onPrimary">
              {getAvatarText()}
            </ThemedText>
          </View>
          <View style={styles.userDetails}>
            <ThemedText variant="h4" color="text">
              {getDisplayName()}
            </ThemedText>
            {user.full_name && user.full_name !== getDisplayName() && (
              <ThemedText variant="body" color="textSecondary">
                {user.full_name}
              </ThemedText>
            )}
            {type === 'pending' && (
              <ThemedText variant="caption" color="accent">
                Wants to be friends
              </ThemedText>
            )}
            {type === 'sent' && (
              <ThemedText variant="caption" color="warning">
                Request sent
              </ThemedText>
            )}
          </View>
        </View>
        {renderActionButtons()}
      </Card>
      
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
};

export default function FriendsScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const {
    friends,
    suggestedUsers,
    pendingRequests,
    sentRequests,
    loading,
    refreshing,
    sendFriendRequest,
    acceptFriendRequest,
    removeFriend,
    cancelFriendRequest,
    refresh,
  } = useFriends();

  const { notifications, unreadCount } = useRealtimeNotifications();

  const [activeTab, setActiveTab] = useState<TabType>('friends');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [profileModalVisible, setProfileModalVisible] = useState(false);

  // Sync data when app comes to foreground
  useAppStateSync(() => {
    refresh();
  });

  const handleViewProfile = (user: User) => {
    setSelectedUser(user);
    setProfileModalVisible(true);
  };

  const closeProfileModal = () => {
    setProfileModalVisible(false);
    setSelectedUser(null);
  };

  const getUserFriendshipStatus = (userId: string): 'friend' | 'pending' | 'sent' | 'none' => {
    if (friends.some((f: User) => f.id === userId)) return 'friend';
    if (pendingRequests.some((r: User) => r.id === userId)) return 'pending';
    if (sentRequests.some((r: User) => r.id === userId)) return 'sent';
    return 'none';
  };
// TODO: FIX AND IMPLEMENT API, WE DO HAVE ACCESS TO THE USER'S FRIEND LIST
  const getUserFriendCount = (userId: string): number => {
    // For now, we don't have access to the user's friend list
    // In a real app, this would be fetched from the API
    // For demonstration, return the current user's friend count as placeholder
    return friends.length;
  };

  const filterUsers = (users: User[]) => {
    if (!searchQuery) return users;
    const query = searchQuery.toLowerCase();
    return users.filter(user =>
      user.username?.toLowerCase().includes(query) ||
      user.full_name?.toLowerCase().includes(query)
    );
  };

  const getTabContent = () => {
    switch (activeTab) {
      case 'friends':
        const filteredFriends = filterUsers(friends);
        return filteredFriends.map(friend => (
          <FriendListItem
            key={friend.id}
            user={friend}
            type="friend"
            onViewProfile={() => handleViewProfile(friend)}
            onRemoveFriend={removeFriend}
          />
        ));
      case 'requests':
        const allRequests = [...pendingRequests, ...sentRequests];
        const filteredRequests = filterUsers(allRequests);
        return filteredRequests.map(request => {
          const isPending = pendingRequests.some((p: User) => p.id === request.id);
          return (
            <FriendListItem
              key={request.id}
              user={request}
              type={isPending ? 'pending' : 'sent'}
              onViewProfile={() => handleViewProfile(request)}
              onAcceptFriend={acceptFriendRequest}
              onCancelRequest={cancelFriendRequest}
            />
          );
        });
      case 'suggestions':
        const filteredSuggestions = filterUsers(suggestedUsers);
        return filteredSuggestions.map(suggestion => (
          <FriendListItem
            key={suggestion.id}
            user={suggestion}
            type="suggestion"
            onViewProfile={() => handleViewProfile(suggestion)}
            onAddFriend={sendFriendRequest}
          />
        ));
      default:
        return [];
    }
  };

  const getTabCount = (tab: TabType) => {
    switch (tab) {
      case 'friends':
        return friends.length;
      case 'requests':
        return pendingRequests.length + sentRequests.length;
      case 'suggestions':
        return suggestedUsers.length;
      default:
        return 0;
    }
  };

  const tabContent = getTabContent();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Container style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText variant="h2" color="text">
            Friends
          </ThemedText>
          <ThemedText variant="body" color="textSecondary">
            Connect with other climbers
          </ThemedText>
        </View>

        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: colors.surfaceVariant }]}>
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search friends..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          {(['friends', 'requests', 'suggestions'] as TabType[]).map(tab => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tab,
                activeTab === tab && [styles.activeTab, { borderBottomColor: colors.primary }]
              ]}
              onPress={() => setActiveTab(tab)}
            >
              <ThemedText
                variant="h4"
                color={activeTab === tab ? 'primary' : 'textSecondary'}
                style={styles.tabText}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </ThemedText>
              {getTabCount(tab) > 0 && (
                <View style={[styles.tabBadge, { backgroundColor: colors.accent }]}>
                  <ThemedText variant="caption" color="onAccent" style={styles.tabBadgeText}>
                    {getTabCount(tab)}
                  </ThemedText>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={refresh} />
          }
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ThemedText variant="body" color="textSecondary">
                Loading...
              </ThemedText>
            </View>
          ) : tabContent.length > 0 ? (
            <View style={styles.listContainer}>{tabContent}</View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons
                name={
                  activeTab === 'friends' ? 'people' :
                  activeTab === 'requests' ? 'person-add' : 'search'
                }
                size={48}
                color={colors.textSecondary}
              />
              <ThemedText variant="h4" color="textSecondary" style={styles.emptyTitle}>
                {activeTab === 'friends' && 'No friends yet'}
                {activeTab === 'requests' && 'No friend requests'}
                {activeTab === 'suggestions' && 'No suggestions'}
              </ThemedText>
              <ThemedText variant="body" color="textSecondary" style={styles.emptyDescription}>
                {activeTab === 'friends' && 'Start by sending friend requests to climbers you know'}
                {activeTab === 'requests' && 'Friend requests will appear here'}
                {activeTab === 'suggestions' && 'Check back later for friend suggestions'}
              </ThemedText>
            </View>
          )}
        </ScrollView>
      </Container>

      {/* Profile Modal */}
      <Modal
        visible={profileModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeProfileModal}
      >
        {selectedUser && (
          <UserProfileView 
            user={selectedUser} 
            onClose={closeProfileModal}
            friendshipStatus={getUserFriendshipStatus(selectedUser.id)}
            onAddFriend={sendFriendRequest}
            onRemoveFriend={removeFriend}
            onAcceptFriend={acceptFriendRequest}
            onCancelRequest={cancelFriendRequest}
            friendCount={getUserFriendCount(selectedUser.id)}
          />
        )}
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.xl,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    gap: spacing.xs,
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  tabText: {
    fontWeight: '600',
  },
  tabBadge: {
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  tabBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  listContainer: {
    gap: spacing.sm,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  friendInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  userDetails: {
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.xs,
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    gap: 4,
  },
  messageButton: {},
  addButton: {},
  acceptButton: {},
  cancelButton: {},
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyTitle: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyDescription: {
    textAlign: 'center',
    maxWidth: 280,
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    right: 0,
    minWidth: 160,
    borderRadius: 8,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 10,
    zIndex: 9999,
  },
  dropdownBackdrop: {
    position: 'absolute',
    top: -1000,
    left: -1000,
    right: -1000,
    bottom: -1000,
    zIndex: 9998,
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
