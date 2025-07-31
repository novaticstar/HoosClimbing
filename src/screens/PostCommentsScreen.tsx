/**
 * Post Comments Screen
 * Dedicated screen for viewing all comments on a post
 */

import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CommentSection } from '../components/CommentSection';
import { Container, spacing, ThemedText, useTheme } from '../theme/ui';

type PostCommentsScreenRouteProp = {
  postId: string;
  username?: string;
};

export default function PostCommentsScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { postId, username } = route.params as PostCommentsScreenRouteProp;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText variant="h3" color="text" style={styles.headerTitle}>
          Comments
        </ThemedText>
        <View style={styles.headerSpacer} />
      </View>

      {/* Comments */}
      <Container style={styles.content}>
        <CommentSection postId={postId} collapsed={false} />
      </Container>
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '600',
  },
  headerSpacer: {
    width: 40, // Balance the back button
  },
  content: {
    flex: 1,
    paddingTop: spacing.md,
  },
});
