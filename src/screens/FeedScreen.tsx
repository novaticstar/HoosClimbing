/**
 * Feed Screen
 */

import React from 'react';
import { ScrollView, StyleSheet, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Container, spacing, ThemedText, useTheme } from '../theme/ui';
import { useFeed } from '../hooks/useFeed';
import { FeedCard } from '../components/FeedCard';

export default function FeedScreen() {
  const { colors } = useTheme();
  const { posts, loading, likePost } = useFeed();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Container style={styles.content}>
          <ThemedText variant="h2" color="text" style={styles.title}>
            Feed
          </ThemedText>

          {loading ? (
            <ActivityIndicator color={colors.accent} size="large" />
          ) : posts.length === 0 ? (
            <View style={styles.empty}>
              <ThemedText variant="body" color="textSecondary">
                No posts found.
              </ThemedText>
            </View>
          ) : (
            posts.map((post) => (
              <FeedCard key={post.id} post={post} onLike={likePost} />
            ))
          )}
        </Container>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.lg },
  title: { marginBottom: spacing.lg },
  empty: { padding: spacing.md },
});