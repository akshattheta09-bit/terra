// Audio Playback Hook for Terra Media Player

import { useCallback, useEffect, useRef } from 'react';
import { Audio, AVPlaybackStatus, AVPlaybackStatusSuccess } from 'expo-av';
import { useAppDispatch, useAppSelector } from './useRedux';
import {
  setCurrentTrack,
  setQueue,
  setIsPlaying,
  setPlaybackLoading,
  setDuration,
  setPosition,
  setPlaybackSpeed,
  setLoopMode,
  toggleShuffle,
  setVolume,
  toggleMute,
  nextTrack,
  previousTrack,
  updatePlayCount,
  setShowMiniPlayer,
} from '../store';
import { AudioFile } from '../types/media';
import { PlaybackSpeed, LoopMode } from '../types/playback';
import * as DatabaseService from '../services/DatabaseService';

export const useAudioPlayback = () => {
  const dispatch = useAppDispatch();
  const soundRef = useRef<Audio.Sound | null>(null);
  const isConfigured = useRef(false);
  
  const {
    currentTrack,
    currentTrackId,
    queue,
    currentIndex,
    isPlaying,
    isLoading,
    duration,
    position,
    playbackSpeed,
    loopMode,
    isShuffle,
    volume,
    isMuted,
    showMiniPlayer,
  } = useAppSelector(state => state.playback);
  
  const allSongs = useAppSelector(state => state.audio.allSongs);
  
  // Configure audio mode for background playback
  useEffect(() => {
    const configureAudio = async () => {
      if (isConfigured.current) return;
      
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: true,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
        isConfigured.current = true;
      } catch (error) {
        console.error('Failed to configure audio mode:', error);
      }
    };
    
    configureAudio();
  }, []);
  
  // Handle playback status updates
  const onPlaybackStatusUpdate = useCallback((status: AVPlaybackStatus) => {
    if (!status.isLoaded) {
      dispatch(setPlaybackLoading(true));
      return;
    }
    
    const loadedStatus = status as AVPlaybackStatusSuccess;
    
    dispatch(setPlaybackLoading(loadedStatus.isBuffering));
    dispatch(setIsPlaying(loadedStatus.isPlaying));
    dispatch(setDuration(loadedStatus.durationMillis || 0));
    dispatch(setPosition(loadedStatus.positionMillis || 0));
    
    // Handle track completion
    if (loadedStatus.didJustFinish && !loadedStatus.isLooping) {
      handleTrackEnd();
    }
  }, [dispatch, loopMode, currentIndex, queue]);
  
  // Load and play a track
  const loadTrack = useCallback(async (track: AudioFile) => {
    try {
      dispatch(setPlaybackLoading(true));
      
      // Unload previous sound
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
      
      // Create new sound
      const { sound } = await Audio.Sound.createAsync(
        { uri: track.filePath },
        {
          shouldPlay: true,
          rate: playbackSpeed,
          volume: isMuted ? 0 : volume,
          isLooping: loopMode === 'one',
        },
        onPlaybackStatusUpdate
      );
      
      soundRef.current = sound;
      dispatch(setCurrentTrack(track));
      dispatch(setShowMiniPlayer(true));
      
      // Update play count in database
      dispatch(updatePlayCount(track.id));
      
    } catch (error) {
      console.error('Failed to load track:', error);
      dispatch(setPlaybackLoading(false));
    }
  }, [dispatch, playbackSpeed, volume, isMuted, loopMode, onPlaybackStatusUpdate]);
  
  // Handle track end
  const handleTrackEnd = useCallback(async () => {
    if (loopMode === 'one') {
      // Loop single track - handled by isLooping
      return;
    }
    
    if (currentIndex < queue.length - 1) {
      // Play next track
      dispatch(nextTrack());
    } else if (loopMode === 'all') {
      // Loop back to start
      dispatch(nextTrack());
    } else {
      // End of queue
      dispatch(setIsPlaying(false));
    }
  }, [dispatch, loopMode, currentIndex, queue]);
  
  // Load track when currentIndex changes
  useEffect(() => {
    if (queue.length > 0 && currentIndex >= 0 && currentIndex < queue.length) {
      const trackId = queue[currentIndex];
      const track = allSongs.find(s => s.id === trackId);
      
      if (track && track.id !== currentTrackId) {
        loadTrack(track);
      }
    }
  }, [currentIndex, queue, allSongs, currentTrackId, loadTrack]);
  
  // Play a single track
  const playTrack = useCallback(async (track: AudioFile) => {
    // Build queue from all songs if playing from library
    const trackIds = allSongs.map(s => s.id);
    const startIndex = trackIds.indexOf(track.id);
    
    dispatch(setQueue({ queue: trackIds, startIndex: startIndex >= 0 ? startIndex : 0 }));
  }, [dispatch, allSongs]);
  
  // Play a list of tracks
  const playTracks = useCallback(async (tracks: AudioFile[], startIndex: number = 0) => {
    const trackIds = tracks.map(t => t.id);
    dispatch(setQueue({ queue: trackIds, startIndex }));
  }, [dispatch]);
  
  // Play/pause toggle
  const togglePlayPause = useCallback(async () => {
    if (!soundRef.current) return;
    
    try {
      if (isPlaying) {
        await soundRef.current.pauseAsync();
      } else {
        await soundRef.current.playAsync();
      }
    } catch (error) {
      console.error('Failed to toggle play/pause:', error);
    }
  }, [isPlaying]);
  
  // Play
  const play = useCallback(async () => {
    if (!soundRef.current) return;
    
    try {
      await soundRef.current.playAsync();
    } catch (error) {
      console.error('Failed to play:', error);
    }
  }, []);
  
  // Pause
  const pause = useCallback(async () => {
    if (!soundRef.current) return;
    
    try {
      await soundRef.current.pauseAsync();
    } catch (error) {
      console.error('Failed to pause:', error);
    }
  }, []);
  
  // Stop
  const stop = useCallback(async () => {
    if (!soundRef.current) return;
    
    try {
      await soundRef.current.stopAsync();
      await soundRef.current.setPositionAsync(0);
    } catch (error) {
      console.error('Failed to stop:', error);
    }
  }, []);
  
  // Seek to position
  const seekTo = useCallback(async (positionMs: number) => {
    if (!soundRef.current) return;
    
    try {
      await soundRef.current.setPositionAsync(positionMs);
    } catch (error) {
      console.error('Failed to seek:', error);
    }
  }, []);
  
  // Skip to next track
  const skipToNext = useCallback(async () => {
    if (currentIndex < queue.length - 1 || loopMode === 'all') {
      dispatch(nextTrack());
    }
  }, [dispatch, currentIndex, queue.length, loopMode]);
  
  // Skip to previous track
  const skipToPrevious = useCallback(async () => {
    // If more than 3 seconds in, restart current track
    if (position > 3000) {
      await seekTo(0);
    } else {
      dispatch(previousTrack());
    }
  }, [dispatch, position, seekTo]);
  
  // Change playback speed
  const changePlaybackSpeed = useCallback(async (speed: PlaybackSpeed) => {
    dispatch(setPlaybackSpeed(speed));
    
    if (soundRef.current) {
      try {
        await soundRef.current.setRateAsync(speed, true);
      } catch (error) {
        console.error('Failed to set playback speed:', error);
      }
    }
  }, [dispatch]);
  
  // Change loop mode
  const changeLoopMode = useCallback(async (mode: LoopMode) => {
    dispatch(setLoopMode(mode));
    
    if (soundRef.current) {
      try {
        await soundRef.current.setIsLoopingAsync(mode === 'one');
      } catch (error) {
        console.error('Failed to set loop mode:', error);
      }
    }
  }, [dispatch]);
  
  // Change volume
  const changeVolume = useCallback(async (newVolume: number) => {
    dispatch(setVolume(newVolume));
    
    if (soundRef.current) {
      try {
        await soundRef.current.setVolumeAsync(newVolume);
      } catch (error) {
        console.error('Failed to set volume:', error);
      }
    }
  }, [dispatch]);
  
  // Toggle mute
  const handleToggleMute = useCallback(async () => {
    dispatch(toggleMute());
    
    if (soundRef.current) {
      try {
        await soundRef.current.setIsMutedAsync(!isMuted);
      } catch (error) {
        console.error('Failed to toggle mute:', error);
      }
    }
  }, [dispatch, isMuted]);
  
  // Toggle shuffle
  const handleToggleShuffle = useCallback(() => {
    dispatch(toggleShuffle());
  }, [dispatch]);
  
  // Cycle through loop modes
  const cycleLoopMode = useCallback(() => {
    const modes: LoopMode[] = ['none', 'all', 'one'];
    const currentModeIndex = modes.indexOf(loopMode);
    const nextMode = modes[(currentModeIndex + 1) % modes.length];
    changeLoopMode(nextMode);
  }, [loopMode, changeLoopMode]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);
  
  return {
    // State
    currentTrack,
    queue,
    currentIndex,
    isPlaying,
    isLoading,
    duration,
    position,
    playbackSpeed,
    loopMode,
    isShuffle,
    volume,
    isMuted,
    showMiniPlayer,
    
    // Actions
    playTrack,
    playTracks,
    togglePlayPause,
    play,
    pause,
    stop,
    seekTo,
    skipToNext,
    skipToPrevious,
    changePlaybackSpeed,
    changeLoopMode,
    cycleLoopMode,
    changeVolume,
    toggleMute: handleToggleMute,
    toggleShuffle: handleToggleShuffle,
  };
};

export default useAudioPlayback;
