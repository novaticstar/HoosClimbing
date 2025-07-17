/**
 * Profile Screen (You Tab)
 * Stub implementation for future development
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Container, spacing, ThemedText, useTheme } from '../theme/ui';

export default function ProfileScreen() {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Container style={styles.content}>
        <View style={styles.centerContent}>
          <ThemedText variant="h2" color="text" style={styles.title}>
            You
          </ThemedText>
          <ThemedText variant="body" color="textSecondary" style={styles.subtitle}>
            Profile and settings will be implemented here
          </ThemedText>
        </View>
      </Container>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
  },
});
