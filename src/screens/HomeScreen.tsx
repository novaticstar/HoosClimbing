/**
 * Home Screen
 */

import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { uvaColors } from '../theme/colors';
import { Card, Container, spacing, ThemedText, useTheme } from '../theme/ui';

export default function HomeScreen() {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Container style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.appTitle}>
              <ThemedText variant="h1" color="accent">
                Hoos
              </ThemedText>
              <ThemedText variant="h1" color="text">
                Climbing?
              </ThemedText>
            </View>
            <ThemedText variant="h4" color="text" style={styles.welcomeText}>
              Welcome [user]!
            </ThemedText>
          </View>

          {/* Friends Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText variant="h3" color="text">
                Friends
              </ThemedText>
              <ThemedText variant="body" color="textSecondary" style={styles.sectionArrow}>
                →
              </ThemedText>
            </View>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.friendsList}
            >
              {[1, 2, 3, 4].map((friend) => (
                <View key={friend} style={styles.friendItem}>
                  <View style={[styles.friendAvatar, { backgroundColor: colors.surfaceVariant }]}>
                    <ThemedText variant="h3" color="textSecondary">
                      👤
                    </ThemedText>
                  </View>
                  <ThemedText variant="caption" color="text" style={styles.friendLabel}>
                    Label
                  </ThemedText>
                </View>
              ))}
            </ScrollView>
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
              <ThemedText variant="h3" color="text">
                Your Posts
              </ThemedText>
              <ThemedText variant="body" color="textSecondary" style={styles.sectionArrow}>
                →
              </ThemedText>
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
  appTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
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
    gap: spacing.md,
  },
  postItem: {
    width: '48%',
    alignItems: 'center',
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
});
