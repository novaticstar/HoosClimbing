/**
 * Home Screen
 */

import { Ionicons } from '@expo/vector-icons';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Dimensions, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Menu } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FriendCard } from '../components/FriendCard';
import { useAuth } from '../context/AuthContext';
import { useAppStateSync } from '../hooks/useAppStateSync';
import { useRealtimeFriends as useFriends } from '../hooks/useRealtimeFriends';
import { useRealtimeNotifications } from '../hooks/useRealtimeNotifications';
import { User } from '../services/friendsService';
import { useTopPost } from '../hooks/useTopPost';
import type { AppTabsParamList } from '../navigation/AppTabs';
import { Card, Container, spacing, ThemedText, useTheme } from '../theme/ui';
export default function HomeScreen() {
  const { colors } = useTheme();
  const { user, signOut } = useAuth();
  const { 
    friends, 
    pendingRequests, 
    sentRequests,
    loading, 
    refreshing,
    acceptFriendRequest,
    removeFriend,
    cancelFriendRequest,
    refresh
  } = useFriends();
  const { unreadCount } = useRealtimeNotifications();
  const navigation = useNavigation<BottomTabNavigationProp<AppTabsParamList>>();
  const [menuVisible, setMenuVisible] = useState(false);

  // Sync data when app comes to foreground
  useAppStateSync(() => {
    refresh();
  });

  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  const hasPendingRequests = pendingRequests.length > 0;
  const totalNotifications = unreadCount > 0 ? unreadCount : pendingRequests.length;

  const { post: topPost, loading: topPostLoading } = useTopPost();


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
                  {totalNotifications > 0 && (
                    <View style={[styles.notificationBadge, { backgroundColor: colors.accent }]}>
                      <ThemedText variant="caption" color="onAccent" style={styles.badgeText}>
                        {totalNotifications}
                      </ThemedText>
                    </View>
                  )}
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
            <TouchableOpacity 
              style={styles.sectionHeader}
              onPress={() => navigation.navigate('Friends')}
              activeOpacity={0.7}
            >
              <ThemedText variant="h3" color="text">
                Friends →
              </ThemedText>
            </TouchableOpacity>
            {/* Current Friends */}
            {friends.length > 0 && (
              <View style={styles.pendingSection}>
                <TouchableOpacity onPress={() => navigation.navigate('Friends')}>
                  <ThemedText variant="body" color="text" style={styles.pendingTitle}>
                    Your Friends
                  </ThemedText>
                </TouchableOpacity>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.friendsList}
                  nestedScrollEnabled={true}
                  style={{ overflow: 'visible' }}
                >
                  {friends.map((user: User) => (
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
          </View>

          {/* Feed Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <TouchableOpacity 
              style={styles.sectionHeader}
              onPress={() => navigation.navigate('Feed')}
              activeOpacity={0.7}
            >
                <ThemedText variant="h3" color="text">Feed →</ThemedText>
              </TouchableOpacity>
            </View>

            {topPostLoading ? (
              <ThemedText variant="body" color="textSecondary">
                Loading top post...
              </ThemedText>
            ) : topPost ? (
              <Card style={styles.feedCard}>
                <View style={styles.feedImage}>
                  <ThemedText variant="h1" color="textSecondary">🧗‍♂️</ThemedText>
                </View>
                <View style={styles.feedContent}>
                  <View style={styles.feedInfo}>
                    <ThemedText variant="h4" color="text">
                      {topPost.profiles?.username || 'Anonymous'}
                    </ThemedText>
                    {topPost.description && (
                      <ThemedText variant="body" color="textSecondary">
                        {topPost.description}
                      </ThemedText>
                    )}
                  </View>
                  <View style={[styles.playButton, { backgroundColor: colors.accent }]}>
                    <ThemedText variant="body" color="onAccent">▶</ThemedText>
                  </View>
                </View>
              </Card>
            ) : (
              <ThemedText variant="body" color="textSecondary">
                No posts yet. Be the first to post!
              </ThemedText>
            )}
          </View>

          {/* Events Section */}
          <View style={styles.section}>
              <TouchableOpacity 
              style={styles.sectionHeader}
              onPress={() => navigation.navigate('EventsTest')}
              activeOpacity={0.7}
            >
                <ThemedText variant="h3" color="text">Events →</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => navigation.navigate('EventsTest')}>
                <Card style={styles.feedCard}>
                  <View style={[styles.feedImage, { backgroundColor: colors.surfaceVariant }]}>
                    <ThemedText variant="h1" color="textSecondary">🏔️</ThemedText>
                  </View>
                  <View style={styles.feedContent}>
                    <View style={styles.feedInfo}>
                      <ThemedText variant="h4" color="text">Next Event Title</ThemedText>
                      <ThemedText variant="body" color="textSecondary">Short description or date</ThemedText>
                    </View>
                    <View style={[styles.playButton, { backgroundColor: colors.accent }]}>
                      <ThemedText variant="body" color="onAccent">▶</ThemedText>
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>
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
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
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
    overflow: 'visible',
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
    fontSize: 10,
    fontWeight: '600',
  },
  pendingSection: {
    marginBottom: spacing.lg,
    overflow: 'visible',
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
