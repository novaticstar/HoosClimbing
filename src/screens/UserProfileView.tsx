/**
 * User Profile View Screen
 * Used to view other users' profiles from the Friends screen
 * Updated to match the better UserProfileScreen design
 */

import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { User } from '../services/friendsService';
import { Container, spacing, ThemedText, useTheme } from '../theme/ui';

interface UserProfileViewProps {
  user: User;
  onClose: () => void;
  friendshipStatus?: 'friend' | 'pending' | 'sent' | 'none';
  onAddFriend?: (userId: string) => Promise<boolean>;
  onRemoveFriend?: (userId: string) => Promise<boolean>;
  onAcceptFriend?: (userId: string) => Promise<boolean>;
  onCancelRequest?: (userId: string) => Promise<boolean>;
  friendCount?: number;
}

export default function UserProfileView({ 
  user, 
  onClose, 
  friendshipStatus = 'none',
  onAddFriend,
  onRemoveFriend,
  onAcceptFriend,
  onCancelRequest,
  friendCount = 0
}: UserProfileViewProps) {
  const { colors } = useTheme();
  const { user: currentUser } = useAuth();
  const navigation = useNavigation();
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actualFriendCount, setActualFriendCount] = useState(friendCount);

  useEffect(() => {
    fetchUserData();
  }, [user.id]);

  const fetchUserData = async () => {
    setIsLoading(true);
    try {
      // Fetch user's posts
      const { data: posts } = await supabase
        .from('feed')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(12);

      // Fetch friend count
      const { count } = await supabase
        .from('friends')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'accepted');

      setUserPosts(posts || []);
      setActualFriendCount(count || 0);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDisplayName = () => {
    return user.username || user.full_name || (user.email ? user.email.split('@')[0] : 'Unknown User');
  };

  const getFriendButtonText = () => {
    switch (friendshipStatus) {
      case 'friend': return 'Remove Friend';
      case 'pending': return 'Accept Request';
      case 'sent': return 'Request Sent';
      default: return 'Add Friend';
    }
  };

  const handleFriendAction = async () => {
    switch (friendshipStatus) {
      case 'none':
        if (onAddFriend) await onAddFriend(user.id);
        break;
      case 'friend':
        if (onRemoveFriend) await onRemoveFriend(user.id);
        break;
      case 'pending':
        if (onAcceptFriend) await onAcceptFriend(user.id);
        break;
      case 'sent':
        if (onCancelRequest) await onCancelRequest(user.id);
        break;
    }
  };

  const handlePostPress = (post: any) => {
    // Navigate to PostDetail to view the full post
    try {
     // navigation.navigate('PostDetail' as never, { postId: post.id } as never);
    } catch (error) {
      console.log('Navigation error:', error);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={onClose} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText variant="h3" color="text" style={styles.headerTitle}>
          {getDisplayName()}
        </ThemedText>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content}>
        <Container>
          {/* Profile Section */}
          <View style={styles.profileSection}>
            {user.avatar_url ? (
              <Image
                source={{ uri: user.avatar_url }}
                style={styles.avatar}
              />
            ) : (
              <View style={[styles.avatar, { backgroundColor: colors.surfaceVariant }]}>
                <ThemedText variant="h1" color="textSecondary">
                  {getDisplayName().charAt(0).toUpperCase()}
                </ThemedText>
              </View>
            )}

            <ThemedText variant="h2" color="text" style={styles.displayName}>
              {getDisplayName()}
            </ThemedText>
            
            {user.username && user.username !== getDisplayName() && (
              <ThemedText variant="body" color="textSecondary" style={styles.username}>
                @{user.username}
              </ThemedText>
            )}

            {user.bio && (
              <ThemedText variant="body" color="text" style={styles.bio}>
                {user.bio}
              </ThemedText>
            )}

            <ThemedText variant="caption" color="textSecondary" style={styles.joinDate}>
              Joined {new Date(user.created_at || Date.now()).toLocaleDateString()}
            </ThemedText>
          </View>

          {/* Stats Section */}
          <View style={styles.statsSection}>
            <View style={styles.statItem}>
              <ThemedText variant="h3" color="text">{userPosts.length}</ThemedText>
              <ThemedText variant="caption" color="textSecondary">Posts</ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText variant="h3" color="text">{actualFriendCount}</ThemedText>
              <ThemedText variant="caption" color="textSecondary">Friends</ThemedText>
            </View>
          </View>

          {/* Action Buttons */}
          {currentUser?.id !== user.id && (
            <View style={styles.actionSection}>
              <TouchableOpacity 
                style={[
                  styles.actionButton, 
                  { backgroundColor: friendshipStatus === 'friend' ? colors.surface : colors.accent }
                ]}
                onPress={handleFriendAction}
                disabled={friendshipStatus === 'sent'}
              >
                <ThemedText 
                  variant="body" 
                  color={friendshipStatus === 'friend' ? "text" : "surface"} 
                  style={styles.actionButtonText}
                >
                  {getFriendButtonText()}
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }]}>
                <ThemedText variant="body" color="text" style={styles.actionButtonText}>
                  Message
                </ThemedText>
              </TouchableOpacity>
            </View>
          )}

          {/* Posts Grid */}
          <View style={styles.postsSection}>
            <ThemedText variant="h3" color="text" style={styles.sectionTitle}>
              Posts
            </ThemedText>
            
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.accent} />
              </View>
            ) : userPosts.length > 0 ? (
              <View style={styles.postsGrid}>
                {userPosts.map((post) => (
                  <TouchableOpacity 
                    key={post.id} 
                    style={styles.postItem}
                    onPress={() => handlePostPress(post)}
                  >
                    {post.image_url ? (
                      <Image source={{ uri: post.image_url }} style={styles.postImage} />
                    ) : (
                      <View style={[styles.postImage, styles.noImagePost, { backgroundColor: colors.surface }]}>
                        <ThemedText variant="caption" color="textSecondary">
                          📝
                        </ThemedText>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <ThemedText variant="body" color="textSecondary">
                  No posts yet
                </ThemedText>
              </View>
            )}
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
  },
  backButton: {
    padding: spacing.sm,
    marginLeft: -spacing.sm,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  headerSpacer: {
    width: 44,
  },
  content: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  displayName: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  username: {
    fontSize: 16,
    marginBottom: spacing.md,
  },
  bio: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    lineHeight: 22,
  },
  joinDate: {
    fontSize: 14,
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    maxWidth: 300,
    alignSelf: 'center',

  },
  statItem: {
    alignItems: 'center',
    
  },
  actionSection: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  postsSection: {
    paddingTop: spacing.lg,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: spacing.lg,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  postsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 2,
  },
  postItem: {
    width: '32%',
    aspectRatio: 1,
    marginBottom: 2,
  },
  postImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  noImagePost: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
});
