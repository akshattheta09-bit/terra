// UI Slice for Terra Media Player

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ScanProgress } from '../types/media';

interface UIState {
  // Scanning state
  isScanning: boolean;
  scanProgress: ScanProgress | null;
  lastScanTime: number | null;
  
  // Tab state
  currentTab: number;
  
  // Theme
  isDarkMode: boolean;
  colorScheme: string;
  
  // Modals
  showPermissionModal: boolean;
  showCreatePlaylistModal: boolean;
  showAddToPlaylistModal: boolean;
  selectedAudioForPlaylist: number | null;
  
  // Toasts/Notifications
  toastMessage: string | null;
  toastType: 'success' | 'error' | 'info' | 'warning' | null;
  
  // Loading states
  isInitializing: boolean;
  isRefreshing: boolean;
  
  // Search
  isSearchActive: boolean;
  searchType: 'audio' | 'video' | null;
}

const initialState: UIState = {
  isScanning: false,
  scanProgress: null,
  lastScanTime: null,
  currentTab: 0,
  isDarkMode: true,
  colorScheme: 'premium_dark',
  showPermissionModal: false,
  showCreatePlaylistModal: false,
  showAddToPlaylistModal: false,
  selectedAudioForPlaylist: null,
  toastMessage: null,
  toastType: null,
  isInitializing: true,
  isRefreshing: false,
  isSearchActive: false,
  searchType: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setIsScanning: (state, action: PayloadAction<boolean>) => {
      state.isScanning = action.payload;
      if (!action.payload) {
        state.scanProgress = null;
      }
    },
    
    setScanProgress: (state, action: PayloadAction<ScanProgress | null>) => {
      state.scanProgress = action.payload;
    },
    
    setLastScanTime: (state, action: PayloadAction<number>) => {
      state.lastScanTime = action.payload;
    },
    
    setCurrentTab: (state, action: PayloadAction<number>) => {
      state.currentTab = action.payload;
    },
    
    setIsDarkMode: (state, action: PayloadAction<boolean>) => {
      state.isDarkMode = action.payload;
    },
    
    setColorScheme: (state, action: PayloadAction<string>) => {
      state.colorScheme = action.payload;
    },
    
    setShowPermissionModal: (state, action: PayloadAction<boolean>) => {
      state.showPermissionModal = action.payload;
    },
    
    setShowCreatePlaylistModal: (state, action: PayloadAction<boolean>) => {
      state.showCreatePlaylistModal = action.payload;
    },
    
    setShowAddToPlaylistModal: (state, action: PayloadAction<boolean>) => {
      state.showAddToPlaylistModal = action.payload;
    },
    
    setSelectedAudioForPlaylist: (state, action: PayloadAction<number | null>) => {
      state.selectedAudioForPlaylist = action.payload;
    },
    
    showToast: (state, action: PayloadAction<{ message: string; type: 'success' | 'error' | 'info' | 'warning' }>) => {
      state.toastMessage = action.payload.message;
      state.toastType = action.payload.type;
    },
    
    hideToast: (state) => {
      state.toastMessage = null;
      state.toastType = null;
    },
    
    setIsInitializing: (state, action: PayloadAction<boolean>) => {
      state.isInitializing = action.payload;
    },
    
    setIsRefreshing: (state, action: PayloadAction<boolean>) => {
      state.isRefreshing = action.payload;
    },
    
    setIsSearchActive: (state, action: PayloadAction<boolean>) => {
      state.isSearchActive = action.payload;
      if (!action.payload) {
        state.searchType = null;
      }
    },
    
    setSearchType: (state, action: PayloadAction<'audio' | 'video' | null>) => {
      state.searchType = action.payload;
    },
    
    openAddToPlaylistModal: (state, action: PayloadAction<number>) => {
      state.selectedAudioForPlaylist = action.payload;
      state.showAddToPlaylistModal = true;
    },
    
    closeAddToPlaylistModal: (state) => {
      state.selectedAudioForPlaylist = null;
      state.showAddToPlaylistModal = false;
    },
  },
});

export const {
  setIsScanning,
  setScanProgress,
  setLastScanTime,
  setCurrentTab,
  setIsDarkMode,
  setColorScheme,
  setShowPermissionModal,
  setShowCreatePlaylistModal,
  setShowAddToPlaylistModal,
  setSelectedAudioForPlaylist,
  showToast,
  hideToast,
  setIsInitializing,
  setIsRefreshing,
  setIsSearchActive,
  setSearchType,
  openAddToPlaylistModal,
  closeAddToPlaylistModal,
} = uiSlice.actions;

export default uiSlice.reducer;
