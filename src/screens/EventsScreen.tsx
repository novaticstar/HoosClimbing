/**
 * Events Overview Screen
 */

import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { spacing, Container, ThemedText, Card, useTheme } from '../theme/ui';

export default function EventsScreen() {
  const { colors } = useTheme();

  // Mock data
  const popularEvent = {
    id: '1',
    title: 'Horseshoe Hell',
    description: 'Multi-day festival full of bouldering challengers and climbing competitions',
    date: 'September 24-28',
  };

  const upcomingEvents = [
    { id: '2', title: 'Club Meeting', description: 'Weekly planning session', date: 'July 27' },
    { id: '3', title: 'Speed Climbing Competition', description: 'Who can climb the fastest?', date: 'July 30' },
    { id: '4', title: 'Intro to Knot Tying', description: 'Workshop with various climbing knots', date: 'August 3' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Container style={styles.content}>
          <ThemedText variant="h2" color="text" style={styles.title}>Events</ThemedText>

          {/* Popular Event */}
          <ThemedText variant="h3" color="text" style={styles.sectionTitle}>Popular Event</ThemedText>
          <Card style={styles.popularCard}>
            <ThemedText variant="h4" color="text">{popularEvent.title}</ThemedText>
            <ThemedText variant="body" color="textSecondary">{popularEvent.description}</ThemedText>
            <ThemedText variant="caption" color="accent">{popularEvent.date}</ThemedText>
          </Card>

          {/* Upcoming Events */}
          <ThemedText variant="h3" color="text" style={styles.sectionTitle}>Upcoming Events</ThemedText>
          {upcomingEvents.map((event) => (
            <Card key={event.id} style={styles.eventCard}>
              <ThemedText variant="h4" color="text">{event.title}</ThemedText>
              <ThemedText variant="body" color="textSecondary">{event.description}</ThemedText>
              <ThemedText variant="caption" color="accent">{event.date}</ThemedText>
            </Card>
          ))}
        </Container>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.lg },
  title: { marginBottom: spacing.lg },
  sectionTitle: { marginTop: spacing.lg, marginBottom: spacing.md },
  popularCard: {
    marginBottom: spacing.xl,
    padding: spacing.md,
    borderRadius: 12,
  },
  eventCard: {
    marginBottom: spacing.lg,
    padding: spacing.md,
    borderRadius: 12,
  },
});