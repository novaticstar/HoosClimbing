/**
 * useAppStateSync Hook
 * Syncs data when app comes back to foreground
 */

import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';

export function useAppStateSync(onForeground: () => void, onBackground?: () => void) {
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App has come to the foreground
        console.log('App has come to the foreground');
        onForeground();
      } else if (
        appState.current === 'active' &&
        nextAppState.match(/inactive|background/)
      ) {
        // App has gone to the background
        console.log('App has gone to the background');
        onBackground?.();
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription?.remove();
    };
  }, [onForeground, onBackground]);
}
