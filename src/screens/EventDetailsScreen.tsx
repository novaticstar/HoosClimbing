/**
 * Event Details Screen
 */

import React, { useState } from 'react';
import { ScrollView, View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText, spacing, Container, Card, useTheme } from '../theme/ui';
import { Ionicons } from '@expo/vector-icons';

// Placeholder avatar generator
const getInitials = (name: string) => name.split(' ').map(w => w[0]).join('').toUpperCase();

export default function EventDetailsScreen() {
  const { colors } = useTheme();

  const event = {
    id: '1',
    title: 'Horseshoe Hell',
    description: 'Multi-day festival full of bouldering challengers and climbing competitions.',
    date: 'September 24-28',
    image: null, // Placeholder for future media support
  };

  const allAttendees = [
    { id: '1', username: 'climber1' },
    { id: '2', username: 'rockstar2' },
    { id: '3', username: 'boulderqueen' },
    { id: '4', username: 'peakfinder' },
    { id: '5', username: 'chalkwarrior' },
  ];

  const previewLimit = 3;
  const [isAttending, setIsAttending] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const attendeesToShow = showAll ? allAttendees : allAttendees.slice(0, previewLimit);

  const handleToggleAttend = () => setIsAttending(!isAttending);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView>
        <Container style={styles.content}>

          {/* Event Title */}
          <ThemedText variant="h2" color="text" style={styles.title}>
            {event.title}
          </ThemedText>

          {/* Event Image (Placeholder Box) */}
          <View style={[styles.imageBox, { backgroundColor: colors.surfaceVariant }]}>
            <ThemedText variant="body" color="textSecondary">Event image coming soon</ThemedText>
          </View>

          {/* Event Description */}
          <ThemedText variant="body" color="textSecondary" style={styles.description}>
            {event.description}
          </ThemedText>
          <ThemedText variant="caption" color="accent">{event.date}</ThemedText>

          {/* Attend Button */}
          <TouchableOpacity
            style={[
              styles.attendButton,
              { backgroundColor: isAttending ? colors.accent : colors.surface },
            ]}
            onPress={handleToggleAttend}
          >
            <ThemedText variant="body" color={isAttending ? 'onAccent' : 'text'}>
              {isAttending ? 'Attending' : 'Attend'}
            </ThemedText>
          </TouchableOpacity>

          {/* Attendees Preview */}
          <ThemedText variant="h4" color="text" style={styles.sectionTitle}>
            Attendees
          </ThemedText>
          <View style={styles.attendeeRow}>
            {attendeesToShow.map((user) => (
              <View key={user.id} style={[styles.avatarBox, { backgroundColor: colors.surfaceVariant }]}>
                <ThemedText variant="caption" color="textSecondary">
                  {getInitials(user.username)}
                </ThemedText>
              </View>
            ))}
          </View>

          {/* Show All Button */}
          {!showAll && allAttendees.length > previewLimit && (
            <TouchableOpacity onPress={() => setShowAll(true)} style={styles.showAllButton}>
              <ThemedText variant="body" color="accent">Show All Attendees</ThemedText>
            </TouchableOpacity>
          )}
        </Container>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.lg },
  title: { marginBottom: spacing.md },
  imageBox: {
    height: 200,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  description: { marginBottom: spacing.xs },
  attendButton: {
    padding: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  sectionTitle: { marginTop: spacing.lg, marginBottom: spacing.sm },
  attendeeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  avatarBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  showAllButton: {
    alignSelf: 'flex-start',
  },
});