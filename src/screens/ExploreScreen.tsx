/**
 * Explore Screen
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Container, spacing, ThemedText, useTheme } from '../theme/ui';

export default function ExploreScreen() {
  const { colors } = useTheme();

  const locations = [
    {
      name: 'Humpback Rock',
      distance: '12 miles',
      difficulty: '5.6 - 5.11',
      routes: 24,
      type: 'Outdoor',
    },
    {
      name: 'Old Rag Mountain',
      distance: '18 miles',
      difficulty: '5.4 - 5.9',
      routes: 16,
      type: 'Outdoor',
    },
    {
      name: 'AFC Gym',
      distance: '2 miles',
      difficulty: 'V0 - V12',
      routes: 45,
      type: 'Indoor',
    },
    {
      name: 'Rock Adventures',
      distance: '5 miles',
      difficulty: 'V0 - V8',
      routes: 32,
      type: 'Indoor',
    },
  ];

  const events = [
    {
      title: 'Weekend Climbing at Humpback',
      date: 'Saturday, Jan 20',
      attendees: 8,
      organizer: 'Sarah M.',
    },
    {
      title: 'Beginner Bouldering Session',
      date: 'Thursday, Jan 18',
      attendees: 12,
      organizer: 'Mike K.',
    },
    {
      title: 'Old Rag Day Trip',
      date: 'Sunday, Jan 21',
      attendees: 6,
      organizer: 'Emma R.',
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Container style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <ThemedText variant="h2" color="primary" style={styles.title}>
              Explore
            </ThemedText>
            <ThemedText variant="body" color="textSecondary" style={styles.subtitle}>
              Discover climbing locations and events
            </ThemedText>
          </View>

          {/* Search Bar */}
          <View style={[styles.searchContainer, { backgroundColor: colors.surfaceVariant }]}>
            <Ionicons name="search" size={20} color={colors.textSecondary} />
            <ThemedText variant="body" color="textSecondary" style={styles.searchPlaceholder}>
              Search locations, routes, or events...
            </ThemedText>
          </View>

          {/* Climbing Locations */}
          <View style={styles.section}>
            <ThemedText variant="h4" color="text" style={styles.sectionTitle}>
              Climbing Locations
            </ThemedText>
            
            <View style={styles.locationsList}>
              {locations.map((location, index) => (
                <Card key={index} style={styles.locationCard}>
                  <View style={styles.locationHeader}>
                    <ThemedText variant="h5" color="text">
                      {location.name}
                    </ThemedText>
                    <View style={[
                      styles.typeTag,
                      { backgroundColor: location.type === 'Outdoor' ? colors.success : colors.info }
                    ]}>
                      <ThemedText variant="caption" color="onAccent" style={styles.typeText}>
                        {location.type}
                      </ThemedText>
                    </View>
                  </View>
                  
                  <View style={styles.locationDetails}>
                    <View style={styles.locationDetail}>
                      <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
                      <ThemedText variant="caption" color="textSecondary">
                        {location.distance} away
                      </ThemedText>
                    </View>
                    
                    <View style={styles.locationDetail}>
                      <Ionicons name="trending-up-outline" size={16} color={colors.textSecondary} />
                      <ThemedText variant="caption" color="textSecondary">
                        {location.difficulty}
                      </ThemedText>
                    </View>
                    
                    <View style={styles.locationDetail}>
                      <Ionicons name="trail-sign-outline" size={16} color={colors.textSecondary} />
                      <ThemedText variant="caption" color="textSecondary">
                        {location.routes} routes
                      </ThemedText>
                    </View>
                  </View>
                </Card>
              ))}
            </View>
          </View>

          {/* Upcoming Events */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText variant="h4" color="text" style={styles.sectionTitle}>
                Upcoming Events
              </ThemedText>
              <TouchableOpacity>
                <ThemedText variant="caption" color="primary">
                  See all
                </ThemedText>
              </TouchableOpacity>
            </View>
            
            <View style={styles.eventsList}>
              {events.map((event, index) => (
                <Card key={index} style={styles.eventCard}>
                  <View style={styles.eventContent}>
                    <ThemedText variant="body" color="text" style={styles.eventTitle}>
                      {event.title}
                    </ThemedText>
                    <ThemedText variant="caption" color="textSecondary" style={styles.eventDate}>
                      {event.date}
                    </ThemedText>
                    
                    <View style={styles.eventFooter}>
                      <View style={styles.eventDetail}>
                        <Ionicons name="people-outline" size={16} color={colors.textSecondary} />
                        <ThemedText variant="caption" color="textSecondary">
                          {event.attendees} attending
                        </ThemedText>
                      </View>
                      <ThemedText variant="caption" color="primary">
                        by {event.organizer}
                      </ThemedText>
                    </View>
                  </View>
                </Card>
              ))}
            </View>
          </View>
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
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  searchPlaceholder: {
    flex: 1,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    marginBottom: spacing.lg,
  },
  locationsList: {
    gap: spacing.md,
  },
  locationCard: {
    padding: spacing.md,
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  typeTag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 4,
  },
  typeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  locationDetails: {
    gap: spacing.sm,
  },
  locationDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  eventsList: {
    gap: spacing.md,
  },
  eventCard: {
    padding: spacing.md,
  },
  eventContent: {
    gap: spacing.sm,
  },
  eventTitle: {
    fontWeight: '600',
  },
  eventDate: {
    marginBottom: spacing.sm,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
});
