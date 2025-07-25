/**
 * Events Stack Navigator
 * Handles navigation between Events list and Event details
 */
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import EventsScreen from '../screens/EventsScreen';
import EventDetailsScreen from '../screens/EventDetailsScreen';

export type EventsStackParamList = {
  EventsList: undefined;
  EventDetails: { eventId: string };
};

const Stack = createStackNavigator<EventsStackParamList>();

export default function EventsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="EventsList"
        component={EventsScreen}
      />
      <Stack.Screen
        name="EventDetails"
        component={EventDetailsScreen}
      />
    </Stack.Navigator>
  );
}