// Constants for Terra Media Player

// App info
export const APP_NAME = 'Terra';
export const APP_VERSION = '1.0.0';

// Database
export const DATABASE_NAME = 'terra.db';
export const DATABASE_VERSION = 1;

// Storage keys (AsyncStorage)
export const STORAGE_KEYS = {
  SETTINGS: '@terra_settings',
  QUEUE: '@terra_queue',
  CURRENT_TRACK: '@terra_current_track',
  PLAY_POSITION: '@terra_play_position',
  THEME: '@terra_theme',
  FIRST_LAUNCH: '@terra_first_launch',
  SEARCH_HISTORY: '@terra_search_history',
};

// Scan paths for Android
export const SCAN_PATHS = [
  '/storage/emulated/0/',
  '/storage/emulated/0/Music/',
  '/storage/emulated/0/Movies/',
  '/storage/emulated/0/DCIM/',
  '/storage/emulated/0/Download/',
  '/storage/emulated/0/Documents/',
  '/sdcard/',
  '/sdcard/Music/',
  '/sdcard/Movies/',
  '/sdcard/Download/',
];

// UI Dimensions
export const DIMENSIONS = {
  // Spacing
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  // Border radius
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
  
  // Touch targets (minimum 48dp for accessibility)
  touchTarget: {
    min: 48,
    default: 56,
    large: 64,
  },
  
  // Icon sizes
  iconSize: {
    sm: 16,
    md: 24,
    lg: 32,
    xl: 48,
  },
  
  // Font sizes
  fontSize: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  
  // Component heights
  header: 56,
  tabBar: 64,
  miniPlayer: 64,
  listItem: 56,
  listItemCompact: 48,
  listItemDetailed: 72,
  button: 48,
  searchBar: 48,
  
  // Album art sizes
  albumArt: {
    thumbnail: 48,
    small: 64,
    medium: 120,
    large: 200,
    fullscreen: 300,
  },
  
  // Video thumbnail sizes
  videoThumbnail: {
    small: { width: 120, height: 68 },
    medium: { width: 180, height: 101 },
    large: { width: 240, height: 135 },
  },
};

// Animation durations
export const ANIMATION = {
  fast: 150,
  normal: 300,
  slow: 500,
  verySlow: 1000,
};

// Playback
export const PLAYBACK = {
  seekInterval: 10, // seconds
  volumeStep: 0.1,
  brightnessStep: 0.1,
  controlsAutoHideDelay: 3000, // milliseconds
  seekPreviewDelay: 300, // milliseconds
  doubleTapDelay: 300, // milliseconds
};

// Library
export const LIBRARY = {
  recentlyPlayedLimit: 100,
  mostPlayedLimit: 50,
  searchHistoryLimit: 10,
  pageSize: 50,
};

// File size limits
export const FILE_SIZE = {
  minAudioBytes: 50 * 1024, // 50KB minimum
  minVideoBytes: 100 * 1024, // 100KB minimum
  maxThumbnailBytes: 5 * 1024 * 1024, // 5MB max thumbnail
};

// Subtitle settings
export const SUBTITLE = {
  fontSizes: {
    small: 14,
    medium: 18,
    large: 24,
  },
  colors: {
    white: '#FFFFFF',
    yellow: '#FFFF00',
    red: '#FF0000',
    green: '#00FF00',
    blue: '#0000FF',
    cyan: '#00FFFF',
  },
  maxDelay: 10000, // +/- 10 seconds
  delayStep: 100, // 100ms increments
};

// Equalizer presets (frequency gains in dB)
export const EQUALIZER_PRESETS = {
  normal: [0, 0, 0, 0, 0],
  bass_boost: [5, 4, 2, 0, 0],
  treble_boost: [0, 0, 2, 4, 5],
  pop: [1, 2, 3, 2, 1],
  rock: [4, 2, 0, 2, 4],
  jazz: [3, 2, 1, 2, 3],
  classical: [4, 3, 0, 2, 3],
  metal: [5, 3, 0, 3, 5],
};
