// Main Navigation for Terra Media Player
// Premium Modern Design - Black, White, Blue

import React from 'react';
import { View, StyleSheet, Text, Platform } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  AudioLibraryScreen,
  VideoLibraryScreen,
  NowPlayingScreen,
  FavoritesScreen,
  SettingsScreen,
  VideoPlayerScreen,
} from '../screens';
import { MiniPlayer } from '../components';
import { useAppSelector } from '../hooks/useRedux';
import { Colors, Shadows, Typography } from '../utils/colors';
import { DIMENSIONS } from '../utils/constants';

// Custom Dark Theme
const DarkTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.primary,
    background: Colors.background,
    card: Colors.surface,
    text: Colors.textPrimary,
    border: Colors.border,
    notification: Colors.primary,
  },
};

// Define navigation types
export type RootStackParamList = {
  Main: undefined;
  VideoPlayer: { videoId: number };
};

export type MainTabParamList = {
  Audio: undefined;
  Video: undefined;
  NowPlaying: undefined;
  Favorites: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Tab Icon Component
interface TabIconProps {
  focused: boolean;
  icon: string;
  label: string;
}

const TabIcon: React.FC<TabIconProps> = ({ focused, icon, label }) => (
  <View style={styles.tabIconContainer}>
    <Text style={[styles.tabIcon, focused && styles.tabIconFocused]}>
      {icon}
    </Text>
    <Text style={[styles.tabLabel, focused && styles.tabLabelFocused]}>
      {label}
    </Text>
  </View>
);

// Main Tab Navigator
const MainTabNavigator: React.FC = () => {
  const { currentTrack } = useAppSelector(state => state.playback);
  const hasMiniPlayer = !!currentTrack;

  return (
    <View style={styles.container}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: [
            styles.tabBar,
            hasMiniPlayer && styles.tabBarWithMiniPlayer,
          ],
          tabBarShowLabel: false,
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: Colors.textSecondary,
        }}
      >
        <Tab.Screen
          name="Audio"
          component={AudioLibraryScreen}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon focused={focused} icon="🎵" label="Music" />
            ),
          }}
        />
        <Tab.Screen
          name="Video"
          component={VideoLibraryScreen}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon focused={focused} icon="🎬" label="Videos" />
            ),
          }}
        />
        <Tab.Screen
          name="NowPlaying"
          component={NowPlayingScreen}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon focused={focused} icon="▶️" label="Playing" />
            ),
          }}
        />
        <Tab.Screen
          name="Favorites"
          component={FavoritesScreen}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon focused={focused} icon="❤️" label="Favorites" />
            ),
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon focused={focused} icon="⚙️" label="Settings" />
            ),
          }}
        />
      </Tab.Navigator>

      {/* Mini Player */}
      {hasMiniPlayer && <MiniPlayer />}
    </View>
  );
};

// Root Stack Navigator
export const Navigation: React.FC = () => {
  const { isDarkMode } = useAppSelector(state => state.ui);
  const theme = isDarkMode ? DarkTheme : DefaultTheme;

  return (
    <NavigationContainer theme={theme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: Colors.background },
        }}
      >
        <Stack.Screen name="Main" component={MainTabNavigator} />
        <Stack.Screen
          name="VideoPlayer"
          component={VideoPlayerScreen}
          options={{
            animation: 'fade',
            presentation: 'fullScreenModal',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  tabBar: {
    backgroundColor: Colors.black,
    borderTopWidth: 0.5,
    borderTopColor: Colors.border,
    height: Platform.OS === 'ios' ? DIMENSIONS.tabBar : 72,
    paddingTop: DIMENSIONS.spacing.sm,
    paddingBottom: Platform.OS === 'ios' ? 34 : DIMENSIONS.spacing.sm,
    paddingHorizontal: DIMENSIONS.spacing.md,
  },
  tabBarWithMiniPlayer: {
    // Mini player appears above tab bar
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    minWidth: 60,
  },
  tabIcon: {
    fontSize: 24,
    marginBottom: 4,
    opacity: 0.5,
  },
  tabIconFocused: {
    opacity: 1,
  },
  tabLabel: {
    ...Typography.caption2,
    color: Colors.tabBarInactive,
    fontWeight: '500',
  },
  tabLabelFocused: {
    color: Colors.primary,
    fontWeight: '600',
  },
  activeIndicator: {
    position: 'absolute',
    top: -4,
    width: 24,
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.primary,
  },
});

export default Navigation;
