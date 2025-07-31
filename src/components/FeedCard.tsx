import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useState } from 'react';
import { Dimensions, Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { FeedStackParamList } from '../navigation/FeedStack';
import { spacing, ThemedText, useTheme } from '../theme/ui';
import { CommentSection } from './CommentSection';

type FeedCardNavigationProp = StackNavigationProp<FeedStackParamList>;

type FeedCardProps = {
  post: any;
  onLike: (postId: string, hasLiked: boolean) => void;
};

const screenWidth = Dimensions.get('window').width;

export const FeedCard = ({ post, onLike }: FeedCardProps) => {
  const { colors } = useTheme();
  const navigation = useNavigation<FeedCardNavigationProp>();
  const [showComments, setShowComments] = useState(false);

  // Stub images for demo purposes
  const stubImages = [
    'https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1551632811-561732d1e306?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1522163182402-834f871fd851?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
  ];

  const imageUrl = post.image_url || stubImages[Math.floor(Math.random() * stubImages.length)];

  return (
    <View style={[styles.postCard, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.postHeader}>
        <TouchableOpacity 
          style={styles.avatarRow}
        >
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

          <View style={styles.userInfo}>
            <ThemedText variant="body" color="text" style={styles.username}>
              {post.profiles?.username || 'Anonymous'}
            </ThemedText>
            <ThemedText variant="caption" color="textSecondary">
              {new Date(post.created_at).toLocaleDateString()}
            </ThemedText>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-horizontal" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Post Image */}
      <Image
        source={{ uri: imageUrl }}
        style={styles.postImage}
        resizeMode="cover"
      />

      {/* Actions Bar */}
      <View style={styles.actionsBar}>
        <View style={styles.leftActions}>
          <TouchableOpacity
            onPress={() => onLike(post.id, post.hasLiked)}
            style={styles.actionButton}
          >
            <Ionicons
              name={post.hasLiked ? 'heart' : 'heart-outline'}
              size={22}
              color={post.hasLiked ? '#FF3040' : colors.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              navigation.navigate('PostComments', {
                postId: post.id,
                username: post.profiles?.username
              });
            }}
          >
            <Ionicons name="chatbubble-outline" size={22} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="paper-plane-outline" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="bookmark-outline" size={22} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Likes Count */}
      <View style={styles.likesSection}>
        <ThemedText variant="body" color="text" style={styles.likesText}>
          {post.likes} {post.likes === 1 ? 'like' : 'likes'}
        </ThemedText>
      </View>

      {/* Content */}
      {post.description && (
        <View style={styles.contentSection}>
          <ThemedText variant="body" color="text">
            <ThemedText style={styles.username}>{post.profiles?.username || 'Anonymous'}</ThemedText>
            {' ' + post.description}
          </ThemedText>
        </View>
      )}

      {/* Comments Section - Show only most recent comment */}
      <CommentSection postId={post.id} collapsed={true} />
    </View>
  );
};

const styles = StyleSheet.create({
  postCard: {
    backgroundColor: 'white',
    marginBottom: spacing.sm,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  userInfo: {
    flex: 1,
  },
  moreButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postImage: {
    width: screenWidth,
    height: Math.min(screenWidth * 0.75, 400), // Better aspect ratio for mobile
    backgroundColor: '#f0f0f0',
  },
  actionsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    marginRight: spacing.sm,
    padding: spacing.xs,
  },
  likesSection: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xs,
  },
  likesText: {
    fontWeight: '600',
  },
  contentSection: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  username: {
    fontWeight: '600',
  },
});