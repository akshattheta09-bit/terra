// Store exports for Terra Media Player

export { store, type RootState, type AppDispatch } from './store';

// Audio slice exports
export {
  default as audioReducer,
  loadAllAudioFiles,
  loadPlaylists,
  searchAudio,
  toggleFavorite,
  createNewPlaylist,
  addTrackToPlaylist,
  removeTrackFromPlaylist,
  deletePlaylist,
  setFilter as setAudioFilter,
  setSortBy as setAudioSortBy,
  setSortOrder as setAudioSortOrder,
  setSearchQuery as setAudioSearchQuery,
  setSelectedPlaylist,
  setSelectedAlbum,
  setSelectedArtist,
  clearSearchResults as clearAudioSearchResults,
  setAudioFiles,
  updateAudioFile,
} from './audioSlice';

// Video slice exports
export {
  default as videoReducer,
  loadAllVideoFiles,
  searchVideos,
  toggleVideoFavorite,
  updateWatchPosition,
  setFilter as setVideoFilter,
  setSortBy as setVideoSortBy,
  setSortOrder as setVideoSortOrder,
  setSearchQuery as setVideoSearchQuery,
  setSelectedFolder,
  clearSearchResults as clearVideoSearchResults,
  setVideoFiles,
  updateVideoFile,
  selectFilteredVideos,
} from './videoSlice';

// Playback slice exports
export {
  default as playbackReducer,
  setCurrentTrack,
  setQueue,
  addToQueue,
  removeFromQueue,
  clearQueue,
  nextTrack,
  previousTrack,
  setIsPlaying,
  setIsLoading as setPlaybackLoading,
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
  updatePlayCount,
  addToHistory,
  selectCurrentQueueTrackId,
  selectHasNextTrack,
  selectHasPreviousTrack,
} from './playbackSlice';

// Video playback slice exports
export {
  default as videoPlaybackReducer,
  setCurrentVideo,
  setCurrentVideo as setVideoCurrentVideo,
  setIsPlaying as setVideoIsPlaying,
  setIsLoading as setVideoLoading,
  setDuration as setVideoDuration,
  setPosition as setVideoPosition,
  setPlaybackSpeed as setVideoPlaybackSpeed,
  setLoopMode as setVideoLoopMode,
  setVolume as setVideoVolume,
  toggleMute as toggleVideoMute,
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
  updateVideoPlayCount,
  saveVideoPosition,
  saveVideoPosition as updateVideoProgress,
  addVideoToHistory,
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
  setBufferedPosition as setVideoBufferedPosition,
  // Selectors
  selectCurrentVideoInQueue,
  selectVideoQueue,
  selectVideoQueueIndex,
  selectHasNextVideo,
  selectHasPreviousVideo,
  selectIsVideoShuffled,
  selectVideoLoopMode,
  selectIsBackgroundPlayEnabled,
} from './videoPlaybackSlice';

// UI slice exports
export {
  default as uiReducer,
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
} from './uiSlice';

// Settings slice exports
export {
  default as settingsReducer,
  loadSettings,
  saveSettings,
  resetSettings,
  updateAudioSettings,
  updateVideoSettings,
  updateLibrarySettings,
  updateAppearanceSettings,
  addExcludedFolder,
  removeExcludedFolder,
} from './settingsSlice';

// Re-export settings actions with different names for screen compatibility
export { updateLibrarySettings as updateSettings } from './settingsSlice';
export { updateAppearanceSettings as setTheme } from './settingsSlice';
