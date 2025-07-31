/**
 * Feed Screen
 */

import React from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FeedCard } from '../components/FeedCard';
import { useFeed } from '../hooks/useFeed';
import { spacing, ThemedText, useTheme } from '../theme/ui';

export default function FeedScreen() {
  const { colors } = useTheme();
  const { posts, loading, refreshing, handleLikeToggle, refresh } = useFeed();

  const renderItem = ({ item }: { item: any }) => (
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
            onRefresh={refresh}
            colors={[colors.accent]}
            tintColor={colors.accent}
          />
        }
        contentContainerStyle={posts.length === 0 && !loading ? styles.emptyContainer : undefined}
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