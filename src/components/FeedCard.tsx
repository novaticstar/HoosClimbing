import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Card, spacing, ThemedText, useTheme } from '../theme/ui';
import { Ionicons } from '@expo/vector-icons';
import { CommentSection } from './CommentSection';

type FeedCardProps = {
  post: any;
  onLike: (postId: string, currentLikes: number) => void;
};

export const FeedCard = ({ post, onLike }: FeedCardProps) => {
  const { colors } = useTheme();

  return (
    <Card style={styles.postCard}>
      {/* Header */}
      <View style={styles.postHeader}>
        <ThemedText variant="h4" color="text">
          {post.profiles?.username || 'Anonymous'}
        </ThemedText>
        <ThemedText variant="caption" color="textSecondary">
          {new Date(post.created_at).toLocaleString()}
        </ThemedText>
      </View>

      {/* Content */}
      <View style={styles.postContent}>
        <ThemedText variant="body" color="text">
          {post.description}
        </ThemedText>
      </View>

      {/* Actions */}
      <View style={styles.postActions}>
        <TouchableOpacity
          onPress={() => onLike(post.id, post.likes)}
          style={styles.actionButton}
        >
          <Ionicons name="heart-outline" size={20} color={colors.accent} />
          <ThemedText variant="body" color="accent" style={styles.likeText}>
            {post.likes}
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={20} color={colors.textSecondary} />
          <ThemedText variant="body" color="textSecondary">Comment</ThemedText>
        </TouchableOpacity>
      </View>

      {/* Comment Section */}
      <CommentSection postId={post.id} />
    </Card>
  );
};

const styles = StyleSheet.create({
  postCard: {
    marginBottom: spacing.lg,
    padding: spacing.md,
  },
  postHeader: {
    marginBottom: spacing.sm,
  },
  postContent: {
    marginBottom: spacing.sm,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  likeText: {
    marginLeft: spacing.xs,
  },
});