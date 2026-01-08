// Terra Media Player - Main App Entry Point

import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { StatusBar, View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { store } from './src/store';
import { Navigation } from './src/navigation';
import { initDatabase } from './src/services/DatabaseService';
import { configureAudioMode, unloadAudio } from './src/services/AudioPlaybackService';
import { useAppSelector, useAppDispatch } from './src/hooks/useRedux';
import { useAudioPlayback } from './src/hooks/useAudioPlayback';
import { Colors } from './src/utils/colors';
import { DIMENSIONS } from './src/utils/constants';

// App initialization states
type InitState = 'loading' | 'ready' | 'error';

// Main App wrapper with providers
const AppContent: React.FC = () => {
  const [initState, setInitState] = useState<InitState>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize database
        await initDatabase();

        // Configure audio mode for background playback
        await configureAudioMode();

        setInitState('ready');
      } catch (err) {
        console.error('App initialization error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setInitState('error');
      }
    };

    initializeApp();

    return () => {
      unloadAudio();
    };
  }, []);

  // Sleep Timer Logic
  const { sleepTimerEndTime } = useAppSelector(state => state.ui);
  const dispatch = useAppDispatch();
  const { pause } = useAudioPlayback();

  useEffect(() => {
    if (!sleepTimerEndTime) return;

    const interval = setInterval(() => {
      if (Date.now() >= sleepTimerEndTime) {
        // Time's up!
        console.log('[SleepTimer] Timer finished, pausing playback');
        pause(); // Pause audio
        // For video, we might need a global event or service call, but audio service handles background.
        // If video is playing, it should also pause if linked, or we can use VideoPlaybackService.

        dispatch({ type: 'ui/clearSleepTimer' });

        // Optional: Show toast or alert
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [sleepTimerEndTime, pause, dispatch]);

  // Loading state
  if (initState === 'loading') {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingLogo}>🎵</Text>
        <Text style={styles.loadingTitle}>Terra</Text>
        <Text style={styles.loadingSubtitle}>Premium Media Player</Text>
        <ActivityIndicator
          size="large"
          color={Colors.primary}
          style={styles.loadingSpinner}
        />
      </View>
    );
  }

  // Error state
  if (initState === 'error') {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorTitle}>Initialization Failed</Text>
        <Text style={styles.errorMessage}>{error}</Text>
      </View>
    );
  }

  // Ready - render main app
  return <Navigation />;
};

// Root App component
export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <Provider store={store}>
          <StatusBar
            barStyle="light-content"
            backgroundColor={Colors.background}
            translucent={false}
          />
          <AppContent />
        </Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingLogo: {
    fontSize: 80,
    marginBottom: DIMENSIONS.spacing.lg,
  },
  loadingTitle: {
    fontSize: 36,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: DIMENSIONS.spacing.sm,
  },
  loadingSubtitle: {
    fontSize: DIMENSIONS.fontSize.md,
    color: Colors.textSecondary,
    marginBottom: DIMENSIONS.spacing.xl,
  },
  loadingSpinner: {
    marginTop: DIMENSIONS.spacing.lg,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: DIMENSIONS.spacing.xl,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: DIMENSIONS.spacing.lg,
  },
  errorTitle: {
    fontSize: DIMENSIONS.fontSize.xl,
    fontWeight: '600',
    color: Colors.error,
    marginBottom: DIMENSIONS.spacing.md,
  },
  errorMessage: {
    fontSize: DIMENSIONS.fontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
