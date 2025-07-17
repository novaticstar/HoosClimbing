/**
 * Feed Screen
 */

import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Container, spacing, ThemedText, useTheme } from '../theme/ui';

export default function FeedScreen() {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Container style={styles.content}>
          <ThemedText variant="h2" color="text" style={styles.title}>
            Feed
          </ThemedText>
          
          <Card style={styles.card}>
            <ThemedText variant="body" color="text">
              Your climbing feed will appear here.
            </ThemedText>
          </Card>
        </Container>
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
  },
  title: {
    marginBottom: spacing.xl,
  },
  card: {
    marginBottom: spacing.lg,
  },
});
