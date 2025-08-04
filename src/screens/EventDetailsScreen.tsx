/**
 * Event Details Screen
 */

import { Ionicons } from '@expo/vector-icons';
import type { RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { HomeStackParamList } from '../navigation/HomeStack';
import { Container, ThemedText, spacing, useTheme } from '../theme/ui';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Avatar } from '../components/Avatar';

type EventDetailsScreenNavigationProp = StackNavigationProp<HomeStackParamList, 'EventDetails'>;
type EventDetailsScreenRouteProp = RouteProp<HomeStackParamList, 'EventDetails'>;

export default function EventDetailsScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<EventDetailsScreenNavigationProp>();
  const route = useRoute<EventDetailsScreenRouteProp>();
  const { user } = useAuth();

  const { eventId } = route.params;
  const [event, setEvent] = useState<any>(null);
  const [attendees, setAttendees] = useState<any[]>([]);
  const previewLimit = 3;
  const [isAttending, setIsAttending] = useState(false);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
      fetchEvent();
      fetchAttendees();
    }, [eventId]);

    async function fetchEvent() {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (error) {
        console.error('Error fetching event:', error);
      } else {
        setEvent(data);
      }
    }

    async function fetchAttendees() {
        const { data, error } = await supabase
          .from('event_attendance')
          .select('profiles(id, username, avatar_url)')
          .eq('event_id', eventId);

        if (error) {
          console.error('Error fetching attendees:', error);
          return;
        }

        const list = (data || []).map((row: any) => row.profiles);
        setAttendees(list);
        setIsAttending(list.some((a: any) => a.id === user?.id));
      }
  async function handleToggleAttend() {
      if (!user) return;

      if (isAttending) {
        const { error } = await supabase
          .from('event_attendance')
          .delete()
          .match({ event_id: eventId, user_id: user.id });

        if (error) {
          console.error('Error removing attendance:', error);
        } else {
          setIsAttending(false);
          fetchAttendees();
        }
      } else {
        const { error } = await supabase
          .from('event_attendance')
          .insert({ event_id: eventId, user_id: user.id });

        if (error) {
          console.error('Error attending event:', error);
        } else {
          setIsAttending(true);
          fetchAttendees();
        }
      }
    }

  const attendeesToShow = showAll ? attendees : attendees.slice(0, previewLimit);

  const handleGoBack = () => navigation.goBack();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView>
        <Container style={styles.content}>
            {/* Back Button */}
            <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
            <ThemedText variant="body" color="text" style={styles.backText}>Back to Events</ThemedText>
          </TouchableOpacity>

          {/* Event Title */}
          <ThemedText variant="h2" color="text" style={styles.title}>
            {event?.title ?? 'Loading...'}
          </ThemedText>

          {/* Event Image */}
          {event?.image_url ? (
              <Image source={{ uri: event.image_url }} style={styles.imageBox} />
            ) : (
              <View style={[styles.imageBox, { backgroundColor: colors.surfaceVariant }]}>
                <ThemedText variant="body" color="textSecondary">No image provided</ThemedText>
              </View>
            )}

          {/* Event Description */}
          <ThemedText variant="body" color="textSecondary" style={styles.description}>
            {event?.description}
          </ThemedText>
          <ThemedText variant="caption" color="accent">{event?.event_date}</ThemedText>

          {/* Attend Button */}
          <TouchableOpacity
            style={[
              styles.attendButton,
              { backgroundColor: isAttending ? colors.accent : colors.surface },
            ]}
            onPress={handleToggleAttend}
          >
            <ThemedText variant="body" color={isAttending ? 'onAccent' : 'text'}>
              {isAttending ? 'Attending!' : 'Attend'}
            </ThemedText>
          </TouchableOpacity>

          {/* Attendees Preview */}
          <ThemedText variant="h4" color="text" style={styles.sectionTitle}>
            Attendees
          </ThemedText>
          <View style={styles.attendeeColumn}>
            {attendeesToShow.map((user) => (
              <View key={user.id} style={styles.attendeeItem}>
                  <Avatar uri={user.avatar_url} name={user.username} size={40} />
                  <ThemedText variant="body" color="text">{user.username}</ThemedText>
              </View>
            ))}
          </View>

          {/* Show All Button */}
          {!showAll && attendees.length > previewLimit && (
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
    width: '100%',
    height: 200,
    borderRadius: 12,
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
  attendeeColumn: {
      flexDirection: 'column',
      gap: spacing.sm,
      marginBottom: spacing.md,
    },
    attendeeItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
  showAllButton: {
    alignSelf: 'flex-start',
  },
  backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    backText: {
      marginLeft: spacing.sm,
    },
});