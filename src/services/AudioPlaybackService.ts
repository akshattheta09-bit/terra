// Audio Playback Service for Terra Media Player

import { Audio, AVPlaybackStatus, AVPlaybackStatusSuccess } from 'expo-av';

let soundInstance: Audio.Sound | null = null;
let isAudioModeConfigured = false;

/**
 * Configure audio mode for background playback
 */
export const configureAudioMode = async (): Promise<void> => {
  if (isAudioModeConfigured) return;
  
  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });
    isAudioModeConfigured = true;
    console.log('Audio mode configured for background playback');
  } catch (error) {
    console.error('Failed to configure audio mode:', error);
    throw error;
  }
};

/**
 * Load an audio file
 */
export const loadAudio = async (
  uri: string,
  onPlaybackStatusUpdate?: (status: AVPlaybackStatus) => void
): Promise<Audio.Sound> => {
  // Ensure audio mode is configured
  await configureAudioMode();
  
  // Unload previous sound if exists
  await unloadAudio();
  
  try {
    const { sound } = await Audio.Sound.createAsync(
      { uri },
      { shouldPlay: false },
      onPlaybackStatusUpdate
    );
    
    soundInstance = sound;
    return sound;
  } catch (error) {
    console.error('Failed to load audio:', error);
    throw error;
  }
};

/**
 * Play the current audio
 */
export const playAudio = async (): Promise<void> => {
  if (!soundInstance) {
    throw new Error('No audio loaded');
  }
  
  try {
    await soundInstance.playAsync();
  } catch (error) {
    console.error('Failed to play audio:', error);
    throw error;
  }
};

/**
 * Pause the current audio
 */
export const pauseAudio = async (): Promise<void> => {
  if (!soundInstance) return;
  
  try {
    await soundInstance.pauseAsync();
  } catch (error) {
    console.error('Failed to pause audio:', error);
    throw error;
  }
};

/**
 * Stop the current audio
 */
export const stopAudio = async (): Promise<void> => {
  if (!soundInstance) return;
  
  try {
    await soundInstance.stopAsync();
  } catch (error) {
    console.error('Failed to stop audio:', error);
    throw error;
  }
};

/**
 * Unload the current audio
 */
export const unloadAudio = async (): Promise<void> => {
  if (!soundInstance) return;
  
  try {
    await soundInstance.unloadAsync();
    soundInstance = null;
  } catch (error) {
    console.error('Failed to unload audio:', error);
  }
};

/**
 * Seek to a position in the audio
 */
export const seekTo = async (positionMs: number): Promise<void> => {
  if (!soundInstance) return;
  
  try {
    await soundInstance.setPositionAsync(positionMs);
  } catch (error) {
    console.error('Failed to seek:', error);
    throw error;
  }
};

/**
 * Seek forward by a number of seconds
 */
export const seekForward = async (seconds: number = 10): Promise<void> => {
  if (!soundInstance) return;
  
  try {
    const status = await soundInstance.getStatusAsync();
    if (status.isLoaded) {
      const newPosition = Math.min(
        status.positionMillis + seconds * 1000,
        status.durationMillis || 0
      );
      await soundInstance.setPositionAsync(newPosition);
    }
  } catch (error) {
    console.error('Failed to seek forward:', error);
    throw error;
  }
};

/**
 * Seek backward by a number of seconds
 */
export const seekBackward = async (seconds: number = 10): Promise<void> => {
  if (!soundInstance) return;
  
  try {
    const status = await soundInstance.getStatusAsync();
    if (status.isLoaded) {
      const newPosition = Math.max(status.positionMillis - seconds * 1000, 0);
      await soundInstance.setPositionAsync(newPosition);
    }
  } catch (error) {
    console.error('Failed to seek backward:', error);
    throw error;
  }
};

/**
 * Set playback speed
 */
export const setPlaybackRate = async (rate: number): Promise<void> => {
  if (!soundInstance) return;
  
  try {
    await soundInstance.setRateAsync(rate, true);
  } catch (error) {
    console.error('Failed to set playback rate:', error);
    throw error;
  }
};

/**
 * Set volume
 */
export const setVolume = async (volume: number): Promise<void> => {
  if (!soundInstance) return;
  
  try {
    await soundInstance.setVolumeAsync(Math.max(0, Math.min(1, volume)));
  } catch (error) {
    console.error('Failed to set volume:', error);
    throw error;
  }
};

/**
 * Set mute state
 */
export const setMuted = async (muted: boolean): Promise<void> => {
  if (!soundInstance) return;
  
  try {
    await soundInstance.setIsMutedAsync(muted);
  } catch (error) {
    console.error('Failed to set mute state:', error);
    throw error;
  }
};

/**
 * Set loop mode
 */
export const setLooping = async (isLooping: boolean): Promise<void> => {
  if (!soundInstance) return;
  
  try {
    await soundInstance.setIsLoopingAsync(isLooping);
  } catch (error) {
    console.error('Failed to set looping:', error);
    throw error;
  }
};

/**
 * Get current playback status
 */
export const getStatus = async (): Promise<AVPlaybackStatus | null> => {
  if (!soundInstance) return null;
  
  try {
    return await soundInstance.getStatusAsync();
  } catch (error) {
    console.error('Failed to get status:', error);
    return null;
  }
};

/**
 * Check if audio is currently playing
 */
export const isPlaying = async (): Promise<boolean> => {
  const status = await getStatus();
  return status?.isLoaded ? (status as AVPlaybackStatusSuccess).isPlaying : false;
};

/**
 * Get current position in milliseconds
 */
export const getPosition = async (): Promise<number> => {
  const status = await getStatus();
  return status?.isLoaded ? (status as AVPlaybackStatusSuccess).positionMillis : 0;
};

/**
 * Get duration in milliseconds
 */
export const getDuration = async (): Promise<number> => {
  const status = await getStatus();
  return status?.isLoaded ? (status as AVPlaybackStatusSuccess).durationMillis || 0 : 0;
};

/**
 * Get the current sound instance
 */
export const getSoundInstance = (): Audio.Sound | null => {
  return soundInstance;
};

export const AudioPlaybackService = {
  configureAudioMode,
  loadAudio,
  playAudio,
  pauseAudio,
  stopAudio,
  unloadAudio,
  seekTo,
  seekForward,
  seekBackward,
  setPlaybackRate,
  setVolume,
  setMuted,
  setLooping,
  getStatus,
  isPlaying,
  getPosition,
  getDuration,
  getSoundInstance,
};

export default AudioPlaybackService;
