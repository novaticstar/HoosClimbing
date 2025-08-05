/**
 * Friends Stack Navigator
 * Handles navigation within the Friends tab
 */

import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import FriendsScreen from '../screens/FriendsScreen';
import PostCommentsScreen from '../screens/PostCommentsScreen';
import PostDetailScreen from '../screens/PostDetailScreen';

export type FriendsStackParamList = {
  FriendsMain: undefined;
  PostDetail: {
    postId: string;
  };
  PostComments: {
    postId: string;
    username?: string;
  };
};

const Stack = createStackNavigator<FriendsStackParamList>();

export default function FriendsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="FriendsMain" component={FriendsScreen} />
      <Stack.Screen name="PostDetail" component={PostDetailScreen} />
      <Stack.Screen name="PostComments" component={PostCommentsScreen} />
    </Stack.Navigator>
  );
}
