/**
 * App Tabs Navigator
 */

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Platform } from 'react-native';
import { IconSymbol } from '../components/ui/IconSymbol';
import { HapticTab } from '../components/HapticTab';
import TabBarBackground from '../components/ui/TabBarBackground';
import { uvaColors } from '../theme/colors';
import { useTheme } from '../theme/ui';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import FeedScreen from '../screens/FeedScreen';

export type AppTabsParamList = {
  Home: undefined;
  Feed: undefined;
  You: undefined;
};

const Tab = createBottomTabNavigator<AppTabsParamList>();

export default function AppTabs() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: uvaColors.cavalierOrange,
        tabBarInactiveTintColor: colors.textSecondary,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: [
          {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
          },
          Platform.select({
            ios: {
              position: 'absolute',
            },
            default: {},
          }),
        ],
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Feed"
        component={FeedScreen}
        options={{
          title: 'Feed',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="paperplane.fill" color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="You"
        component={ProfileScreen}
        options={{
          title: 'You',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="chevron.left.forwardslash.chevron.right" color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
