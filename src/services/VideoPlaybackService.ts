// ═══════════════════════════════════════════════════════════════════════════════
// TERRA MEDIA PLAYER - PREMIUM VIDEO PLAYBACK SERVICE
// Background Play, Notification Controls, Headphone Support
// Inspired by VLC and Lark Player
// ═══════════════════════════════════════════════════════════════════════════════

import { Audio } from 'expo-av';
import { Platform, AppState, AppStateStatus } from 'react-native';
import { VideoFile } from '../types/media';
import { LoopMode, PlaybackSpeed } from '../types/playback';
import { VideoPlayer } from 'expo-video';

// ─────────────────────────────────────────────────────────────────────────────
// Types & Interfaces
// ─────────────────────────────────────────────────────────────────────────────

export interface VideoPlaybackState {
  isPlaying: boolean;
  isLoading: boolean;
  duration: number;
  position: number;
  bufferedPosition: number;
  playbackSpeed: PlaybackSpeed;
  error: string | null;
}

export interface VideoQueueState {
  queue: VideoFile[];
  currentIndex: number;
  originalQueue: VideoFile[];
  isShuffled: boolean;
  loopMode: LoopMode;
}

export type PlaybackStatusCallback = (status: VideoPlaybackState) => void;
export type VideoChangeCallback = (video: VideoFile | null, index: number) => void;
export type RemoteControlCallback = (action: RemoteControlAction) => void;

export type RemoteControlAction = 
  | 'play'
  | 'pause'
  | 'toggle'
  | 'next'
  | 'previous'
  | 'seekForward'
  | 'seekBackward'
  | 'stop';

// ─────────────────────────────────────────────────────────────────────────────
// Service State
// ─────────────────────────────────────────────────────────────────────────────

let isAudioModeConfigured = false;
let appStateSubscription: any = null;
let currentAppState: AppStateStatus = 'active';

// Queue state
const queueState: VideoQueueState = {
  queue: [],
  currentIndex: -1,
  originalQueue: [],
  isShuffled: false,
  loopMode: 'none',
};

// Callbacks
let statusCallback: PlaybackStatusCallback | null = null;
let videoChangeCallback: VideoChangeCallback | null = null;
let remoteControlCallback: RemoteControlCallback | null = null;

// Player Reference
let videoPlayer: VideoPlayer | null = null;

// ─────────────────────────────────────────────────────────────────────────────
// Audio Mode Configuration
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Configure audio mode for video playback (including background)
 */
export const configureVideoAudioMode = async (
  allowBackground: boolean = true
): Promise<void> => {
  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: allowBackground,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });
    isAudioModeConfigured = true;
    console.log('[VideoPlaybackService] Audio mode configured for video playback');
  } catch (error) {
    console.error('[VideoPlaybackService] Failed to configure audio mode:', error);
    throw error;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// App State Management
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Initialize app state listener for background handling
 */
export const initializeAppStateListener = (): void => {
  if (appStateSubscription) return;
  
  appStateSubscription = AppState.addEventListener('change', (nextState: AppStateStatus) => {
    console.log(`[VideoPlaybackService] App state changed: ${currentAppState} -> ${nextState}`);
    currentAppState = nextState;
  });
};

/**
 * Cleanup app state listener
 */
export const cleanupAppStateListener = (): void => {
  if (appStateSubscription) {
    appStateSubscription.remove();
    appStateSubscription = null;
  }
};

/**
 * Check if app is in foreground
 */
export const isAppInForeground = (): boolean => {
  return currentAppState === 'active';
};

// ─────────────────────────────────────────────────────────────────────────────
// Player Registration & Control
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Register the Expo Video Player instance
 */
export const registerPlayer = (player: VideoPlayer) => {
  videoPlayer = player;
  
  // Configure Player for Background & Lock Screen
  videoPlayer.staysActiveInBackground = true;
  videoPlayer.showNowPlayingNotification = true;
  
  console.log('[VideoPlaybackService] Player registered and configured');
};

/**
 * Play a specific video file with Metadata
 */
const playMedia = (video: VideoFile) => {
  if (!videoPlayer) return;

  const metadata = {
    title: video.title || video.fileName,
    artist: 'Terra Player',
    artwork: video.thumbnail, 
  };

  videoPlayer.replace({
    uri: video.filePath,
    metadata,
  });
  
  // Ensure playing
  videoPlayer.play();
  
  console.log(`[VideoPlaybackService] Playing: ${metadata.title}`);
};


// ─────────────────────────────────────────────────────────────────────────────
// Queue Management
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Set video queue for playback
 */
export const setVideoQueue = (
  videos: VideoFile[],
  startIndex: number = 0
): void => {
  queueState.queue = [...videos];
  queueState.originalQueue = [...videos];
  queueState.currentIndex = Math.max(0, Math.min(startIndex, videos.length - 1));
  queueState.isShuffled = false;
  
  console.log(`[VideoPlaybackService] Queue set with ${videos.length} videos, starting at ${startIndex}`);
  
  // Notify about current video
  const currentVideo = getCurrentVideo();
  videoChangeCallback?.(currentVideo, queueState.currentIndex);
  
  // If player is registered, start playing ONLY if we have a valid index
  if (currentVideo && videoPlayer) {
    playMedia(currentVideo);
  }
};

/**
 * Get current video in queue
 */
export const getCurrentVideo = (): VideoFile | null => {
  if (queueState.currentIndex < 0 || queueState.currentIndex >= queueState.queue.length) {
    return null;
  }
  return queueState.queue[queueState.currentIndex];
};

/**
 * Get current queue state
 */
export const getQueueState = (): VideoQueueState => {
  return { ...queueState };
};

/**
 * Get video at specific index
 */
export const getVideoAtIndex = (index: number): VideoFile | null => {
  if (index < 0 || index >= queueState.queue.length) {
    return null;
  }
  return queueState.queue[index];
};

/**
 * Check if there's a next video
 */
export const hasNextVideo = (): boolean => {
  if (queueState.loopMode === 'all') return queueState.queue.length > 0;
  if (queueState.loopMode === 'one') return true;
  return queueState.currentIndex < queueState.queue.length - 1;
};

/**
 * Check if there's a previous video
 */
export const hasPreviousVideo = (): boolean => {
  if (queueState.loopMode === 'all') return queueState.queue.length > 0;
  if (queueState.loopMode === 'one') return true;
  return queueState.currentIndex > 0;
};

/**
 * Move to next video
 * Returns the new video or null if at end of queue
 */
export const nextVideo = (): VideoFile | null => {
  if (queueState.queue.length === 0) return null;
  
  let newIndex = queueState.currentIndex;
  
  if (queueState.loopMode === 'one') {
    // Stay on same video
    newIndex = queueState.currentIndex;
  } else if (queueState.currentIndex < queueState.queue.length - 1) {
    // Go to next
    newIndex = queueState.currentIndex + 1;
  } else if (queueState.loopMode === 'all') {
    // Loop back to start
    newIndex = 0;
  } else {
    // At end of queue
    return null;
  }
  
  queueState.currentIndex = newIndex;
  const video = getCurrentVideo();
  
  console.log(`[VideoPlaybackService] Next video: ${video?.fileName} (index: ${newIndex})`);
  videoChangeCallback?.(video, newIndex);
  
  if (video) playMedia(video);

  return video;
};

/**
 * Move to previous video
 * Returns the new video or null if at start of queue
 */
export const previousVideo = (): VideoFile | null => {
  if (queueState.queue.length === 0) return null;
  
  let newIndex = queueState.currentIndex;
  
  if (queueState.loopMode === 'one') {
    // Stay on same video
    newIndex = queueState.currentIndex;
  } else if (queueState.currentIndex > 0) {
    // Go to previous
    newIndex = queueState.currentIndex - 1;
  } else if (queueState.loopMode === 'all') {
    // Loop to end
    newIndex = queueState.queue.length - 1;
  } else {
    // At start of queue
    return null;
  }
  
  queueState.currentIndex = newIndex;
  const video = getCurrentVideo();
  
  console.log(`[VideoPlaybackService] Previous video: ${video?.fileName} (index: ${newIndex})`);
  videoChangeCallback?.(video, newIndex);
  
  if (video) playMedia(video);

  return video;
};

/**
 * Jump to specific index in queue
 */
export const jumpToIndex = (index: number): VideoFile | null => {
  if (index < 0 || index >= queueState.queue.length) return null;
  
  queueState.currentIndex = index;
  const video = getCurrentVideo();
  
  console.log(`[VideoPlaybackService] Jumped to index ${index}: ${video?.fileName}`);
  videoChangeCallback?.(video, index);
  
  if (video) playMedia(video);

  return video;
};

/**
 * Set loop mode
 */
export const setLoopMode = (mode: LoopMode): void => {
  queueState.loopMode = mode;
  console.log(`[VideoPlaybackService] Loop mode set to: ${mode}`);
};

/**
 * Get current loop mode
 */
export const getLoopMode = (): LoopMode => {
  return queueState.loopMode;
};

/**
 * Toggle shuffle mode
 */
export const toggleShuffle = (): boolean => {
  queueState.isShuffled = !queueState.isShuffled;
  
  if (queueState.isShuffled) {
    // Save current video
    const currentVideo = getCurrentVideo();
    
    // Shuffle the queue (Fisher-Yates algorithm)
    const shuffled = [...queueState.queue];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    // Move current video to front
    if (currentVideo) {
      const currentIdx = shuffled.findIndex(v => v.id === currentVideo.id);
      if (currentIdx > 0) {
        shuffled.splice(currentIdx, 1);
        shuffled.unshift(currentVideo);
      }
    }
    
    queueState.queue = shuffled;
    queueState.currentIndex = 0;
  } else {
    // Restore original order
    const currentVideo = getCurrentVideo();
    queueState.queue = [...queueState.originalQueue];
    
    // Find current video in restored queue
    if (currentVideo) {
      const newIdx = queueState.queue.findIndex(v => v.id === currentVideo.id);
      queueState.currentIndex = newIdx >= 0 ? newIdx : 0;
    }
  }
  
  console.log(`[VideoPlaybackService] Shuffle: ${queueState.isShuffled}`);
  return queueState.isShuffled;
};

/**
 * Check if shuffle is enabled
 */
export const isShuffleEnabled = (): boolean => {
  return queueState.isShuffled;
};

/**
 * Clear the queue
 */
export const clearQueue = (): void => {
  queueState.queue = [];
  queueState.originalQueue = [];
  queueState.currentIndex = -1;
  queueState.isShuffled = false;
  
  console.log('[VideoPlaybackService] Queue cleared');
  videoChangeCallback?.(null, -1);
};

/**
 * Add video to queue
 */
export const addToQueue = (video: VideoFile): void => {
  queueState.queue.push(video);
  queueState.originalQueue.push(video);
  console.log(`[VideoPlaybackService] Added to queue: ${video.fileName}`);
};

/**
 * Remove video from queue by index
 */
export const removeFromQueue = (index: number): void => {
  if (index < 0 || index >= queueState.queue.length) return;
  
  const removed = queueState.queue[index];
  queueState.queue.splice(index, 1);
  
  // Also remove from original queue
  const origIdx = queueState.originalQueue.findIndex(v => v.id === removed.id);
  if (origIdx >= 0) {
    queueState.originalQueue.splice(origIdx, 1);
  }
  
  // Adjust current index if needed
  if (index < queueState.currentIndex) {
    queueState.currentIndex--;
  } else if (index === queueState.currentIndex) {
    // Current video was removed
    if (queueState.currentIndex >= queueState.queue.length) {
      queueState.currentIndex = queueState.queue.length - 1;
    }
    const newVideo = getCurrentVideo();
    videoChangeCallback?.(newVideo, queueState.currentIndex);
  }
  
  console.log(`[VideoPlaybackService] Removed from queue: ${removed.fileName}`);
};

// ─────────────────────────────────────────────────────────────────────────────
// Callbacks Registration
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Register playback status callback
 */
export const setPlaybackStatusCallback = (callback: PlaybackStatusCallback | null): void => {
  statusCallback = callback;
};

/**
 * Register video change callback
 */
export const setVideoChangeCallback = (callback: VideoChangeCallback | null): void => {
  videoChangeCallback = callback;
};

/**
 * Register remote control callback
 */
export const setRemoteControlCallback = (callback: RemoteControlCallback | null): void => {
  remoteControlCallback = callback;
};

// ─────────────────────────────────────────────────────────────────────────────
// Remote Control Handling (Headphones, etc.)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Handle remote control event
 * This is called when headphone buttons are pressed
 */
export const handleRemoteControlEvent = (action: RemoteControlAction): void => {
  console.log(`[VideoPlaybackService] Remote control action: ${action}`);
  remoteControlCallback?.(action);
};

/**
 * Dispatch remote control action
 * Use this to programmatically trigger remote control actions
 */
export const dispatchRemoteAction = (action: RemoteControlAction): void => {
  handleRemoteControlEvent(action);
};

// ─────────────────────────────────────────────────────────────────────────────
// Initialization & Cleanup
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Initialize video playback service
 */
export const initializeVideoService = async (): Promise<void> => {
  try {
    await configureVideoAudioMode(true);
    initializeAppStateListener();
    console.log('[VideoPlaybackService] Service initialized');
  } catch (error) {
    console.error('[VideoPlaybackService] Failed to initialize:', error);
    throw error;
  }
};

/**
 * Cleanup video playback service
 */
export const cleanupVideoService = (): void => {
  cleanupAppStateListener();
  clearQueue();
  statusCallback = null;
  videoChangeCallback = null;
  remoteControlCallback = null;
  console.log('[VideoPlaybackService] Service cleaned up');
};

// ─────────────────────────────────────────────────────────────────────────────
// Utility Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Format time for display (mm:ss or hh:mm:ss)
 */
export const formatPlaybackTime = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

/**
 * Get playback speed label
 */
export const getSpeedLabel = (speed: PlaybackSpeed): string => {
  if (speed === 1) return 'Normal';
  return `${speed}x`;
};

/**
 * Get loop mode label
 */
export const getLoopModeLabel = (mode: LoopMode): string => {
  switch (mode) {
    case 'none': return 'Off';
    case 'one': return 'Repeat One';
    case 'all': return 'Repeat All';
  }
};

/**
 * Get loop mode icon
 */
export const getLoopModeIcon = (mode: LoopMode): string => {
  switch (mode) {
    case 'none': return '🔁';
    case 'one': return '🔂';
    case 'all': return '🔃';
  }
};

export default {
  initializeVideoService,
  cleanupVideoService,
  configureVideoAudioMode,
  registerPlayer,
  setVideoQueue,
  getCurrentVideo,
  getQueueState,
  hasNextVideo,
  hasPreviousVideo,
  nextVideo,
  previousVideo,
  jumpToIndex,
  setLoopMode,
  getLoopMode,
  toggleShuffle,
  isShuffleEnabled,
  clearQueue,
  addToQueue,
  removeFromQueue,
  setPlaybackStatusCallback,
  setVideoChangeCallback,
  setRemoteControlCallback,
  handleRemoteControlEvent,
  formatPlaybackTime,
  getSpeedLabel,
  getLoopModeLabel,
  getLoopModeIcon,
};
