/**
 * Feed Stack Navigator
 * Handles navigation within the Feed tab including user profiles
 */

import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import FeedScreen from '../screens/FeedScreen';
import PostCommentsScreen from '../screens/PostCommentsScreen';
import PostDetailScreen from '../screens/PostDetailScreen';
import UserProfileScreen from '../screens/UserProfileScreen';

export type FeedStackParamList = {
  FeedMain: undefined;
  UserProfile: {
    userId: string;
    username?: string;
  };
  PostDetail: {
    postId: string;
  };
  PostComments: {
    postId: string;
    username?: string;
  };
};

const Stack = createStackNavigator<FeedStackParamList>();

export default function FeedStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="FeedMain" component={FeedScreen} />
      <Stack.Screen name="UserProfile" component={UserProfileScreen} />
      <Stack.Screen name="PostDetail" component={PostDetailScreen} />
      <Stack.Screen name="PostComments" component={PostCommentsScreen} />
    </Stack.Navigator>
  );
}
