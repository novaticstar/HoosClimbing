/**
 * Events Overview Screen
 */

import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, spacing, Container, ThemedText, Card } from '../theme/ui';

type Event = {
  id: string;
  title: string;
  details: string;
  start_time: string; // ISO date string
};

export default function EventsScreen() {
  const { colors } = useTheme();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TEMP: Mock data. Replace with call to EventsService later
    const mockEvents: Event[] = [
      {
        id: '1',
        title: 'Outdoor Bouldering at Humpback',
        details: 'Join us at Humpback Rocks for an afternoon of climbing!',
        start_time: new Date().toISOString(),
      },
      {
        id: '2',
        title: 'Intro to Belaying Workshop',
        details: 'Learn to belay safely with certified instructors.',
        start_time: new Date(Date.now() + 86400000).toISOString(),
      },
    ];

    setTimeout(() => {
      setEvents(mockEvents);
      setLoading(false);
    }, 800);
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Container>
        <ThemedText variant="h2" color="text" style={styles.title}>
          Upcoming Events
        </ThemedText>

        {loading ? (
          <ActivityIndicator size="large" color={colors.accent} />
        ) : (
          <FlatList
            data={events}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Card style={styles.card}>
                <TouchableOpacity>
                  <ThemedText variant="h4" color="text">
                    {item.title}
                  </ThemedText>
                  <ThemedText variant="body" color="textSecondary" style={styles.details}>
                    {item.details}
                  </ThemedText>
                  <ThemedText variant="caption" color="textSecondary">
                    {new Date(item.start_time).toLocaleString()}
                  </ThemedText>
                </TouchableOpacity>
              </Card>
            )}
          />
        )}
      </Container>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    marginBottom: spacing.lg,
  },
  card: {
    marginBottom: spacing.lg,
    padding: spacing.md,
  },
  details: {
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
});