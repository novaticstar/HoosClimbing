/**
 * Events Overview Screen
 */

import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { HomeStackParamList } from '../navigation/HomeStack';
import { Card, Container, spacing, ThemedText, useTheme } from '../theme/ui';
import { useEffect, useState } from 'react';
import { EventService } from '../services/eventsService';

type EventsScreenNavigationProp = StackNavigationProp<HomeStackParamList, 'EventsList'>;

export default function EventsScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<EventsScreenNavigationProp>();

  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    EventService.getEvents().then(data => {
      setEvents(data);
      setLoading(false);
    });
  }, []);

  const popularEvent = events.length > 0 ? events[0] : null;
  const upcomingEvents = events.slice(1);

  const handleEventPress = (eventId: string) => {
      navigation.navigate('EventDetails', { eventId });
    };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Container style={styles.content}>
          <ThemedText variant="h2" color="text" style={styles.title}>Events</ThemedText>

          {/* Popular Event */}
          {popularEvent && (
            <>
              <ThemedText variant="h3" color="text" style={styles.sectionTitle}>Popular Event</ThemedText>
              <TouchableOpacity onPress={() => handleEventPress(popularEvent.id)}>
                <Card style={styles.popularCard}>
                  {popularEvent.image_url && (
                    <Image source={{ uri: popularEvent.image_url }} style={styles.eventImage} />
                  )}
                  <ThemedText variant="h4" color="text">{popularEvent.title}</ThemedText>
                  <ThemedText variant="body" color="textSecondary">{popularEvent.description}</ThemedText>
                  <ThemedText variant="caption" color="accent">{popularEvent.event_date}</ThemedText>
                </Card>
              </TouchableOpacity>
            </>
          )}

          {/* Upcoming Events */}
          <ThemedText variant="h3" color="text" style={styles.sectionTitle}>Upcoming Events</ThemedText>
          {upcomingEvents.map((event) => (
            <TouchableOpacity key={event.id} onPress={() => handleEventPress(event.id)}>
              <Card style={styles.eventCard}>
                {event.image_url && (
                  <Image source={{ uri: event.image_url }} style={styles.eventImageSmall} />
                )}
                <ThemedText variant="h4" color="text">{event.title}</ThemedText>
                <ThemedText variant="body" color="textSecondary">{event.description}</ThemedText>
                <ThemedText variant="caption" color="accent">{event.event_date}</ThemedText>
              </Card>
            </TouchableOpacity>
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
  eventImage: {
    width: '100%',
    height: 160,
    borderRadius: 10,
    marginBottom: spacing.sm,
  },
  eventImageSmall: {
    width: '100%',
    height: 100,
    borderRadius: 10,
    marginBottom: spacing.sm,
  },
});