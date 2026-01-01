// Video Slice for Terra Media Player

import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { VideoFile, FolderStructure } from '../types/media';
import * as DatabaseService from '../services/DatabaseService';
import { getFolderPath, getFolderName } from '../utils/formatters';

export type VideoFilter = 'all' | 'folders' | 'recently_watched' | 'watched' | 'unwatched' | 'favorites' | 'short' | 'medium' | 'long';
export type VideoSortBy = 'file_name' | 'date_added' | 'file_size' | 'duration' | 'last_played';
export type SortOrder = 'asc' | 'desc';

interface VideoState {
  allVideos: VideoFile[];
  folders: FolderStructure[];
  selectedFolder: string | null;
  filter: VideoFilter;
  sortBy: VideoSortBy;
  sortOrder: SortOrder;
  searchQuery: string;
  searchResults: VideoFile[];
  isLoading: boolean;
  error: string | null;
}

const initialState: VideoState = {
  allVideos: [],
  folders: [],
  selectedFolder: null,
  filter: 'all',
  sortBy: 'file_name',
  sortOrder: 'asc',
  searchQuery: '',
  searchResults: [],
  isLoading: false,
  error: null,
};

// Async thunks
export const loadAllVideoFiles = createAsyncThunk(
  'video/loadAllVideoFiles',
  async (_, { rejectWithValue }) => {
    try {
      const videos = await DatabaseService.getAllVideoFiles();
      return videos;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const searchVideos = createAsyncThunk(
  'video/searchVideos',
  async (query: string, { rejectWithValue }) => {
    try {
      if (!query.trim()) return [];
      const results = await DatabaseService.searchVideoFiles(query);
      return results;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const toggleVideoFavorite = createAsyncThunk(
  'video/toggleVideoFavorite',
  async (id: number, { rejectWithValue }) => {
    try {
      const isFavorite = await DatabaseService.toggleVideoFavorite(id);
      return { id, isFavorite };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateWatchPosition = createAsyncThunk(
  'video/updateWatchPosition',
  async ({ id, position }: { id: number; position: number }, { rejectWithValue }) => {
    try {
      await DatabaseService.updateVideoWatchPosition(id, position);
      return { id, position };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Helper function to compute folder structure
const computeFolders = (videos: VideoFile[]): FolderStructure[] => {
  const folderMap = new Map<string, VideoFile[]>();
  
  videos.forEach(video => {
    const folderPath = video.folderPath || 'Unknown';
    if (!folderMap.has(folderPath)) {
      folderMap.set(folderPath, []);
    }
    folderMap.get(folderPath)!.push(video);
  });
  
  return Array.from(folderMap.entries()).map(([path, files]) => ({
    path,
    name: getFolderName(path),
    itemCount: files.length,
    subFolders: [],
    files,
  }));
};

// Helper to filter videos by duration category
const filterByDuration = (videos: VideoFile[], category: 'short' | 'medium' | 'long'): VideoFile[] => {
  const FIVE_MINUTES = 5 * 60 * 1000;
  const THIRTY_MINUTES = 30 * 60 * 1000;
  
  switch (category) {
    case 'short':
      return videos.filter(v => v.duration < FIVE_MINUTES);
    case 'medium':
      return videos.filter(v => v.duration >= FIVE_MINUTES && v.duration < THIRTY_MINUTES);
    case 'long':
      return videos.filter(v => v.duration >= THIRTY_MINUTES);
    default:
      return videos;
  }
};

const videoSlice = createSlice({
  name: 'video',
  initialState,
  reducers: {
    setFilter: (state, action: PayloadAction<VideoFilter>) => {
      state.filter = action.payload;
    },
    setSortBy: (state, action: PayloadAction<VideoSortBy>) => {
      state.sortBy = action.payload;
    },
    setSortOrder: (state, action: PayloadAction<SortOrder>) => {
      state.sortOrder = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setSelectedFolder: (state, action: PayloadAction<string | null>) => {
      state.selectedFolder = action.payload;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.searchQuery = '';
    },
    setVideoFiles: (state, action: PayloadAction<VideoFile[]>) => {
      state.allVideos = action.payload;
      state.folders = computeFolders(action.payload);
    },
    updateVideoFile: (state, action: PayloadAction<VideoFile>) => {
      const index = state.allVideos.findIndex(v => v.id === action.payload.id);
      if (index !== -1) {
        state.allVideos[index] = action.payload;
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Load all video files
      .addCase(loadAllVideoFiles.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadAllVideoFiles.fulfilled, (state, action) => {
        state.isLoading = false;
        state.allVideos = action.payload;
        state.folders = computeFolders(action.payload);
      })
      .addCase(loadAllVideoFiles.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Search
      .addCase(searchVideos.fulfilled, (state, action) => {
        state.searchResults = action.payload;
      })
      // Toggle favorite
      .addCase(toggleVideoFavorite.fulfilled, (state, action) => {
        const { id, isFavorite } = action.payload;
        const video = state.allVideos.find(v => v.id === id);
        if (video) {
          video.isFavorite = isFavorite;
        }
      })
      // Update watch position
      .addCase(updateWatchPosition.fulfilled, (state, action) => {
        const { id, position } = action.payload;
        const video = state.allVideos.find(v => v.id === id);
        if (video) {
          video.lastWatchedPosition = position;
        }
      });
  },
});

export const {
  setFilter,
  setSortBy,
  setSortOrder,
  setSearchQuery,
  setSelectedFolder,
  clearSearchResults,
  setVideoFiles,
  updateVideoFile,
  clearError,
} = videoSlice.actions;

// Selectors
export const selectFilteredVideos = (state: { video: VideoState }): VideoFile[] => {
  const { allVideos, filter, selectedFolder } = state.video;
  
  switch (filter) {
    case 'all':
      return allVideos;
    case 'folders':
      if (selectedFolder) {
        return allVideos.filter(v => v.folderPath === selectedFolder);
      }
      return allVideos;
    case 'recently_watched':
      return [...allVideos]
        .filter(v => v.lastPlayed !== null)
        .sort((a, b) => (b.lastPlayed || 0) - (a.lastPlayed || 0));
    case 'watched':
      return allVideos.filter(v => v.playCount > 0);
    case 'unwatched':
      return allVideos.filter(v => v.playCount === 0);
    case 'favorites':
      return allVideos.filter(v => v.isFavorite);
    case 'short':
    case 'medium':
    case 'long':
      return filterByDuration(allVideos, filter);
    default:
      return allVideos;
  }
};

export default videoSlice.reducer;
