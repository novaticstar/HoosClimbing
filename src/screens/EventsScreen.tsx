/**
 * Events Overview Screen
 */

import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, Image, View } from 'react-native';
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
          <View style={styles.titleRow}>
            <ThemedText variant="h2" color="text" style={styles.title}>Events</ThemedText>

          {/* Create Event Button */}
            <TouchableOpacity
              onPress={() => console.log('Add Event pressed')}
              style={[styles.addEventButton, { backgroundColor: colors.accent }]}
            >
              <ThemedText variant="body" color="onAccent">+ Add</ThemedText>
            </TouchableOpacity>
          </View>

          {/* Popular Event */}
          {popularEvent && (
            <>
              <ThemedText variant="h3" color="text" style={styles.sectionTitle}>Popular Event</ThemedText>
              <TouchableOpacity onPress={() => handleEventPress(popularEvent.id)}>
                <Card style={styles.popularCard}>
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
  sectionTitle: { marginTop: spacing.md, marginBottom: spacing.md },
  popularCard: {
    marginBottom: spacing.sm,
    padding: spacing.lg,
    borderRadius: 12,
  },
  eventCard: {
    marginBottom: spacing.lg,
    padding: spacing.md,
    borderRadius: 12,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },

  addEventButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 6,
  },
   });