/**
 * Feed Screen - Enhanced with real-time data and proper image handling
 */

import React from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FeedCard } from '../components/FeedCard';
import { useFeedPosts } from '../hooks/useFeedPosts';
import { FeedItem } from '../services/feedService';
import { spacing, ThemedText, useTheme } from '../theme/ui';

export default function FeedScreen() {
  const { colors } = useTheme();
  const { posts, loading, error, handleLikeToggle: toggleLike, refreshPosts } = useFeedPosts();
  const [refreshing, setRefreshing] = React.useState(false);

  const handleLikeToggle = async (postId: string, hasLiked: boolean) => {
    await toggleLike(postId, hasLiked);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshPosts();
    setRefreshing(false);
  };

  const renderItem = ({ item }: { item: FeedItem }) => (
    <FeedCard post={item} onLike={handleLikeToggle} />
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <ThemedText variant="h2" color="text" style={styles.title}>
        Feed
      </ThemedText>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.empty}>
      <ThemedText variant="body" color="textSecondary">
        No posts found.
      </ThemedText>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={posts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={!loading ? renderEmptyState : null}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.accent]}
            tintColor={colors.accent}
          />
        }
        contentContainerStyle={[
          posts.length === 0 && !loading ? styles.emptyContainer : styles.contentContainer,
          { paddingBottom: spacing.xxl } // Add bottom padding for all content
        ]}
      />
      
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.accent} size="large" />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  title: { 
    fontWeight: '600',
  },
  empty: { 
    padding: spacing.lg,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  contentContainer: {
    flexGrow: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
});