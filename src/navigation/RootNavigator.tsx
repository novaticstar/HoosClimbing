/**
 * Root Navigator
 * Handles authentication state and navigation between auth and app flows
 */

import { NavigationContainer } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Container, spacing, ThemedText } from '../theme/ui';
import AppTabs from './AppTabs';
import AuthStack from './AuthStack';

// Loading screen component
function LoadingScreen() {
  return (
    <Container>
      <View style={styles.center}>
        <ThemedText variant="h2" color="textSecondary">
          Loading...
        </ThemedText>
      </View>
    </Container>
  );
}

export default function RootNavigator() {
  const { session, loading } = useAuth();
  const [isPasswordReset, setIsPasswordReset] = useState(false);

  useEffect(() => {
    // Handle deep link URLs
    const handleDeepLink = (url: string) => {
      console.log('Deep link received:', url);
      
      // Parse the URL
      const parsed = Linking.parse(url);
      
      if (parsed.path === '/password-reset') {
        setIsPasswordReset(true);
      } else if (parsed.path === '/auth-callback') {
        // Auth callback is handled by Supabase automatically
        // The AuthContext will pick up the SIGNED_IN event
        console.log('Auth callback received');
      }
    };

    // Handle initial URL (when app is opened via deep link)
    const getInitialURL = async () => {
      const initialURL = await Linking.getInitialURL();
      if (initialURL) {
        handleDeepLink(initialURL);
      }
    };

    getInitialURL();

    // Listen for incoming links when app is already open
    const subscription = Linking.addEventListener('url', (event) => {
      handleDeepLink(event.url);
    });

    return () => {
      subscription?.remove();
    };
  }, []);

  // Show loading screen while auth state is being determined
  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      {session ? <AppTabs /> : <AuthStack />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
});
