/**
  Notifications Screen
  Works for likes, comments, replies, tags, and friendship requests
 */

import React, { useLayoutEffect } from 'react';
import { FlatList, StyleSheet, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
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

    const handleNavigateFromNotification = async (item) => {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', item.id);

      refreshNotifications();

      if (item.post_id) {
        navigation.navigate('PostDetail', { postId: item.post_id });
      } else if (['friend_request', 'friend_accept'].includes(item.type)) {
        navigation.navigate('FriendsMain');
      }
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
      case 'comment like':
          message = `@${item.sender?.username || 'Someone'} liked your comment!`;
          break;
      case 'tag':
          message = `@${item.sender?.username || 'Someone'} tagged you in their post!`;
          break;
      case 'comment tag':
          message = `@${item.sender?.username || 'Someone'} tagged you in their comment!`;
          break;
      case 'friend_request':
          message = `@${item.sender?.username || 'Someone'} sent you a friend request!`;
          break;
      case 'friend_accept':
          message = `@${item.sender?.username || 'Someone'} accepted your friend request!`;
          break;
      default:
        message = `You have a new ${item.type} notification.`;
    }

  const isNavigable = item.post_id || ['friend_request', 'friend_accept'].includes(item.type);

  return (
        <View style={[styles.notificationItem, { backgroundColor: colors.surface, opacity: item.read ? 0.5 : 1, }]}>
          <View style={styles.notificationRow}>
            <View style={{ flex: 1 }}>
              <ThemedText variant="body" color="text">{message}</ThemedText>
              <ThemedText variant="caption" color="accent">
                {new Date(item.created_at).toLocaleDateString()}
              </ThemedText>
            </View>
            {isNavigable && (
              <TouchableOpacity onPress={() => handleNavigateFromNotification(item)}>
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