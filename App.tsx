/**
 * Main App Component with Authentication Provider
 */

import 'react-native-url-polyfill/auto';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';
import { Provider as PaperProvider } from 'react-native-paper';






export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <PaperProvider>
          <RootNavigator />
            <StatusBar style="auto" />
        </PaperProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
