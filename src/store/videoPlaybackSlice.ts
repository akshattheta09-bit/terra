// Video Playback Slice for Terra Media Player
// Premium Features: Queue Management, Shuffle, Loop Modes, Background Play

import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { VideoFile } from '../types/media';
import { PlaybackSpeed, LoopMode } from '../types/playback';
import * as DatabaseService from '../services/DatabaseService';

interface VideoPlaybackState {
  // Current video info
  currentVideo: VideoFile | null;
  currentVideoId: number | null;
  
  // Queue management
  queue: VideoFile[];
  originalQueue: VideoFile[]; // For un-shuffling
  currentIndex: number;
  isShuffled: boolean;
  
  // Playback state
  isPlaying: boolean;
  isLoading: boolean;
  duration: number;
  position: number;
  bufferedPosition: number;
  
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
  
  // Background playback
  isBackgroundPlayEnabled: boolean;
  lastBackgroundTime: number | null;
}

const initialState: VideoPlaybackState = {
  currentVideo: null,
  currentVideoId: null,
  queue: [],
  originalQueue: [],
  currentIndex: -1,
  isShuffled: false,
  isPlaying: false,
  isLoading: false,
  duration: 0,
  position: 0,
  bufferedPosition: 0,
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
  isBackgroundPlayEnabled: true,
  lastBackgroundTime: null,
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
      state.queue = [];
      state.originalQueue = [];
      state.currentIndex = -1;
      state.isShuffled = false;
    },
    
    seekForward: (state, action: PayloadAction<number>) => {
      const seekAmount = action.payload || 10000; // Default 10 seconds
      state.position = Math.min(state.position + seekAmount, state.duration);
    },
    
    seekBackward: (state, action: PayloadAction<number>) => {
      const seekAmount = action.payload || 10000; // Default 10 seconds
      state.position = Math.max(state.position - seekAmount, 0);
    },
    
    // Queue Management
    setVideoQueue: (state, action: PayloadAction<{ videos: VideoFile[]; startIndex?: number }>) => {
      const { videos, startIndex = 0 } = action.payload;
      state.queue = [...videos];
      state.originalQueue = [...videos];
      state.currentIndex = Math.max(0, Math.min(startIndex, videos.length - 1));
      state.isShuffled = false;
      
      if (videos.length > 0 && state.currentIndex >= 0) {
        state.currentVideo = videos[state.currentIndex];
        state.currentVideoId = videos[state.currentIndex].id;
      }
    },
    
    addToVideoQueue: (state, action: PayloadAction<VideoFile>) => {
      state.queue.push(action.payload);
      state.originalQueue.push(action.payload);
    },
    
    removeFromVideoQueue: (state, action: PayloadAction<number>) => {
      const index = action.payload;
      if (index >= 0 && index < state.queue.length) {
        const removed = state.queue[index];
        state.queue.splice(index, 1);
        
        // Also remove from original queue
        const origIdx = state.originalQueue.findIndex(v => v.id === removed.id);
        if (origIdx >= 0) {
          state.originalQueue.splice(origIdx, 1);
        }
        
        // Adjust current index
        if (index < state.currentIndex) {
          state.currentIndex--;
        } else if (index === state.currentIndex && state.currentIndex >= state.queue.length) {
          state.currentIndex = Math.max(0, state.queue.length - 1);
        }
      }
    },
    
    clearVideoQueue: (state) => {
      state.queue = [];
      state.originalQueue = [];
      state.currentIndex = -1;
      state.isShuffled = false;
    },
    
    nextVideoInQueue: (state) => {
      if (state.queue.length === 0) return;
      
      if (state.loopMode === 'one') {
        // Stay on current, just reset position
        state.position = 0;
        return;
      }
      
      let newIndex = state.currentIndex + 1;
      
      if (newIndex >= state.queue.length) {
        if (state.loopMode === 'all') {
          newIndex = 0;
        } else {
          return; // End of queue
        }
      }
      
      state.currentIndex = newIndex;
      state.currentVideo = state.queue[newIndex];
      state.currentVideoId = state.queue[newIndex].id;
      state.position = 0;
      state.isLoading = true;
    },
    
    previousVideoInQueue: (state) => {
      if (state.queue.length === 0) return;
      
      // If more than 3 seconds in, just restart
      if (state.position > 3000) {
        state.position = 0;
        return;
      }
      
      if (state.loopMode === 'one') {
        state.position = 0;
        return;
      }
      
      let newIndex = state.currentIndex - 1;
      
      if (newIndex < 0) {
        if (state.loopMode === 'all') {
          newIndex = state.queue.length - 1;
        } else {
          state.position = 0;
          return;
        }
      }
      
      state.currentIndex = newIndex;
      state.currentVideo = state.queue[newIndex];
      state.currentVideoId = state.queue[newIndex].id;
      state.position = 0;
      state.isLoading = true;
    },
    
    jumpToVideoIndex: (state, action: PayloadAction<number>) => {
      const index = action.payload;
      if (index >= 0 && index < state.queue.length) {
        state.currentIndex = index;
        state.currentVideo = state.queue[index];
        state.currentVideoId = state.queue[index].id;
        state.position = 0;
        state.isLoading = true;
      }
    },
    
    toggleVideoShuffle: (state) => {
      state.isShuffled = !state.isShuffled;
      
      if (state.isShuffled) {
        // Save current video
        const currentVideo = state.currentVideo;
        
        // Shuffle using Fisher-Yates
        const shuffled = [...state.queue];
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
        
        state.queue = shuffled;
        state.currentIndex = 0;
      } else {
        // Restore original order
        const currentVideo = state.currentVideo;
        state.queue = [...state.originalQueue];
        
        if (currentVideo) {
          const newIdx = state.queue.findIndex(v => v.id === currentVideo.id);
          state.currentIndex = newIdx >= 0 ? newIdx : 0;
        }
      }
    },
    
    setBackgroundPlayEnabled: (state, action: PayloadAction<boolean>) => {
      state.isBackgroundPlayEnabled = action.payload;
    },
    
    setLastBackgroundTime: (state, action: PayloadAction<number | null>) => {
      state.lastBackgroundTime = action.payload;
    },
    
    setBufferedPosition: (state, action: PayloadAction<number>) => {
      state.bufferedPosition = action.payload;
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
  // Queue management
  setVideoQueue,
  addToVideoQueue,
  removeFromVideoQueue,
  clearVideoQueue,
  nextVideoInQueue,
  previousVideoInQueue,
  jumpToVideoIndex,
  toggleVideoShuffle,
  // Background play
  setBackgroundPlayEnabled,
  setLastBackgroundTime,
  setBufferedPosition,
} = videoPlaybackSlice.actions;

// Selectors
export const selectCurrentVideoInQueue = (state: { videoPlayback: VideoPlaybackState }) =>
  state.videoPlayback.currentVideo;

export const selectVideoQueue = (state: { videoPlayback: VideoPlaybackState }) =>
  state.videoPlayback.queue;

export const selectVideoQueueIndex = (state: { videoPlayback: VideoPlaybackState }) =>
  state.videoPlayback.currentIndex;

export const selectHasNextVideo = (state: { videoPlayback: VideoPlaybackState }) => {
  const { queue, currentIndex, loopMode } = state.videoPlayback;
  if (loopMode === 'all' || loopMode === 'one') return queue.length > 0;
  return currentIndex < queue.length - 1;
};

export const selectHasPreviousVideo = (state: { videoPlayback: VideoPlaybackState }) => {
  const { queue, currentIndex, loopMode } = state.videoPlayback;
  if (loopMode === 'all' || loopMode === 'one') return queue.length > 0;
  return currentIndex > 0;
};

export const selectIsVideoShuffled = (state: { videoPlayback: VideoPlaybackState }) =>
  state.videoPlayback.isShuffled;

export const selectVideoLoopMode = (state: { videoPlayback: VideoPlaybackState }) =>
  state.videoPlayback.loopMode;

export const selectIsBackgroundPlayEnabled = (state: { videoPlayback: VideoPlaybackState }) =>
  state.videoPlayback.isBackgroundPlayEnabled;

export default videoPlaybackSlice.reducer;
