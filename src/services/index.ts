// Services exports for Terra Media Player

export { 
  DatabaseService, 
  initDatabase,
  getAllAudioFiles,
  getAllVideoFiles,
  toggleAudioFavorite,
  toggleVideoFavorite,
  getPlaylistTracks,
  getAllPlaylists,
  createPlaylist,
  deletePlaylist,
  addToPlaylist,
  removeFromPlaylist,
  updateAudioPlayCount,
  updateVideoPlayCount,
  updateVideoWatchPosition,
  searchAudioFiles,
  searchVideoFiles,
  addToPlayHistory,
  getPlayHistory,
  clearPlayHistory,
} from './DatabaseService';
export { PermissionService } from './PermissionService';
export { MediaScannerService } from './MediaScannerService';
export { 
  AudioPlaybackService,
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
} from './AudioPlaybackService';

// Video Playback Service - direct exports to avoid namespace issues
export {
  configureVideoAudioMode,
  initializeVideoService,
  cleanupVideoService,
  setVideoQueue,
  getCurrentVideo,
  nextVideo,
  previousVideo,
  jumpToIndex,
  setLoopMode as setVideoServiceLoopMode,
  getQueueState,
  setVideoChangeCallback,
  setRemoteControlCallback,
  handleRemoteControlEvent,
} from './VideoPlaybackService';

// Thumbnail Service - direct exports
export {
  ensureThumbnailDirectory,
  getThumbnailPath,
  getThumbnailPathFromUri,
  generateThumbnail,
  generateThumbnailAtPercent,
  thumbnailExists,
  getThumbnailUri,
  ensureThumbnail,
  generateThumbnailsBatch,
  generateMissingThumbnails,
  deleteThumbnail,
  clearAllThumbnails,
  getThumbnailCacheSize,
  cleanupOrphanedThumbnails,
} from './ThumbnailService';

