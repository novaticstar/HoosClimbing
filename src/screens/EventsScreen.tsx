/**
 * Events Overview Screen - Enhanced with real-time data and create functionality
 */

import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import React, { useState } from 'react';
import { Image, Modal, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEvents } from '../hooks/useEvents';
import type { HomeStackParamList } from '../navigation/HomeStack';
import { Card, Container, spacing, ThemedText, useTheme } from '../theme/ui';
import CreateEventScreen from './CreateEventScreen';

type EventsScreenNavigationProp = StackNavigationProp<HomeStackParamList, 'EventsList'>;

export default function EventsScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<EventsScreenNavigationProp>();
  const { events, featuredEvent, loading, refreshEvents } = useEvents();
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateEvent, setShowCreateEvent] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshEvents();
    setRefreshing(false);
  };

  const handleEventCreated = () => {
    setShowCreateEvent(false);
    refreshEvents();
  };

  const otherUpcomingEvents = events
    .filter(e => new Date(e.event_date) > new Date())
    .filter(e => e.id !== featuredEvent?.id);

  const handleEventPress = (eventId: string) => {
      navigation.navigate('EventDetails', { eventId });
    };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.accent]}
            tintColor={colors.accent}
          />
        }
      >
        <Container style={styles.content}>
          <View style={styles.titleRow}>
            <ThemedText variant="h2" color="text" style={styles.title}>Events</ThemedText>
            </View>

          {loading ? (
            <ThemedText variant="body" color="textSecondary">Loading events...</ThemedText>
          ) : events.length === 0 ? (
            <Card style={StyleSheet.flatten([styles.eventCard, { backgroundColor: colors.surface }])}>
              <ThemedText variant="body" color="textSecondary" style={{ textAlign: 'center' }}>
                No events yet. Create the first event!
              </ThemedText>
            </Card>
          ) : (
            <>
              {/* Popular Event */}
              {featuredEvent && (
                <>
                  <ThemedText variant="h3" color="text" style={styles.sectionTitle}>Featured Event</ThemedText>
                  <TouchableOpacity onPress={() => handleEventPress(featuredEvent.id)}>
                    <Card style={StyleSheet.flatten([styles.popularCard, { backgroundColor: colors.surface }])}>
                        {featuredEvent.image_url && (
                          <Image
                            source={{ uri: featuredEvent.image_url }}
                            style={styles.eventImage}
                          />
                        )}
                        <ThemedText variant="h4" color="text" style={styles.eventTitle}>{featuredEvent.title}</ThemedText>
                        <ThemedText variant="body" color="textSecondary" style={styles.eventDescription}>{featuredEvent.description}</ThemedText>
                        <ThemedText variant="caption" color="accent" style={styles.eventDate}>
                          {new Date(featuredEvent.event_date).toLocaleDateString()}
                        </ThemedText>
                        <ThemedText variant="caption" color="textSecondary">
                          by @{featuredEvent.profiles?.username || 'Unknown'}
                        </ThemedText>
                      </Card>
                  </TouchableOpacity>
                </>
              )}

              {/* Upcoming Events */}
              {otherUpcomingEvents.length > 0 && (
                <>
                  <ThemedText variant="h3" color="text" style={styles.sectionTitle}>Upcoming Events</ThemedText>
                  {otherUpcomingEvents.map((event) => (
                    <TouchableOpacity key={event.id} onPress={() => handleEventPress(event.id)}>
                      <Card style={StyleSheet.flatten([styles.eventCard, { backgroundColor: colors.surface }])}>
                        {event.image_url && (
                          <Image
                            source={{ uri: event.image_url }}
                            style={styles.eventImage}
                          />
                        )}
                        <ThemedText variant="h4" color="text" style={styles.eventTitle}>{event.title}</ThemedText>
                        <ThemedText variant="body" color="textSecondary" style={styles.eventDescription}>{event.description}</ThemedText>
                        <ThemedText variant="caption" color="accent" style={styles.eventDate}>
                          {new Date(event.event_date).toLocaleDateString()}
                        </ThemedText>
                        <ThemedText variant="caption" color="textSecondary">
                          by @{event.profiles?.username || 'Unknown'}
                        </ThemedText>
                      </Card>
                    </TouchableOpacity>
                  ))}
                </>
              )}
            </>
          )}
        </Container>
      </ScrollView>

      {/* Create Event Modal */}
      <Modal
        visible={showCreateEvent}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <CreateEventScreen
          onEventCreated={handleEventCreated}
          onClose={() => setShowCreateEvent(false)}
        />
      </Modal>

      {/* Updated Add Event Button */}
      <View style={styles.fixedAddButtonWrapper}>
        <TouchableOpacity
          onPress={() => setShowCreateEvent(true)}
          style={[styles.fixedAddButton, { backgroundColor: colors.accent }]}
          activeOpacity={0.9}
        >
          <ThemedText variant="body" color="onAccent">+ Add Event</ThemedText>
        </TouchableOpacity>
      </View>
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
  eventImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  eventTitle: {
    marginBottom: spacing.xs,
  },
  eventDescription: {
    marginBottom: spacing.sm,
  },
  eventDate: {
    marginBottom: spacing.xs,
  },
  fixedAddButtonWrapper: {
    position: 'absolute',
    bottom: spacing.lg,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },

  fixedAddButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 30, // oval shape
    minWidth: 1280,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});