/**
 * Profile Stack Navigator
 * Handles navigation within the Profile (You) tab
 */

import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import PostCommentsScreen from '../screens/PostCommentsScreen';
import PostDetailScreen from '../screens/PostDetailScreen';
import ProfileScreen from '../screens/ProfileScreen';

export type ProfileStackParamList = {
  ProfileMain: undefined;
  PostDetail: {
    postId: string;
  };
  PostComments: {
    postId: string;
    username?: string;
  };
};

const Stack = createStackNavigator<ProfileStackParamList>();

export default function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="PostDetail" component={PostDetailScreen} />
      <Stack.Screen name="PostComments" component={PostCommentsScreen} />
    </Stack.Navigator>
  );
}
