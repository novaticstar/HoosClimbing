/**
 * Authentication Stack Navigator - Simple Version
 */

import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';
import { ThemedText, useTheme } from '../theme/ui';

type AuthScreen = 'Login' | 'SignUp' | 'ForgotPassword';

export default function AuthStack() {
  const { colors } = useTheme();
  const [currentScreen, setCurrentScreen] = useState<AuthScreen>('Login');

  const renderHeader = () => {
    if (currentScreen === 'Login') return null;
    
    return (
      <SafeAreaView edges={['top']} style={[styles.header, { backgroundColor: colors.background }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => setCurrentScreen('Login')}
            style={styles.backButton}
          >
            <ThemedText variant="body" color="primary">
              ← Back
            </ThemedText>
          </TouchableOpacity>
          <ThemedText variant="h6" color="text" style={styles.headerTitle}>
            {currentScreen === 'SignUp' ? 'Create Account' : 'Reset Password'}
          </ThemedText>
          <View style={styles.headerSpacer} />
        </View>
      </SafeAreaView>
    );
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'SignUp':
        return <SignUpScreen onBackPress={() => setCurrentScreen('Login')} />;
      case 'ForgotPassword':
        return <ForgotPasswordScreen onBackPress={() => setCurrentScreen('Login')} />;
      default:
        return (
          <LoginScreen
            onSignUpPress={() => setCurrentScreen('SignUp')}
            onForgotPasswordPress={() => setCurrentScreen('ForgotPassword')}
          />
        );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {renderHeader()}
      {renderScreen()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 44,
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '600',
  },
  headerSpacer: {
    width: 60, // Same width as back button to center title
  },
});
