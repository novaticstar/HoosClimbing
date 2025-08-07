/**
  Notifications Screen
  Currently only works for post likes
 */

import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, ThemedText, spacing } from '../theme/ui';
import { useNotifications } from '../hooks/useNotifications';

export default function NotificationsScreen() {
  const { colors } = useTheme();
  const { notifications, loading } = useNotifications();

  const renderItem = ({ item }) => (
    <View style={[styles.notificationItem, { backgroundColor: colors.surface }]}>
      <ThemedText variant="body" color="text">
        {item.type === 'like' ? (
          `@${item.sender?.username || 'Someone'} liked your post!`
        ) : (
          `You have a new ${item.type}!`
        )}
      </ThemedText>
      <ThemedText variant="caption" color="accent">
        {new Date(item.created_at).toLocaleDateString()}
      </ThemedText>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ThemedText variant="h2" style={styles.title}>Notifications</ThemedText>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <ThemedText variant="body" color="textSecondary" style={styles.empty}>
            No notifications yet.
          </ThemedText>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg },
  title: { marginBottom: spacing.lg },
  listContent: { paddingBottom: spacing.xxl },
  notificationItem: {
    padding: spacing.md,
    borderRadius: 10,
    marginBottom: spacing.sm,
  },
  empty: {
    marginTop: spacing.xxl,
    textAlign: 'center',
  },
});