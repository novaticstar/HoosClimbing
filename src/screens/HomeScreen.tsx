/**
 * Home Screen
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Dimensions, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Menu } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FriendCard } from '../components/FriendCard';
import { useAuth } from '../context/AuthContext';
import { useFriends } from '../hooks/useFriends';
import { Card, Container, spacing, ThemedText, useTheme } from '../theme/ui';
import type { AppTabsParamList } from '../navigation/AppTabs';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs'
import { useNavigation } from '@react-navigation/native';
export default function HomeScreen() {
  const { colors } = useTheme();
  const { user, signOut } = useAuth();
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
    refresh
  } = useFriends();
  const navigation = useNavigation<BottomTabNavigationProp<AppTabsParamList>>();
  const [menuVisible, setMenuVisible] = useState(false);

  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  const hasPendingRequests = pendingRequests.length > 0;
  const hasSentRequests = sentRequests.length > 0;


  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} />
        }
      >
        <Container style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <View style={styles.appTitle}>
                <ThemedText variant="h1" color="accent">
                  Hoos
                </ThemedText>
                <ThemedText variant="h1" color="text">
                  Climbing?
                </ThemedText>
              </View>
              <View style={styles.headerButtons}>
                <TouchableOpacity style={styles.headerButton}>
                  <Ionicons name="notifications-outline" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
                <Menu
                    visible={menuVisible}
                    onDismiss={closeMenu}
                    anchor={
                      <TouchableOpacity style={styles.headerButton} onPress={openMenu}>
                        <Ionicons name="settings-outline" size={24} color={colors.textSecondary} />
                      </TouchableOpacity>
                    }
                  >
                    <Menu.Item
                      onPress={() => {
                        closeMenu();
                        signOut(); // Call the sign-out function
                      }}
                      title="Sign Out"
                    />
                  </Menu>
              </View>
            </View>
            <ThemedText variant="body" color="textSecondary">
                Welcome, {user?.user_metadata?.username || 'username'}!
            </ThemedText>
            
          </View>

          {/* Friends Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText variant="h3" color="text">
                Friends
                {hasPendingRequests && (
                  <View style={[styles.badge, { backgroundColor: colors.accent }]}>
                    <ThemedText variant="caption" color="onAccent" style={styles.badgeText}>
                      {pendingRequests.length}
                    </ThemedText>
                  </View>
                )}
              </ThemedText>
              <ThemedText variant="body" color="textSecondary" style={styles.sectionArrow}>
                →
              </ThemedText>
            </View>

            {/* Pending Friend Requests */}
            {hasPendingRequests && (
              <View style={styles.pendingSection}>
                <ThemedText variant="body" color="text" style={styles.pendingTitle}>
                  Friend Requests
                </ThemedText>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.friendsList}
                >
                  {pendingRequests.map((user) => (
                    <FriendCard
                      key={user.id}
                      user={user}
                      type="pending"
                      onAcceptFriend={acceptFriendRequest}
                    />
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Sent Friend Requests */}
            {hasSentRequests && (
              <View style={styles.pendingSection}>
                <ThemedText variant="body" color="text" style={styles.pendingTitle}>
                  Sent Requests
                </ThemedText>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.friendsList}
                >
                  {sentRequests.map((user) => (
                    <FriendCard
                      key={user.id}
                      user={user}
                      type="sent"
                      onCancelRequest={cancelFriendRequest}
                    />
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Current Friends */}
            {friends.length > 0 && (
              <View style={styles.pendingSection}>
                <ThemedText variant="body" color="text" style={styles.pendingTitle}>
                  Your Friends
                </ThemedText>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.friendsList}
                >
                  {friends.map((user) => (
                    <FriendCard
                      key={user.id}
                      user={user}
                      type="friend"
                      onRemoveFriend={removeFriend}
                    />
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Suggested Users */}
            <View style={styles.pendingSection}>
              <ThemedText variant="body" color="text" style={styles.pendingTitle}>
                {friends.length > 0 ? 'People You May Know' : 'Find Friends'}
              </ThemedText>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.friendsList}
              >
                {loading ? (
                  // Loading placeholder
                  [1, 2, 3, 4].map((item) => (
                    <View key={item} style={styles.friendItem}>
                      <View style={[styles.friendAvatar, { backgroundColor: colors.surfaceVariant }]}>
                        <ThemedText variant="h3" color="textSecondary">
                          👤
                        </ThemedText>
                      </View>
                      <ThemedText variant="caption" color="text" style={styles.friendLabel}>
                        Loading...
                      </ThemedText>
                    </View>
                  ))
                ) : suggestedUsers.length > 0 ? (
                  suggestedUsers.map((user) => (
                    <FriendCard
                      key={user.id}
                      user={user}
                      type="suggestion"
                      onAddFriend={sendFriendRequest}
                    />
                  ))
                ) : (
                  <View style={styles.emptyState}>
                    <ThemedText variant="body" color="textSecondary">
                      No suggestions available
                    </ThemedText>
                  </View>
                )}
              </ScrollView>
            </View>
          </View>

          {/* Feed Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText variant="h3" color="text">
                Feed
              </ThemedText>
              <ThemedText variant="body" color="textSecondary" style={styles.sectionArrow}>
                →
              </ThemedText>
            </View>
            <Card style={styles.feedCard}>
              <View style={[styles.feedImage, { backgroundColor: colors.surfaceVariant }]}>
                <ThemedText variant="h1" color="textSecondary">
                  🏔️
                </ThemedText>
              </View>
              <View style={styles.feedContent}>
                <View style={styles.feedInfo}>
                  <ThemedText variant="h4" color="text">
                    Poster
                  </ThemedText>
                  <ThemedText variant="body" color="textSecondary">
                    Post Title
                  </ThemedText>
                </View>
                <View style={[styles.playButton, { backgroundColor: colors.accent }]}>
                  <ThemedText variant="body" color="onAccent">
                    ▶
                  </ThemedText>
                </View>
              </View>
            </Card>
          </View>

          {/* Events Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText variant="h3" color="text">
                Events
              </ThemedText>
              <ThemedText variant="body" color="textSecondary" style={styles.sectionArrow}>
                →
              </ThemedText>
            </View>
            <Card style={styles.feedCard}>
              <View style={[styles.feedImage, { backgroundColor: colors.surfaceVariant }]}>
                <ThemedText variant="h1" color="textSecondary">
                  🏔️
                </ThemedText>
              </View>
              <View style={styles.feedContent}>
                <View style={styles.feedInfo}>
                  <ThemedText variant="h4" color="text">
                    Event Name
                  </ThemedText>
                  <ThemedText variant="body" color="textSecondary">
                    Event details
                  </ThemedText>
                </View>
                <View style={[styles.playButton, { backgroundColor: colors.accent }]}>
                  <ThemedText variant="body" color="onAccent">
                    ▶
                  </ThemedText>
                </View>
              </View>
            </Card>
          </View>

          {/* Your Posts Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
            <TouchableOpacity onPress={() => navigation.navigate('You')}>
              <ThemedText variant="h3" color="text">
                Your Posts 
              </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate('You')}>
                <ThemedText variant="body" color="textSecondary" style={styles.sectionArrow}>
                →
                </ThemedText>
              </TouchableOpacity>
            </View>
            <View style={styles.postsGrid}>
              {[1, 2, 3, 4].map((post) => (
                <View key={post} style={styles.postItem}>
                  <View style={[styles.postImage, { backgroundColor: colors.surfaceVariant }]}>
                    <ThemedText variant="h4" color="textSecondary">
                      🏔️
                    </ThemedText>
                  </View>
                  <ThemedText variant="caption" color="text" style={styles.postLabel}>
                    Label
                  </ThemedText>
                </View>
              ))}
            </View>
          </View>
        </Container>
      </ScrollView>
    </SafeAreaView>
  );
}

const screenWidth = Dimensions.get('window').width;
const spacingOffset = spacing.md; // adjust based on your margin

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  header: {
    alignItems: 'flex-start',
    marginBottom: spacing.xl,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: spacing.sm,
  },
  appTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeText: {
    // Welcome text styling
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  sectionArrow: {
    fontSize: 18,
    fontWeight: '600',
  },
  friendsList: {
    paddingRight: spacing.md,
  },
  friendItem: {
    alignItems: 'center',
    marginRight: spacing.lg,
  },
  friendAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  friendLabel: {
    textAlign: 'center',
  },
  feedCard: {
    padding: 0,
    overflow: 'hidden',
  },
  feedImage: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  feedContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
  },
  feedInfo: {
    flex: 1,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  
  },
  postItem: {
    width: '48%',
    marginBottom: 16,
  },
  postImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  postLabel: {
    textAlign: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: 'red',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  pendingSection: {
    marginBottom: spacing.lg,
  },
  pendingTitle: {
    marginBottom: spacing.md,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
});
