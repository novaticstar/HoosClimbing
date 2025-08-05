/**
 * Post Detail Screen - Individual post view
 * Displays a single post with full comments and interactions
 */

import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CommentSection } from '../components/CommentSection';
import { FeedCard } from '../components/FeedCard';
import { FeedStackParamList } from '../navigation/FeedStack';
import { FeedItem, FeedService } from '../services/feedService';
import { spacing, ThemedText, useTheme } from '../theme/ui';

type PostDetailScreenNavigationProp = StackNavigationProp<FeedStackParamList>;
type PostDetailScreenRouteProp = {
  key: string;
  name: string;
  params: {
    postId: string;
  };
};

export default function PostDetailScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<PostDetailScreenNavigationProp>();
  const route = useRoute<PostDetailScreenRouteProp>();
  const { postId } = route.params;

  const [post, setPost] = useState<FeedItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPost();
  }, [postId]);

  const loadPost = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get single post - we'll need to add this method to FeedService
      const postData = await FeedService.getPostById(postId);
      
      if (postData) {
        setPost(postData);
      } else {
        setError('Post not found');
      }
    } catch (err) {
      console.error('Error loading post:', err);
      setError('Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  const handleLikeToggle = async (postId: string, hasLiked: boolean) => {
    if (!post || hasLiked) return;
    
    try {
      const success = await FeedService.likePost(postId, post.likes);
      if (success) {
        // Update local state
        setPost(prev => prev ? {
          ...prev,
          likes: prev.likes + 1,
          hasLiked: true
        } : null);
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <ThemedText variant="h3" color="text" style={styles.headerTitle}>
            Post
          </ThemedText>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !post) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <ThemedText variant="h3" color="text" style={styles.headerTitle}>
            Post
          </ThemedText>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.errorContainer}>
          <ThemedText variant="body" color="textSecondary">
            {error || 'Post not found'}
          </ThemedText>
          <TouchableOpacity 
            onPress={loadPost}
            style={[styles.retryButton, { backgroundColor: colors.accent }]}
          >
            <ThemedText variant="button" color="onAccent">
              Try Again
            </ThemedText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText variant="h3" color="text" style={styles.headerTitle}>
          Post
        </ThemedText>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Post Card */}
        <FeedCard post={post} onLike={handleLikeToggle} />
        
        {/* Comments Section */}
        <View style={styles.commentsContainer}>
          <CommentSection postId={postId} />
        </View>
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
    padding: spacing.xs,
    width: 40,
  },
  headerTitle: {
    fontWeight: '600',
    textAlign: 'center',
    flex: 1,
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
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
  },
  retryButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 24,
  },
  commentsContainer: {
    paddingTop: spacing.md,
  },
});
