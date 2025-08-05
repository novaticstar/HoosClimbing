/**
 * Home Stack Navigator
 * Handles navigation from Home to Events screens while keeping tabs visible
 */
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import EventDetailsScreen from '../screens/EventDetailsScreen';
import EventsScreen from '../screens/EventsScreen';
import HomeScreen from '../screens/HomeScreen';

export type HomeStackParamList = {
  HomeMain: undefined;
  EventsList: undefined;
  EventDetails: { eventId: string };
};

const Stack = createStackNavigator<HomeStackParamList>();

export default function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="HomeMain"
        component={HomeScreen}
      />
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
