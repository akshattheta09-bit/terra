// Playback Slice for Terra Media Player

import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { Audio, AVPlaybackStatus } from 'expo-av';
import { AudioFile } from '../types/media';
import { PlaybackSpeed, LoopMode } from '../types/playback';
import * as DatabaseService from '../services/DatabaseService';

interface PlaybackState {
  // Current track info
  currentTrack: AudioFile | null;
  currentTrackId: number | null;
  
  // Queue
  queue: number[];
  originalQueue: number[];
  currentIndex: number;
  
  // Playback state
  isPlaying: boolean;
  isLoading: boolean;
  duration: number;
  position: number;
  bufferedPosition: number;
  
  // Settings
  playbackSpeed: PlaybackSpeed;
  loopMode: LoopMode;
  isShuffle: boolean;
  volume: number;
  isMuted: boolean;
  
  // UI State
  showMiniPlayer: boolean;
  showFullPlayer: boolean;
}

const initialState: PlaybackState = {
  currentTrack: null,
  currentTrackId: null,
  queue: [],
  originalQueue: [],
  currentIndex: -1,
  isPlaying: false,
  isLoading: false,
  duration: 0,
  position: 0,
  bufferedPosition: 0,
  playbackSpeed: 1,
  loopMode: 'none',
  isShuffle: false,
  volume: 1,
  isMuted: false,
  showMiniPlayer: false,
  showFullPlayer: false,
};

// Async thunks
export const updatePlayCount = createAsyncThunk(
  'playback/updatePlayCount',
  async (id: number, { rejectWithValue }) => {
    try {
      await DatabaseService.updateAudioPlayCount(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const addToHistory = createAsyncThunk(
  'playback/addToHistory',
  async (
    { filePath, position, duration }: { filePath: string; position: number; duration: number },
    { rejectWithValue }
  ) => {
    try {
      await DatabaseService.addToPlayHistory(filePath, 'audio', position, duration);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const playbackSlice = createSlice({
  name: 'playback',
  initialState,
  reducers: {
    setCurrentTrack: (state, action: PayloadAction<AudioFile | null>) => {
      state.currentTrack = action.payload;
      state.currentTrackId = action.payload?.id || null;
      state.showMiniPlayer = action.payload !== null;
    },
    
    setQueue: (state, action: PayloadAction<{ queue: number[]; startIndex?: number }>) => {
      state.queue = action.payload.queue;
      state.originalQueue = action.payload.queue;
      state.currentIndex = action.payload.startIndex ?? 0;
      
      if (state.isShuffle && state.queue.length > 1) {
        // Shuffle but keep current track at the beginning
        const currentId = state.queue[state.currentIndex];
        const shuffled = shuffleArray([...state.queue].filter(id => id !== currentId));
        state.queue = [currentId, ...shuffled];
        state.currentIndex = 0;
      }
    },
    
    addToQueue: (state, action: PayloadAction<number>) => {
      state.queue.push(action.payload);
      state.originalQueue.push(action.payload);
    },
    
    removeFromQueue: (state, action: PayloadAction<number>) => {
      const index = action.payload;
      if (index >= 0 && index < state.queue.length) {
        state.queue.splice(index, 1);
        if (index < state.currentIndex) {
          state.currentIndex--;
        }
      }
    },
    
    clearQueue: (state) => {
      state.queue = [];
      state.originalQueue = [];
      state.currentIndex = -1;
      state.currentTrack = null;
      state.currentTrackId = null;
      state.showMiniPlayer = false;
    },
    
    nextTrack: (state) => {
      if (state.loopMode === 'one') {
        // Stay on current track, position will be reset
        return;
      }
      
      if (state.currentIndex < state.queue.length - 1) {
        state.currentIndex++;
      } else if (state.loopMode === 'all') {
        state.currentIndex = 0;
      }
    },
    
    previousTrack: (state) => {
      // If more than 3 seconds in, restart current track
      if (state.position > 3000) {
        state.position = 0;
        return;
      }
      
      if (state.currentIndex > 0) {
        state.currentIndex--;
      } else if (state.loopMode === 'all') {
        state.currentIndex = state.queue.length - 1;
      }
    },
    
    setIsPlaying: (state, action: PayloadAction<boolean>) => {
      state.isPlaying = action.payload;
    },
    
    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    
    setDuration: (state, action: PayloadAction<number>) => {
      state.duration = action.payload;
    },
    
    setPosition: (state, action: PayloadAction<number>) => {
      state.position = action.payload;
    },
    
    setBufferedPosition: (state, action: PayloadAction<number>) => {
      state.bufferedPosition = action.payload;
    },
    
    setPlaybackSpeed: (state, action: PayloadAction<PlaybackSpeed>) => {
      state.playbackSpeed = action.payload;
    },
    
    setLoopMode: (state, action: PayloadAction<LoopMode>) => {
      state.loopMode = action.payload;
    },
    
    toggleShuffle: (state) => {
      state.isShuffle = !state.isShuffle;
      
      if (state.isShuffle && state.queue.length > 1) {
        // Shuffle queue, keeping current track at current position
        const currentId = state.queue[state.currentIndex];
        const beforeCurrent = state.queue.slice(0, state.currentIndex);
        const afterCurrent = state.queue.slice(state.currentIndex + 1);
        const shuffled = shuffleArray([...beforeCurrent, ...afterCurrent]);
        state.queue = [
          ...shuffled.slice(0, state.currentIndex),
          currentId,
          ...shuffled.slice(state.currentIndex),
        ];
      } else {
        // Restore original order
        const currentId = state.queue[state.currentIndex];
        state.queue = [...state.originalQueue];
        state.currentIndex = state.queue.indexOf(currentId);
      }
    },
    
    setVolume: (state, action: PayloadAction<number>) => {
      state.volume = Math.max(0, Math.min(1, action.payload));
      state.isMuted = state.volume === 0;
    },
    
    toggleMute: (state) => {
      state.isMuted = !state.isMuted;
    },
    
    setShowMiniPlayer: (state, action: PayloadAction<boolean>) => {
      state.showMiniPlayer = action.payload;
    },
    
    setShowFullPlayer: (state, action: PayloadAction<boolean>) => {
      state.showFullPlayer = action.payload;
    },
    
    updatePlaybackStatus: (state, action: PayloadAction<AVPlaybackStatus>) => {
      if (action.payload.isLoaded) {
        state.isPlaying = action.payload.isPlaying;
        state.duration = action.payload.durationMillis || 0;
        state.position = action.payload.positionMillis || 0;
        state.bufferedPosition = action.payload.playableDurationMillis || 0;
        state.isLoading = action.payload.isBuffering;
      }
    },
  },
});

// Helper function to shuffle array
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export const {
  setCurrentTrack,
  setQueue,
  addToQueue,
  removeFromQueue,
  clearQueue,
  nextTrack,
  previousTrack,
  setIsPlaying,
  setIsLoading,
  setDuration,
  setPosition,
  setBufferedPosition,
  setPlaybackSpeed,
  setLoopMode,
  toggleShuffle,
  setVolume,
  toggleMute,
  setShowMiniPlayer,
  setShowFullPlayer,
  updatePlaybackStatus,
} = playbackSlice.actions;

// Selectors
export const selectCurrentQueueTrackId = (state: { playback: PlaybackState }): number | null => {
  const { queue, currentIndex } = state.playback;
  if (currentIndex >= 0 && currentIndex < queue.length) {
    return queue[currentIndex];
  }
  return null;
};

export const selectHasNextTrack = (state: { playback: PlaybackState }): boolean => {
  const { queue, currentIndex, loopMode } = state.playback;
  return currentIndex < queue.length - 1 || loopMode === 'all';
};

export const selectHasPreviousTrack = (state: { playback: PlaybackState }): boolean => {
  const { currentIndex, loopMode } = state.playback;
  return currentIndex > 0 || loopMode === 'all';
};

export default playbackSlice.reducer;
