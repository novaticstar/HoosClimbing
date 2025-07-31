/**
 * Instagram/TikTok-style Comment Section Component
 */

import { Ionicons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import { useEffect, useState } from 'react';
import { Alert, Image, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Comment, CommentService } from '../services/commentsService';
import { spacing, ThemedText, useTheme } from '../theme/ui';

type Props = {
  postId: string;
  collapsed?: boolean;
};

export function CommentSection({ postId, collapsed = false }: Props) {
  const { colors } = useTheme();
  const { user } = useAuth();

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
    const data = collapsed
      ? await CommentService.getRecentComments(postId, user?.id)
      : await CommentService.getCommentsForPost(postId, user?.id);

    // Sort comments to show most recent at bottom (like Instagram)
    const sortedData = data.sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
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
    const success = await CommentService.toggleCommentLike(commentId, user.id);
    if (success) {
      fetchComments();
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
  }, [collapsed]);

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
            <View style={[styles.commentAvatar, { backgroundColor: colors.surfaceVariant }]}>
              <ThemedText variant="caption" color="textSecondary">
                {comment.profiles?.username?.charAt(0).toUpperCase() ?? '?'}
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
                    <TouchableOpacity onPress={() => setReplyingToId(comment.id)}>
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
          {collapsed ? (
            // Show only the most recent comment in collapsed mode
            comments.slice(-1).map(comment => renderComment(comment))
          ) : (
            // Show all comments in expanded mode
            comments.map(comment => renderComment(comment))
          )}
        </>
      )}

      {/* Add Comment Input */}
      {!collapsed && (
        <View style={styles.addCommentContainer}>
          <TextInput
            value={text}
            onChangeText={setText}
            style={[styles.commentInput, { backgroundColor: colors.surface, color: colors.text }]}
            placeholder="Add a comment..."
            placeholderTextColor={colors.textSecondary}
            multiline
          />
          <TouchableOpacity onPress={handleAddComment} disabled={!text.trim()}>
            <ThemedText 
              variant="caption" 
              color={text.trim() ? "accent" : "textSecondary"}
              style={styles.postButton}
            >
              Post
            </ThemedText>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
  },
  loadingContainer: {
    padding: spacing.sm,
  },
  emptyContainer: {
    padding: spacing.sm,
  },
  viewAllContainer: {
    paddingVertical: spacing.xs,
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
  commentContent: {
    flex: 1,
  },
  commentBubble: {
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
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
  },
  replyActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: spacing.xs,
    gap: spacing.sm,
  },
  addCommentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  commentInput: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    fontSize: 14,
    maxHeight: 80,
    marginRight: spacing.sm,
  },
  postButton: {
    fontWeight: '600',
  },
});
