/**
 * Upload Screen
 * Stub implementation for post upload functionality
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { uvaColors } from '../theme/colors';
import { spacing, ThemedText, useTheme } from '../theme/ui';

export default function UploadScreen() {
  const { colors } = useTheme();

  const handleCreatePost = () => {
    Alert.alert(
      'Coming Soon!',
      'Post creation feature is currently under development. Stay tuned!'
    );
  };

  const handleCreateStory = () => {
    Alert.alert(
      'Coming Soon!',
      'Story creation feature is currently under development. Stay tuned!'
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <ThemedText style={styles.title}>Create Content</ThemedText>
          <ThemedText style={[styles.subtitle, { color: colors.textSecondary }]}>
            Share your climbing adventures with the community
          </ThemedText>
        </View>

        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={[styles.option, { backgroundColor: colors.surface }]}
            onPress={handleCreatePost}
          >
            <View style={[styles.iconContainer, { backgroundColor: uvaColors.cavalierOrange }]}>
              <Ionicons name="image" size={32} color="white" />
            </View>
            <View style={styles.optionContent}>
              <ThemedText style={styles.optionTitle}>Create Post</ThemedText>
              <ThemedText style={[styles.optionDescription, { color: colors.textSecondary }]}>
                Share photos and videos of your climbs
              </ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.option, { backgroundColor: colors.surface }]}
            onPress={handleCreateStory}
          >
            <View style={[styles.iconContainer, { backgroundColor: uvaColors.jeffersonBlue }]}>
              <Ionicons name="play-circle" size={32} color="white" />
            </View>
            <View style={styles.optionContent}>
              <ThemedText style={styles.optionTitle}>Create Story</ThemedText>
              <ThemedText style={[styles.optionDescription, { color: colors.textSecondary }]}>
                Share quick moments that disappear after 24 hours
              </ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.tipsContainer}>
          <ThemedText style={[styles.tipsTitle, { color: colors.textSecondary }]}>
            Tips for great content:
          </ThemedText>
          <View style={styles.tipsList}>
            <View style={styles.tip}>
              <Ionicons name="checkmark-circle" size={16} color={uvaColors.cavalierOrange} />
              <ThemedText style={[styles.tipText, { color: colors.textSecondary }]}>
                Share your climbing progress and achievements
              </ThemedText>
            </View>
            <View style={styles.tip}>
              <Ionicons name="checkmark-circle" size={16} color={uvaColors.cavalierOrange} />
              <ThemedText style={[styles.tipText, { color: colors.textSecondary }]}>
                Tag your climbing location and routes
              </ThemedText>
            </View>
            <View style={styles.tip}>
              <Ionicons name="checkmark-circle" size={16} color={uvaColors.cavalierOrange} />
              <ThemedText style={[styles.tipText, { color: colors.textSecondary }]}>
                Connect with other climbers in the community
              </ThemedText>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingTop: spacing.xxl,
  },
  header: {
    marginBottom: spacing.xxl,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  optionsContainer: {
    marginBottom: spacing.xxl,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: 12,
    marginBottom: spacing.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  optionDescription: {
    fontSize: 14,
  },
  tipsContainer: {
    marginTop: spacing.lg,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  tipsList: {
    gap: spacing.sm,
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
  },
});
