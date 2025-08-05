import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import EditProfileModal from '../components/EditProfileModal';
import { useAuth } from '../context/AuthContext';
import { useFriends } from '../hooks/useFriends';
import { useProfile } from '../hooks/useProfile';
import { Container, spacing, ThemedText, useTheme } from '../theme/ui';

// Simple User Icon Component
const UserIcon = ({ size = 40, color = '#888' }) => (
  <View style={{
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  }}>
    <ThemedText style={{ 
      fontSize: size * 0.5, 
      color,
    }}>
      👤
    </ThemedText>
  </View>
);

export default function ProfileScreen() {
  const { colors } = useTheme();
  const { friends } = useFriends();
  const { user } = useAuth();
  const navigation = useNavigation();
  const { profile, userPosts, userEvents, isLoading, refreshProfile } = useProfile();

  const [modalVisible, setModalVisible] = useState(false);

  const userName = user?.user_metadata?.username || user?.email?.split('@')[0] || 'User';
  const bio = profile?.bio || 'This is a short bio about the user. It can include hobbies, interests, or anything else.';
  const profilePicture = profile?.avatar_url || user?.user_metadata?.avatar_url || null;

  const handleProfileUpdated = (newBio: string, newAvatar: string | null) => {
    // Refresh profile data to get latest updates
    refreshProfile();
  };

  const handleContentPress = (item: any) => {
    if (item.title) {
      // It's an event - for now navigate to Home tab (future: navigate to EventDetails)
      navigation.navigate('Home' as never);
    } else {
      // It's a post - navigate to PostDetail to view the full post
      navigation.navigate('PostDetail' as never, { postId: item.id } as never);
    }
  };

  // Combine posts and events, sorted by creation date
  const allContent = [...userPosts, ...userEvents]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 12); // Show max 12 items

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView>
        <Container style={styles.content}>
          {/* Profile Header */}
          <View style={styles.header}>
            {profilePicture ? (
              <Image
                source={{ uri: profilePicture }}
                style={styles.profilePicture}
              />
            ) : (
              <UserIcon size={80} />
            )}
            
            <View style={styles.headerInfo}>
              <ThemedText variant="h3" color="text">
                {userName}
              </ThemedText>
              <ThemedText variant="body" color="textSecondary">
                {bio}
              </ThemedText>
            </View>
          </View>

          {/* Stats Section */}
          <View style={styles.stats}>
            <View style={styles.statItem}>
              <ThemedText variant="h3" color="text">
                {userPosts.length}
              </ThemedText>
              <ThemedText variant="body" color="textSecondary">
                Posts
              </ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText variant="h3" color="text">
                {friends.length}
              </ThemedText>
              <ThemedText variant="body" color="textSecondary">
                Friends
              </ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText variant="h3" color="text">
                {userEvents.length}
              </ThemedText>
              <ThemedText variant="body" color="textSecondary">
                Events
              </ThemedText>
            </View>
          </View>

          {/* Edit Profile Button */}
          <TouchableOpacity style={styles.editButton} onPress={() => setModalVisible(true)}>
            <ThemedText variant="body" color="accent">
              Edit Profile
            </ThemedText>
          </TouchableOpacity>

          {/* Content Grid - Posts and Events */}
          <View style={styles.postsGrid}>
            {isLoading ? (
              // Loading placeholder
              Array(6).fill(0).map((_, index) => (
                <View key={`loading-${index}`} style={[styles.postItem, styles.loadingItem, { backgroundColor: colors.surface }]} />
              ))
            ) : allContent.length > 0 ? (
              allContent.map((item, index) => (
                <TouchableOpacity 
                  key={item.id || index} 
                  style={styles.postItem}
                  onPress={() => handleContentPress(item)}
                >
                  {item.image_url ? (
                    <Image source={{ uri: item.image_url }} style={styles.postImage} />
                  ) : (
                    <View style={[styles.postImage, styles.noImagePost, { backgroundColor: colors.surface }]}>
                      <ThemedText variant="caption" color="textSecondary" style={styles.noImageText}>
                        {item.title ? '📅' : '📝'}
                      </ThemedText>
                    </View>
                  )}
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyState}>
                <ThemedText variant="body" color="textSecondary">
                  No posts yet. Start sharing your climbing adventures!
                </ThemedText>
              </View>
            )}
          </View>
        </Container>
      </ScrollView>

      {/* Edit Profile Modal */}
      <EditProfileModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        currentBio={bio}
        currentAvatar={profilePicture}
        userName={userName}
        onProfileUpdated={handleProfileUpdated}
      />
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
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  profilePicture: {
    width: 80,
    height: 80,
    borderRadius: 40, // Makes the image circular
    marginRight: spacing.md,
  },
  headerInfo: {
    flex: 1,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  statItem: {
    alignItems: 'center',
    marginHorizontal: spacing.md,
  },
  editButton: {
    alignSelf: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
    marginBottom: spacing.lg,
  },
  postsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  postItem: {
    width: '31%', // Adjust to fit 3 items per row with spacing
    aspectRatio: 1, // Ensures square images
    marginBottom: spacing.sm,
    borderRadius: 8,
    overflow: 'hidden',
  },
  loadingItem: {
    backgroundColor: '#f0f0f0',
  },
  postImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  noImagePost: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
  },
  noImageText: {
    fontSize: 24,
    textAlign: 'center',
  },
  emptyState: {
    width: '100%',
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
});