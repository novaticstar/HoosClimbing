/**
 * Comment Section Component
 * Displays comments for a post and allows users to add new ones
 */

import React, { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { View, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useTheme, spacing, ThemedText } from '../theme/ui';
import { useAuth } from '../context/AuthContext';
import { CommentService, Comment } from '../services/commentsService';
import { Ionicons } from '@expo/vector-icons';

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

  const fetchComments = async () => {
    setLoading(true);
    const data = collapsed
      ? await CommentService.getRecentComments(postId)
      : await CommentService.getCommentsForPost(postId);

    setComments(
      data.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    );
    setLoading(false);
  };

  const handleAddComment = async () => {
    if (!text.trim()) return;
    const success = await CommentService.addComment(postId, user.id, text.trim());
    if (success) {
      setText('');
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
    const success = await CommentService.deleteComment(commentId);
    if (success) fetchComments();
  };

  useEffect(() => {
    fetchComments();
  }, [collapsed]);

  return (
    <View style={styles.container}>
      {loading ? (
        <ThemedText variant="caption" color="textSecondary">
          Loading comments...
        </ThemedText>
      ) : comments.length === 0 ? (
        <ThemedText variant="caption" color="textSecondary">
          No comments yet.
        </ThemedText>
      ) : (
        comments.map((comment) => {
          const isOwn = comment.user_id === user.id;
          const isEditing = editingCommentId === comment.id;

          return (
            <View key={comment.id} style={styles.commentItem}>
              <ThemedText style={{ fontSize: 10 }} color="text">
                {comment.profiles?.username || 'User'} ·{' '}
                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
              </ThemedText>

              {isEditing ? (
                <View style={styles.editRow}>
                  <TextInput
                    value={editText}
                    onChangeText={setEditText}
                    style={[styles.input, { backgroundColor: colors.surface }]}
                    placeholder="Edit your comment"
                    placeholderTextColor={colors.textSecondary}
                  />
                  <TouchableOpacity onPress={() => handleEditComment(comment.id)}>
                    <ThemedText variant="body" color="accent" style={{ marginLeft: spacing.xs }}>
                      Save
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              ) : (
                <ThemedText variant="caption" color="textSecondary">
                  {comment.text}
                </ThemedText>
              )}

              {isOwn && !isEditing && (
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => {
                      setEditingCommentId(comment.id);
                      setEditText(comment.text);
                    }}
                  >
                    <Ionicons name="pencil-outline" size={12} color={colors.textSecondary} />
                    <ThemedText variant="caption" color="textSecondary" style={styles.iconLabel}>
                      Edit
                    </ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleDeleteComment(comment.id)}
                  >
                    <Ionicons name="trash-outline" size={12} color={colors.error || colors.textSecondary} />
                    <ThemedText variant="caption" color="textSecondary" style={styles.iconLabel}>
                      Delete
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })
      )}

      <View style={styles.inputRow}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Add a comment..."
          placeholderTextColor={colors.textSecondary}
          style={[styles.input, { backgroundColor: colors.surface }]}
        />
        <TouchableOpacity onPress={handleAddComment} style={styles.sendButton}>
          <ThemedText variant="body" color="accent">Send</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.sm,
  },
  commentItem: {
    marginBottom: spacing.sm,
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xxs,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconLabel: {
    marginLeft: spacing.xs,
  },
  inputRow: {
    flexDirection: 'row',
    marginTop: spacing.sm,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    padding: spacing.sm,
    borderRadius: 8,
  },
  sendButton: {
    marginLeft: spacing.sm,
  },
});