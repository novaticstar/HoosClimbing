/**
 * Feed Screen - Enhanced with real-time data and proper image handling
 */

import React from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { FeedCard } from '../components/FeedCard';
import { useFeedPosts } from '../hooks/useFeedPosts';
import { FeedItem } from '../services/feedService';
import { spacing, ThemedText, useTheme } from '../theme/ui';

export default function FeedScreen() {
  const { colors } = useTheme();
  const { posts, loading, error, handleLikeToggle: toggleLike, refreshPosts } = useFeedPosts();
  const [refreshing, setRefreshing] = React.useState(false);
  const listRef = React.useRef<FlatList<FeedItem>>(null);
  const [showScrollToTop, setShowScrollToTop] = React.useState(false);

  const handleLikeToggle = async (postId: string, hasLiked: boolean) => {
    await toggleLike(postId, hasLiked);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshPosts();
    setRefreshing(false);
  };

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setShowScrollToTop(offsetY > 300); // show button when user scrolls 300px down
  };

  const scrollToTop = () => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
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
        ref={listRef}
        data={posts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={!loading ? renderEmptyState : null}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
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

      {showScrollToTop && (
        <TouchableOpacity
          style={[styles.scrollTopButton, { backgroundColor: colors.accent }]}
          onPress={scrollToTop}
        >
          <Ionicons name="arrow-up" size={24} color={colors.onAccent} />
        </TouchableOpacity>
      )}
      
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
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  title: {
    marginBottom: spacing.lg,
    padding: spacing.md,
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
  scrollTopButton: {
    position: 'absolute',
    bottom: spacing.lg,
    right: spacing.lg,
    padding: spacing.md,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
  },
});