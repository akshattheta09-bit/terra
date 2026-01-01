// Settings Slice for Terra Media Player

import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Settings,
  AudioSettings,
  VideoSettings,
  LibrarySettings,
  AppearanceSettings,
  DEFAULT_SETTINGS,
} from '../types/settings';
import { STORAGE_KEYS } from '../utils/constants';

interface SettingsState {
  settings: Settings;
  isLoading: boolean;
  error: string | null;
}

const initialState: SettingsState = {
  settings: DEFAULT_SETTINGS,
  isLoading: false,
  error: null,
};

// Async thunks
export const loadSettings = createAsyncThunk(
  'settings/loadSettings',
  async (_, { rejectWithValue }) => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge with defaults to ensure all keys exist
        return {
          audio: { ...DEFAULT_SETTINGS.audio, ...parsed.audio },
          video: { ...DEFAULT_SETTINGS.video, ...parsed.video },
          library: { ...DEFAULT_SETTINGS.library, ...parsed.library },
          appearance: { ...DEFAULT_SETTINGS.appearance, ...parsed.appearance },
        } as Settings;
      }
      return DEFAULT_SETTINGS;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const saveSettings = createAsyncThunk(
  'settings/saveSettings',
  async (settings: Settings, { rejectWithValue }) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
      return settings;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const resetSettings = createAsyncThunk(
  'settings/resetSettings',
  async (_, { rejectWithValue }) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
      return DEFAULT_SETTINGS;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    updateAudioSettings: (state, action: PayloadAction<Partial<AudioSettings>>) => {
      state.settings.audio = { ...state.settings.audio, ...action.payload };
    },
    
    updateVideoSettings: (state, action: PayloadAction<Partial<VideoSettings>>) => {
      state.settings.video = { ...state.settings.video, ...action.payload };
    },
    
    updateLibrarySettings: (state, action: PayloadAction<Partial<LibrarySettings>>) => {
      state.settings.library = { ...state.settings.library, ...action.payload };
    },
    
    updateAppearanceSettings: (state, action: PayloadAction<Partial<AppearanceSettings>>) => {
      state.settings.appearance = { ...state.settings.appearance, ...action.payload };
    },
    
    addExcludedFolder: (state, action: PayloadAction<string>) => {
      if (!state.settings.library.excludedFolders.includes(action.payload)) {
        state.settings.library.excludedFolders.push(action.payload);
      }
    },
    
    removeExcludedFolder: (state, action: PayloadAction<string>) => {
      state.settings.library.excludedFolders = state.settings.library.excludedFolders.filter(
        folder => folder !== action.payload
      );
    },
    
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Load settings
      .addCase(loadSettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.settings = action.payload;
      })
      .addCase(loadSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Save settings
      .addCase(saveSettings.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(saveSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.settings = action.payload;
      })
      .addCase(saveSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Reset settings
      .addCase(resetSettings.fulfilled, (state) => {
        state.settings = DEFAULT_SETTINGS;
      });
  },
});

export const {
  updateAudioSettings,
  updateVideoSettings,
  updateLibrarySettings,
  updateAppearanceSettings,
  addExcludedFolder,
  removeExcludedFolder,
  clearError,
} = settingsSlice.actions;

export default settingsSlice.reducer;
