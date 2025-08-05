/**
 * Instagram/TikTok-style Comment Section Component
 * Updated to match the new design system
 */

import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { formatDistanceToNow } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { Alert, Image, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { FeedStackParamList } from '../navigation/FeedStack';
import { Comment, CommentService } from '../services/commentsService';
import { spacing, ThemedText, useTheme } from '../theme/ui';

type CommentNavigationProp = StackNavigationProp<FeedStackParamList>;

type Props = {
  postId: string;
  username?: string;
  refreshTrigger?: number; // Add refresh trigger prop
};

export function CommentSection({ postId, username, refreshTrigger }: Props) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation<CommentNavigationProp>();
  const insets = useSafeAreaInsets();

  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());

  const fetchComments = async () => {
    setLoading(true);
    const data = await CommentService.getCommentsForPost(postId, user?.id);

    // Sort comments to show most recent at top (reversed chronological order)
    const sortedData = data.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    setComments(sortedData);
    setLoading(false);
  };

  const handleAddComment = async () => {
    if (!text.trim() || !user) return;
    const success = await CommentService.addComment(postId, user.id, text.trim());
    if (success) {
      setText('');
      fetchComments();
    }
  };

  const handleAddReply = async (parentCommentId: string) => {
    if (!replyText.trim() || !user) return;
    const success = await CommentService.addComment(postId, user.id, replyText.trim(), parentCommentId);
    if (success) {
      setReplyText('');
      setReplyingToId(null);
      fetchComments();
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editText.trim()) return;
    const success = await CommentService.updateComment(commentId, editText.trim());
    if (success) {
      setEditingCommentId(null);
      setEditText('');
      fetchComments();
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    Alert.alert(
      'Delete Comment',
      'Are you sure you want to delete this comment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await CommentService.deleteComment(commentId);
            if (success) fetchComments();
          },
        },
      ]
    );
  };

  const handleLikeComment = async (commentId: string) => {
    if (!user) return;
    
    // Optimistically update the UI
    setComments(prevComments => 
      prevComments.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            hasLiked: !comment.hasLiked,
            likes: comment.hasLiked ? comment.likes - 1 : comment.likes + 1
          };
        }
        // Also check replies
        if (comment.replies) {
          const updatedReplies = comment.replies.map(reply => {
            if (reply.id === commentId) {
              return {
                ...reply,
                hasLiked: !reply.hasLiked,
                likes: reply.hasLiked ? reply.likes - 1 : reply.likes + 1
              };
            }
            return reply;
          });
          return { ...comment, replies: updatedReplies };
        }
        return comment;
      })
    );

    // Then make the API call
    const success = await CommentService.toggleCommentLike(commentId, user.id);
    if (!success) {
      // Revert the optimistic update if the API call failed
      setComments(prevComments => 
        prevComments.map(comment => {
          if (comment.id === commentId) {
            return {
              ...comment,
              hasLiked: !comment.hasLiked,
              likes: comment.hasLiked ? comment.likes + 1 : comment.likes - 1
            };
          }
          // Also check replies
          if (comment.replies) {
            const updatedReplies = comment.replies.map(reply => {
              if (reply.id === commentId) {
                return {
                  ...reply,
                  hasLiked: !reply.hasLiked,
                  likes: reply.hasLiked ? reply.likes + 1 : reply.likes - 1
                };
              }
              return reply;
            });
            return { ...comment, replies: updatedReplies };
          }
          return comment;
        })
      );
    }
  };

  const toggleReplies = (commentId: string) => {
    const newExpanded = new Set(expandedReplies);
    if (newExpanded.has(commentId)) {
      newExpanded.delete(commentId);
    } else {
      newExpanded.add(commentId);
    }
    setExpandedReplies(newExpanded);
  };

  useEffect(() => {
    fetchComments();
  }, [refreshTrigger]); // Add refreshTrigger as dependency

  const renderComment = (comment: Comment, isReply = false) => {
    const isOwn = user && comment.user_id === user.id;
    const isEditing = editingCommentId === comment.id;
    const hasReplies = comment.replies && comment.replies.length > 0;
    const showReplies = expandedReplies.has(comment.id);

    return (
      <View key={comment.id} style={[styles.commentContainer, isReply && styles.replyContainer]}>
        <View style={styles.commentRow}>
          {/* Avatar */}
          {comment.profiles?.avatar_url ? (
            <Image
              source={{ uri: comment.profiles.avatar_url }}
              style={styles.commentAvatar}
            />
          ) : (
            <View style={[styles.commentAvatar, styles.avatarFallback]}>
              <ThemedText variant="caption" color="text" style={styles.avatarText}>
                {comment.profiles?.username?.charAt(0).toUpperCase() ?? 'U'}
              </ThemedText>
            </View>
          )}

          {/* Content */}
          <View style={styles.commentContent}>
            {isEditing ? (
              <View style={styles.editContainer}>
                <TextInput
                  value={editText}
                  onChangeText={setEditText}
                  style={[styles.editInput, { backgroundColor: colors.surface, color: colors.text }]}
                  placeholder="Edit your comment"
                  placeholderTextColor={colors.textSecondary}
                  multiline
                />
                <View style={styles.editActions}>
                  <TouchableOpacity onPress={() => setEditingCommentId(null)}>
                    <ThemedText variant="caption" color="textSecondary">Cancel</ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleEditComment(comment.id)}>
                    <ThemedText variant="caption" color="accent">Save</ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <>
                <View style={styles.commentBubble}>
                  <ThemedText variant="caption" color="text" style={styles.commentUsername}>
                    {comment.profiles?.username || 'User'}
                  </ThemedText>
                  <ThemedText variant="body" color="text" style={styles.commentText}>
                    {comment.text}
                  </ThemedText>
                </View>

                {/* Comment Actions */}
                <View style={styles.commentActions}>
                  <ThemedText variant="caption" color="textSecondary" style={styles.commentTime}>
                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                  </ThemedText>

                  {comment.likes > 0 && (
                    <ThemedText variant="caption" color="textSecondary" style={styles.likesCount}>
                      {comment.likes} {comment.likes === 1 ? 'like' : 'likes'}
                    </ThemedText>
                  )}

                  {!isReply && (
                    <TouchableOpacity onPress={() => {
                      // Show reply input when in full mode
                      setReplyingToId(comment.id);
                    }}>
                      <ThemedText variant="caption" color="textSecondary" style={styles.actionText}>
                        Reply
                      </ThemedText>
                    </TouchableOpacity>
                  )}

                  {isOwn && (
                    <>
                      <TouchableOpacity onPress={() => {
                        setEditingCommentId(comment.id);
                        setEditText(comment.text);
                      }}>
                        <ThemedText variant="caption" color="textSecondary" style={styles.actionText}>
                          Edit
                        </ThemedText>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDeleteComment(comment.id)}>
                        <ThemedText variant="caption" color="textSecondary" style={styles.actionText}>
                          Delete
                        </ThemedText>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </>
            )}
          </View>

          {/* Like Button */}
          {!isEditing && (
            <TouchableOpacity 
              onPress={() => handleLikeComment(comment.id)}
              style={styles.likeButton}
            >
              <Ionicons
                name={comment.hasLiked ? 'heart' : 'heart-outline'}
                size={12}
                color={comment.hasLiked ? '#FF3040' : colors.textSecondary}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Show Replies Toggle */}
        {hasReplies && !isReply && (
          <TouchableOpacity 
            onPress={() => toggleReplies(comment.id)}
            style={styles.viewRepliesButton}
          >
            <View style={styles.replyLine} />
            <ThemedText variant="caption" color="textSecondary" style={styles.viewRepliesText}>
              {showReplies ? 'Hide' : `View ${comment.replies!.length}`} 
              {comment.replies!.length === 1 ? ' reply' : ' replies'}
            </ThemedText>
          </TouchableOpacity>
        )}

        {/* Replies */}
        {hasReplies && showReplies && comment.replies!.map(reply => renderComment(reply, true))}

        {/* Reply Input */}
        {replyingToId === comment.id && (
          <View style={styles.replyInputContainer}>
            <TextInput
              value={replyText}
              onChangeText={setReplyText}
              style={[styles.replyInput, { backgroundColor: colors.surface, color: colors.text }]}
              placeholder={`Reply to ${comment.profiles?.username}...`}
              placeholderTextColor={colors.textSecondary}
              multiline
            />
            <View style={styles.replyActions}>
              <TouchableOpacity onPress={() => {
                setReplyingToId(null);
                setReplyText('');
              }}>
                <ThemedText variant="caption" color="textSecondary">Cancel</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleAddReply(comment.id)}>
                <ThemedText variant="caption" color="accent">Reply</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Comments List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ThemedText variant="caption" color="textSecondary">
            Loading comments...
          </ThemedText>
        </View>
      ) : comments.length === 0 ? (
        <View style={styles.emptyContainer}>
          <ThemedText variant="caption" color="textSecondary">
            No comments yet. Be the first to comment!
          </ThemedText>
        </View>
      ) : (
        <>
          {/* Show all comments */}
          {comments.map(comment => renderComment(comment))}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  loadingContainer: {
    padding: spacing.sm,
  },
  emptyContainer: {
    padding: spacing.sm,
  },
  commentContainer: {
    marginBottom: spacing.sm,
  },
  replyContainer: {
    marginLeft: 30,
    marginTop: spacing.xs,
  },
  commentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  commentAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarFallback: {
    backgroundColor: '#4A90E2',
  },
  avatarText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  commentContent: {
    flex: 1,
  },
  commentBubble: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    alignSelf: 'flex-start',
    maxWidth: '85%',
  },
  commentUsername: {
    fontWeight: '600',
    marginBottom: 2,
  },
  commentText: {
    fontSize: 14,
    lineHeight: 18,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    marginLeft: spacing.sm,
  },
  commentTime: {
    marginRight: spacing.sm,
  },
  likesCount: {
    marginRight: spacing.sm,
    fontWeight: '600',
    color: '#8e8e8e',
  },
  actionText: {
    marginRight: spacing.sm,
    fontWeight: '600',
    color: '#8e8e8e',
  },
  likeButton: {
    marginLeft: spacing.xs,
    padding: spacing.xs,
  },
  viewRepliesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    marginLeft: 30,
  },
  replyLine: {
    width: 24,
    height: 1,
    backgroundColor: '#ddd',
    marginRight: spacing.sm,
  },
  viewRepliesText: {
    fontWeight: '600',
  },
  editContainer: {
    flex: 1,
  },
  editInput: {
    borderRadius: 16,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    fontSize: 14,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: spacing.xs,
    gap: spacing.sm,
  },
  replyInputContainer: {
    marginTop: spacing.sm,
    marginLeft: 30,
  },
  replyInput: {
    borderRadius: 16,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    fontSize: 14,
    maxHeight: 80,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  replyActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: spacing.xs,
    gap: spacing.sm,
  },
});