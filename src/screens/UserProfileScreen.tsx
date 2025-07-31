/**
 * User Profile Screen
 * View another user's profile with posts, bio, and friend functionality
 */

import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, ScrollView, StyleSheet, TouchableOpacity, View, Dimensions, PanResponder } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Container, spacing, ThemedText, useTheme } from '../theme/ui';

type UserProfileScreenRouteProp = {
  userId: string;
  username?: string;
};

type UserProfile = {
  id: string;
  username: string;
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  created_at: string;
};

type UserPost = {
  id: string;
  image_url?: string;
  description: string;
  created_at: string;
  likes: number;
};

type FriendshipStatus = 'none' | 'pending' | 'friends';

const screenWidth = Dimensions.get('window').width;

export default function UserProfileScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { userId } = route.params as UserProfileScreenRouteProp;
  const { user } = useAuth();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<UserPost[]>([]);
  const [friendshipStatus, setFriendshipStatus] = useState<FriendshipStatus>('none');
  const [friendCount, setFriendCount] = useState(0);
  const [postCount, setPostCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, [userId]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        return;
      }

      setProfile(profileData);

      // Fetch user posts
      const { data: postsData, error: postsError } = await supabase
        .from('feed')
        .select('id, image_url, description, created_at, likes')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(12);

      if (!postsError) {
        setPosts(postsData || []);
        setPostCount(postsData?.length || 0);
      }

      // Fetch friendship status if not viewing own profile
      if (user?.id && user.id !== userId) {
        const { data: friendshipData } = await supabase
          .from('friends')
          .select('status')
          .or(`and(user_id.eq.${user.id},friend_id.eq.${userId}),and(user_id.eq.${userId},friend_id.eq.${user.id})`)
          .single();

        if (friendshipData) {
          setFriendshipStatus(friendshipData.status === 'accepted' ? 'friends' : 'pending');
        }
      }

      // Fetch friend count
      const { count } = await supabase
        .from('friends')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'accepted');

      setFriendCount(count || 0);

    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFriendAction = async () => {
    if (!user?.id || user.id === userId) return;

    try {
      if (friendshipStatus === 'none') {
        // Send friend request
        const { error } = await supabase
          .from('friends')
          .insert([{
            user_id: user.id,
            friend_id: userId,
            status: 'pending'
          }]);

        if (!error) {
          setFriendshipStatus('pending');
        }
      } else if (friendshipStatus === 'friends') {
        // Remove friend
        const { error } = await supabase
          .from('friends')
          .delete()
          .or(`and(user_id.eq.${user.id},friend_id.eq.${userId}),and(user_id.eq.${userId},friend_id.eq.${user.id})`);

        if (!error) {
          setFriendshipStatus('none');
          setFriendCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error('Error updating friendship:', error);
    }
  };

  const handleSwipeGesture = (evt: any, gestureState: any) => {
    if (gestureState.dx > 100 && Math.abs(gestureState.dy) < 50) {
      navigation.goBack();
    }
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderRelease: handleSwipeGesture,
  });

  const renderPostItem = ({ item }: { item: UserPost }) => (
    <TouchableOpacity style={styles.postItem}>
      {item.image_url ? (
        <Image source={{ uri: item.image_url }} style={styles.postImage} />
      ) : (
        <View style={[styles.postImage, { backgroundColor: colors.surfaceVariant, justifyContent: 'center', alignItems: 'center' }]}>
          <Ionicons name="image-outline" size={32} color={colors.textSecondary} />
        </View>
      )}
    </TouchableOpacity>
  );

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

  const displayName = friendshipStatus === 'friends' && profile.display_name 
    ? profile.display_name 
    : profile.username;

  const getFriendButtonText = () => {
    switch (friendshipStatus) {
      case 'friends': return 'Remove Friend';
      case 'pending': return 'Request Sent';
      default: return 'Add Friend';
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} {...panResponder.panHandlers}>
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

            <ThemedText variant="h2" color="text" style={styles.displayName}>
              {displayName}
            </ThemedText>
            
            {profile.username !== displayName && (
              <ThemedText variant="body" color="textSecondary" style={styles.username}>
                @{profile.username}
              </ThemedText>
            )}

            {profile.bio && (
              <ThemedText variant="body" color="text" style={styles.bio}>
                {profile.bio}
              </ThemedText>
            )}

            <ThemedText variant="caption" color="textSecondary" style={styles.joinDate}>
              Joined {new Date(profile.created_at).toLocaleDateString()}
            </ThemedText>
          </View>

          {/* Stats Section */}
          <View style={styles.statsSection}>
            <View style={styles.statItem}>
              <ThemedText variant="h3" color="text">{postCount}</ThemedText>
              <ThemedText variant="caption" color="textSecondary">Posts</ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText variant="h3" color="text">{friendCount}</ThemedText>
              <ThemedText variant="caption" color="textSecondary">Friends</ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText variant="h3" color="text">0</ThemedText>
              <ThemedText variant="caption" color="textSecondary">Climbs</ThemedText>
            </View>
          </View>

          {/* Action Buttons */}
          {user?.id !== userId && (
            <View style={styles.actionSection}>
              <TouchableOpacity 
                style={[
                  styles.actionButton, 
                  { backgroundColor: friendshipStatus === 'friends' ? colors.surface : colors.accent }
                ]}
                onPress={handleFriendAction}
                disabled={friendshipStatus === 'pending'}
              >
                <ThemedText 
                  variant="body" 
                  color={friendshipStatus === 'friends' ? "text" : "surface"} 
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
            {posts.length === 0 ? (
              <View style={styles.emptyPosts}>
                <Ionicons name="camera-outline" size={48} color={colors.textSecondary} />
                <ThemedText variant="body" color="textSecondary" style={styles.emptyText}>
                  No posts yet
                </ThemedText>
              </View>
            ) : (
              <FlatList
                data={posts}
                renderItem={renderPostItem}
                numColumns={3}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.postsGrid}
              />
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
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  displayName: {
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  username: {
    fontWeight: '600',
    marginBottom: spacing.xs,
    color: '#666',
  },
  bio: {
    textAlign: 'center',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
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
    marginBottom: spacing.lg,
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
  postsSection: {
    paddingHorizontal: spacing.md,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  postsGrid: {
    gap: 2,
  },
  postItem: {
    width: (screenWidth - 48) / 3, // Account for padding and gaps
    height: (screenWidth - 48) / 3,
    marginRight: 2,
    marginBottom: 2,
  },
  postImage: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
  },
  emptyPosts: {
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyText: {
    marginTop: spacing.md,
  },
});
