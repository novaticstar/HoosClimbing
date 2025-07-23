/**
 * Comment Section Component
 * Displays comments for a post and allows users to add new ones
 */

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useTheme, spacing, ThemedText } from '../theme/ui';
import { useAuth } from '../context/AuthContext';
import { CommentService, Comment } from '../services/commentsService';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  postId: string;
  collapsed?: boolean; // if true, only show 3 recent
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

    setComments(data.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()));
    setLoading(false);
  };

  const handleAddComment = async () => {
    if (!text.trim()) return;

    const success = await CommentService.addComment(postId, user.id, text);
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
                      <View style={styles.commentHeader}>
                        <ThemedText variant="caption" color="text">
                          {comment.profiles?.username || 'User'}:
                        </ThemedText>
                        {isOwn && !isEditing && (
                          <View style={styles.actions}>
                            <TouchableOpacity onPress={() => {
                              setEditingCommentId(comment.id);
                              setEditText(comment.text);
                            }}>
                              <Ionicons name="pencil" size={16} color={colors.textSecondary} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleDeleteComment(comment.id)}>
                              <Ionicons name="trash" size={16} color={colors.error || 'red'} />
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>

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
    marginBottom: spacing.xs,
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
  editRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: spacing.xs,
    },
});