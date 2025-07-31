import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Card, spacing, ThemedText, useTheme } from '../theme/ui';
import { CommentSection } from './CommentSection';

type FeedCardProps = {
  post: any;
  onLike: (postId: string, hasLiked: boolean) => void;
};

export const FeedCard = ({ post, onLike }: FeedCardProps) => {
  const { colors } = useTheme();
  const [showAllComments, setShowAllComments] = useState(false);

  return (
    <Card style={styles.postCard}>
      {/* Header */}
      <View style={styles.postHeader}>
        <View style={styles.avatarRow}>
          {post.profiles?.avatar_url ? (
            <Image
              source={{ uri: post.profiles.avatar_url }}
              style={styles.avatar}
            />
          ) : (
            <View style={[styles.avatar, { backgroundColor: colors.surfaceVariant }]}>
              <ThemedText variant="caption" color="textSecondary">
                {post.profiles?.username?.charAt(0).toUpperCase() ?? '?'}
              </ThemedText>
            </View>
          )}

          <View>
            <ThemedText variant="h4" color="text">
              {post.profiles?.username || 'Anonymous'}
            </ThemedText>
            <ThemedText variant="caption" color="textSecondary">
              {new Date(post.created_at).toLocaleString()}
            </ThemedText>
          </View>
        </View>
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
          onPress={() => onLike(post.id, post.hasLiked)}
          style={styles.actionButton}
        >
          <Ionicons
            name={post.hasLiked ? 'heart' : 'heart-outline'}
            size={20}
            color={post.hasLiked ? colors.accent : colors.textSecondary}
          />
          <ThemedText variant="body" color="accent" style={styles.likeText}>
            {post.likes}
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setShowAllComments(!showAllComments)}
        >
          <Ionicons name="chatbubble-outline" size={20} color={colors.textSecondary} />
          <ThemedText variant="body" color="textSecondary">
            {showAllComments ? 'Hide' : 'View Comments'}
          </ThemedText>
        </TouchableOpacity>
      </View>

      <CommentSection postId={post.id} collapsed={!showAllComments} />
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
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
});