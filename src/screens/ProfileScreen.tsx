import React from 'react';
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Container, spacing, ThemedText, useTheme } from '../theme/ui';
import { useAuth } from '../context/AuthContext';
export default function ProfileScreen() {
  const { colors } = useTheme();

  const mockPosts = Array(12).fill(require('../../assets/images/splash-icon.png')); // Mock post images
  const { user } = useAuth();
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView>
        <Container style={styles.content}>
          {/* Profile Header */}
          <View style={styles.header}>
            <Image
              source={ require('../../assets/images/splash-icon.png') } // Mock profile picture
              style={styles.profilePicture}
            />
            <View style={styles.headerInfo}>
              <ThemedText variant="h3" color="text">
                {user?.user_metadata?.username || 'Username'}
              </ThemedText>
              <ThemedText variant="body" color="textSecondary">
                This is a short bio about the user. It can include hobbies, interests, or anything else.
              </ThemedText>
            </View>
          </View>

          {/* Stats Section */}
          <View style={styles.stats}>
            <View style={styles.statItem}>
              <ThemedText variant="h3" color="text">
                120
              </ThemedText>
              <ThemedText variant="body" color="textSecondary">
                Posts
              </ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText variant="h3" color="text">
                300
              </ThemedText>
              <ThemedText variant="body" color="textSecondary">
                Followers
              </ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText variant="h3" color="text">
                180
              </ThemedText>
              <ThemedText variant="body" color="textSecondary">
                Following
              </ThemedText>
            </View>
          </View>

          {/* Edit Profile Button */}
          <TouchableOpacity style={styles.editButton}>
            <ThemedText variant="body" color="accent">
              Edit Profile
            </ThemedText>
          </TouchableOpacity>

          {/* Posts Grid */}
          <View style={styles.postsGrid}>
            {mockPosts.map((post, index) => (
              <Image key={index} source={post } style={styles.postItem} />
            ))}
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
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  statItem: {
    alignItems: 'center',
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