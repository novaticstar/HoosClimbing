import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import EditProfileModal from '../components/EditProfileModal';
import { useAuth } from '../context/AuthContext';
import { useFriends } from '../hooks/useFriends';
import { ProfileService } from '../services/profileService';
import { Container, spacing, ThemedText, useTheme } from '../theme/ui';

export default function ProfileScreen() {
  const { colors } = useTheme();
  const { friends } = useFriends();
  const { user } = useAuth();

  const mockPosts = Array(12).fill(require('../../assets/images/splash-icon.png')); // Mock post images

  const [modalVisible, setModalVisible] = useState(false);
  const [bio, setBio] = useState('This is a short bio about the user. It can include hobbies, interests, or anything else.');
  const [profilePicture, setProfilePicture] = useState<string | null>(
    user?.user_metadata?.avatar_url || null
  );

  useEffect(() => {
    async function loadProfile() {
      const profile = await ProfileService.getUserProfile();
      if (profile) {
        setBio(profile.bio || 'This is a short bio about the user. It can include hobbies, interests, or anything else.');
        setProfilePicture(profile.avatar_url || user?.user_metadata?.avatar_url || null);
      }
    }

    loadProfile();
  }, [user]);

  const handleProfileUpdated = (newBio: string, newAvatar: string | null) => {
    setBio(newBio);
    setProfilePicture(newAvatar);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView>
        <Container style={styles.content}>
          {/* Profile Header */}
          <View style={styles.header}>
            <Image
              source={
                profilePicture
                  ? { uri: profilePicture }
                  : require('../../assets/images/splash-icon.png')
              }
              style={styles.profilePicture}
            />
            
            <View style={styles.headerInfo}>
              <ThemedText variant="h3" color="text">
                {user?.user_metadata?.username || 'Username'}
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
                0
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
          </View>

          {/* Edit Profile Button */}
          <TouchableOpacity style={styles.editButton} onPress={() => setModalVisible(true)}>
            <ThemedText variant="body" color="accent">
              Edit Profile
            </ThemedText>
          </TouchableOpacity>

          {/* Posts Grid */}
          <View style={styles.postsGrid}>
            {mockPosts.map((post, index) => (
              <Image key={index} source={post} style={styles.postItem} />
            ))}
          </View>
        </Container>
      </ScrollView>

      {/* Edit Profile Modal */}
      <EditProfileModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        currentBio={bio}
        currentAvatar={profilePicture}
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
  },
});