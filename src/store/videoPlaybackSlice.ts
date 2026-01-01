// Video Playback Slice for Terra Media Player

import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { VideoFile } from '../types/media';
import { PlaybackSpeed, LoopMode } from '../types/playback';
import * as DatabaseService from '../services/DatabaseService';

interface VideoPlaybackState {
  // Current video info
  currentVideo: VideoFile | null;
  currentVideoId: number | null;
  
  // Playback state
  isPlaying: boolean;
  isLoading: boolean;
  duration: number;
  position: number;
  
  // Settings
  playbackSpeed: PlaybackSpeed;
  loopMode: LoopMode;
  volume: number;
  isMuted: boolean;
  
  // Display settings
  isFullscreen: boolean;
  brightness: number;
  showControls: boolean;
  aspectRatio: 'contain' | 'cover' | 'stretch';
  
  // Subtitles
  subtitlePath: string | null;
  subtitleDelay: number;
  
  // Resume playback
  resumePosition: number;
  showResumeModal: boolean;
}

const initialState: VideoPlaybackState = {
  currentVideo: null,
  currentVideoId: null,
  isPlaying: false,
  isLoading: false,
  duration: 0,
  position: 0,
  playbackSpeed: 1,
  loopMode: 'none',
  volume: 1,
  isMuted: false,
  isFullscreen: false,
  brightness: 1,
  showControls: true,
  aspectRatio: 'contain',
  subtitlePath: null,
  subtitleDelay: 0,
  resumePosition: 0,
  showResumeModal: false,
};

// Async thunks
export const updateVideoPlayCount = createAsyncThunk(
  'videoPlayback/updatePlayCount',
  async (id: number, { rejectWithValue }) => {
    try {
      await DatabaseService.updateVideoPlayCount(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const saveVideoPosition = createAsyncThunk(
  'videoPlayback/savePosition',
  async ({ id, position }: { id: number; position: number }, { rejectWithValue }) => {
    try {
      await DatabaseService.updateVideoWatchPosition(id, position);
      return { id, position };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const addVideoToHistory = createAsyncThunk(
  'videoPlayback/addToHistory',
  async (
    { filePath, position, duration }: { filePath: string; position: number; duration: number },
    { rejectWithValue }
  ) => {
    try {
      await DatabaseService.addToPlayHistory(filePath, 'video', position, duration);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const videoPlaybackSlice = createSlice({
  name: 'videoPlayback',
  initialState,
  reducers: {
    setCurrentVideo: (state, action: PayloadAction<VideoFile | null>) => {
      state.currentVideo = action.payload;
      state.currentVideoId = action.payload?.id || null;
      
      // Check if we should show resume modal
      if (action.payload && action.payload.lastWatchedPosition > 0) {
        state.resumePosition = action.payload.lastWatchedPosition;
        state.showResumeModal = true;
      } else {
        state.resumePosition = 0;
        state.showResumeModal = false;
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
    
    setPlaybackSpeed: (state, action: PayloadAction<PlaybackSpeed>) => {
      state.playbackSpeed = action.payload;
    },
    
    setLoopMode: (state, action: PayloadAction<LoopMode>) => {
      state.loopMode = action.payload;
    },
    
    setVolume: (state, action: PayloadAction<number>) => {
      state.volume = Math.max(0, Math.min(1, action.payload));
      state.isMuted = state.volume === 0;
    },
    
    toggleMute: (state) => {
      state.isMuted = !state.isMuted;
    },
    
    setIsFullscreen: (state, action: PayloadAction<boolean>) => {
      state.isFullscreen = action.payload;
    },
    
    toggleFullscreen: (state) => {
      state.isFullscreen = !state.isFullscreen;
    },
    
    setBrightness: (state, action: PayloadAction<number>) => {
      state.brightness = Math.max(0, Math.min(1, action.payload));
    },
    
    setShowControls: (state, action: PayloadAction<boolean>) => {
      state.showControls = action.payload;
    },
    
    toggleControls: (state) => {
      state.showControls = !state.showControls;
    },
    
    setAspectRatio: (state, action: PayloadAction<'contain' | 'cover' | 'stretch'>) => {
      state.aspectRatio = action.payload;
    },
    
    setSubtitlePath: (state, action: PayloadAction<string | null>) => {
      state.subtitlePath = action.payload;
    },
    
    setSubtitleDelay: (state, action: PayloadAction<number>) => {
      state.subtitleDelay = action.payload;
    },
    
    setShowResumeModal: (state, action: PayloadAction<boolean>) => {
      state.showResumeModal = action.payload;
    },
    
    clearResumePosition: (state) => {
      state.resumePosition = 0;
      state.showResumeModal = false;
    },
    
    resetVideoPlayback: (state) => {
      state.currentVideo = null;
      state.currentVideoId = null;
      state.isPlaying = false;
      state.duration = 0;
      state.position = 0;
      state.resumePosition = 0;
      state.showResumeModal = false;
    },
    
    seekForward: (state, action: PayloadAction<number>) => {
      const seekAmount = action.payload || 10000; // Default 10 seconds
      state.position = Math.min(state.position + seekAmount, state.duration);
    },
    
    seekBackward: (state, action: PayloadAction<number>) => {
      const seekAmount = action.payload || 10000; // Default 10 seconds
      state.position = Math.max(state.position - seekAmount, 0);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(saveVideoPosition.fulfilled, (state, action) => {
        if (state.currentVideo && state.currentVideo.id === action.payload.id) {
          state.currentVideo.lastWatchedPosition = action.payload.position;
        }
      });
  },
});

export const {
  setCurrentVideo,
  setIsPlaying,
  setIsLoading,
  setDuration,
  setPosition,
  setPlaybackSpeed,
  setLoopMode,
  setVolume,
  toggleMute,
  setIsFullscreen,
  toggleFullscreen,
  setBrightness,
  setShowControls,
  toggleControls,
  setAspectRatio,
  setSubtitlePath,
  setSubtitleDelay,
  setShowResumeModal,
  clearResumePosition,
  resetVideoPlayback,
  seekForward,
  seekBackward,
} = videoPlaybackSlice.actions;

export default videoPlaybackSlice.reducer;
