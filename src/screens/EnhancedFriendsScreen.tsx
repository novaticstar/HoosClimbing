/**
 * Enhanced FriendsScreen with Real-time Updates
 * This is an example of how to integrate the real-time hooks
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
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
import { useRealtimeFriends } from '../hooks/useRealtimeFriends'; // Use the new real-time hook
import { useRealtimeNotifications } from '../hooks/useRealtimeNotifications';
import { User } from '../services/friendsService';
import { Container, spacing, ThemedText, useTheme } from '../theme/ui';
import UserProfileView from './UserProfileView';

type TabType = 'friends' | 'requests' | 'suggestions';

// ... (keep your existing FriendListItem component unchanged)

export default function EnhancedFriendsScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  
  // Use the new real-time hooks
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
  } = useRealtimeFriends(); // This replaces useFriends()

  const { notifications, unreadCount } = useRealtimeNotifications();

  const [activeTab, setActiveTab] = useState<TabType>('friends');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [profileModalVisible, setProfileModalVisible] = useState(false);

  // Sync data when app comes to foreground
  useAppStateSync(
    () => {
      // App came to foreground - refresh data
      refresh();
    },
    () => {
      // App went to background - you could pause subscriptions here if needed
      console.log('App backgrounded');
    }
  );

  // ... (keep your existing functions unchanged)

  const getTabCount = (tab: TabType) => {
    switch (tab) {
      case 'friends':
        return friends.length;
      case 'requests':
        // Show unread notification count for requests tab
        return pendingRequests.length + sentRequests.length;
      case 'suggestions':
        return suggestedUsers.length;
      default:
        return 0;
    }
  };

  // Enhanced tab rendering with notification badges
  const renderTabButton = (tab: TabType) => {
    const isActive = activeTab === tab;
    const count = getTabCount(tab);
    const showNotificationBadge = tab === 'requests' && unreadCount > 0;

    return (
      <TouchableOpacity
        key={tab}
        style={[
          styles.tab,
          isActive && [styles.activeTab, { borderBottomColor: colors.primary }]
        ]}
        onPress={() => setActiveTab(tab)}
      >
        <ThemedText
          variant="h4"
          color={isActive ? 'primary' : 'textSecondary'}
          style={styles.tabText}
        >
          {tab.charAt(0).toUpperCase() + tab.slice(1)}
        </ThemedText>
        {count > 0 && (
          <View style={[
            styles.tabBadge, 
            { backgroundColor: showNotificationBadge ? colors.error : colors.accent }
          ]}>
            <ThemedText variant="caption" color="onAccent" style={styles.tabBadgeText}>
              {showNotificationBadge ? unreadCount : count}
            </ThemedText>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Container style={styles.content}>
        {/* Header with notification indicator */}
        <View style={styles.header}>
          <View style={styles.headerTitleContainer}>
            <ThemedText variant="h2" color="text">
              Friends
            </ThemedText>
            {unreadCount > 0 && (
              <View style={[styles.headerNotificationBadge, { backgroundColor: colors.error }]}>
                <ThemedText variant="caption" color="onAccent" style={styles.headerBadgeText}>
                  {unreadCount}
                </ThemedText>
              </View>
            )}
          </View>
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
          {(['friends', 'requests', 'suggestions'] as TabType[]).map(renderTabButton)}
        </View>

        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={refresh} />
          }
        >
          {/* Your existing content rendering logic */}
          {/* ... */}
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
  // ... (keep your existing styles)
  
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  
  headerNotificationBadge: {
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  
  headerBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  
  // ... (rest of your styles)
});
