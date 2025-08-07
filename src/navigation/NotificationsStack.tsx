/**
 * Notifications Stack Navigator
 * Handles navigation from Notifications to Post Detail screen while keeping tabs visible
 */
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import PostDetailScreen from '../screens/PostDetailScreen';
import NotificationsScreen from '../screens/Notifications';

export type NotificationsStackParamList = {
  Notifications: undefined;
  PostDetail: { postId: string };
};

const Stack = createStackNavigator<NotificationsStackParamList>();

export default function NotificationsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
      />
      <Stack.Screen
        name="PostDetail"
        component={PostDetailScreen}
      />
    </Stack.Navigator>
  );
}
