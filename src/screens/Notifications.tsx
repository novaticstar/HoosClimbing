/**
  Notifications Screen
  Currently only works for post likes and comments/replies
 */

import React, { useLayoutEffect } from 'react';
import { FlatList, StyleSheet, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { NotificationsStackParamList } from '../navigation/NotificationsStack';
import { useTheme, ThemedText, spacing } from '../theme/ui';
import { useNotifications } from '../hooks/useNotifications';

type NotificationsNavigationProp = StackNavigationProp<NotificationsStackParamList>;

export default function NotificationsScreen() {
  const { colors } = useTheme();
  const { notifications, loading, refreshNotifications, markAllAsRead } = useNotifications();
  const navigation = useNavigation<NotificationsNavigationProp>();

  useLayoutEffect(() => {
      navigation.setOptions({
        headerRight: () => (
          <TouchableOpacity onPress={markAllAsRead} style={{ paddingRight: spacing.md }}>
            <ThemedText variant="body" color="accent">Mark All as Read</ThemedText>
          </TouchableOpacity>
        ),
      });
    }, [navigation, markAllAsRead]);

    const handleNavigateToPost = (postId: string) => {
      navigation.navigate('PostDetail', { postId });
    };

  const renderItem = ({ item }) => {
    let message = '';

    switch (item.type) {
      case 'like':
        message = `@${item.sender?.username || 'Someone'} liked your post!`;
        break;
      case 'comment':
        message = `@${item.sender?.username || 'Someone'} commented on your post!`;
        break;
      default:
        message = `You have a new ${item.type} notification.`;
    }

  return (
        <View style={[styles.notificationItem, { backgroundColor: colors.surface }]}>
          <View style={styles.notificationRow}>
            <View style={{ flex: 1 }}>
              <ThemedText variant="body" color="text">{message}</ThemedText>
              <ThemedText variant="caption" color="accent">
                {new Date(item.created_at).toLocaleDateString()}
              </ThemedText>
            </View>
            {item.post_id && (
              <TouchableOpacity onPress={() => handleNavigateToPost(item.post_id)}>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      );
    };

  return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.titleRow}>
          <ThemedText variant="h2" style={styles.title}>Notifications</ThemedText>
          <TouchableOpacity onPress={markAllAsRead} style={[styles.markReadButton, { backgroundColor: colors.accent }]}>
            <ThemedText variant="body" color="onAccent">Mark All as Read</ThemedText>
          </TouchableOpacity>
        </View>
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
          refreshing={loading}
          onRefresh={refreshNotifications}
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
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  markReadButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  empty: {
    marginTop: spacing.xxl,
    textAlign: 'center',
  },
});