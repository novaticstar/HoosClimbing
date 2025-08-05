/**
 * Custom hook for managing events
 */

import { useCallback, useEffect, useState } from 'react';
import { CreateEventData, EventItem, EventService } from '../services/eventsService';

export const useEvents = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await EventService.getEvents();
      setEvents(data);
    } catch (err) {
      setError('Failed to load events');
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createEvent = useCallback(async (eventData: CreateEventData): Promise<EventItem | null> => {
    try {
      const newEvent = await EventService.createEvent(eventData);
      if (newEvent) {
        setEvents(prevEvents => [newEvent, ...prevEvents]);
      }
      return newEvent;
    } catch (err) {
      console.error('Error creating event:', err);
      return null;
    }
  }, []);

  const refreshEvents = useCallback(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return {
    events,
    loading,
    error,
    createEvent,
    refreshEvents,
  };
};
