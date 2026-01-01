// Settings Types for Terra Media Player

export interface AudioSettings {
  defaultPlaybackSpeed: number;
  defaultShuffleMode: boolean;
  defaultLoopMode: 'none' | 'all' | 'one';
  resumePlaybackOnOpen: boolean;
  showAlbumArt: boolean;
  equalizerPreset: EqualizerPreset;
  gaplessPlayback: boolean;
}

export interface VideoSettings {
  defaultPlaybackSpeed: number;
  defaultLoopMode: 'none' | 'all' | 'one';
  resumePlaybackOnOpen: boolean;
  autoRotateScreen: boolean;
  defaultSubtitleLanguage: string;
  subtitleFontSize: 'small' | 'medium' | 'large';
  subtitleColor: SubtitleColor;
  defaultBrightness: number;
  swipeGesturesEnabled: boolean;
  doubleTapToSeek: boolean;
  seekDuration: number;
}

export interface LibrarySettings {
  autoScanOnLaunch: boolean;
  includeHiddenFiles: boolean;
  showHiddenFiles: boolean;
  excludedFolders: string[];
  defaultSortBy: 'name' | 'date' | 'size' | 'duration';
  defaultSortOrder: 'asc' | 'desc';
  minimumFileSizeMB: number;
  scanSubfolders: boolean;
}

export interface AppearanceSettings {
  colorScheme: ColorScheme;
  fontSize: 'small' | 'medium' | 'large';
  listViewMode: 'compact' | 'normal' | 'detailed';
  showMiniPlayer: boolean;
  animationsEnabled: boolean;
}

export type ColorScheme = 'light' | 'dark' | 'auto' | 'blue_white' | 'dark_minimalist' | 'premium_dark' | 'high_contrast';

export type EqualizerPreset = 
  | 'normal'
  | 'bass_boost'
  | 'treble_boost'
  | 'pop'
  | 'rock'
  | 'jazz'
  | 'classical'
  | 'metal'
  | 'custom';

export type SubtitleColor = 'white' | 'yellow' | 'red' | 'green' | 'blue' | 'cyan';

export interface Settings {
  audio: AudioSettings;
  video: VideoSettings;
  library: LibrarySettings;
  appearance: AppearanceSettings;
}

export const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
  defaultPlaybackSpeed: 1,
  defaultShuffleMode: false,
  defaultLoopMode: 'none',
  resumePlaybackOnOpen: true,
  showAlbumArt: true,
  equalizerPreset: 'normal',
  gaplessPlayback: true,
};

export const DEFAULT_VIDEO_SETTINGS: VideoSettings = {
  defaultPlaybackSpeed: 1,
  defaultLoopMode: 'none',
  resumePlaybackOnOpen: true,
  autoRotateScreen: true,
  defaultSubtitleLanguage: 'en',
  subtitleFontSize: 'medium',
  subtitleColor: 'white',
  defaultBrightness: -1, // -1 means system default
  swipeGesturesEnabled: true,
  doubleTapToSeek: true,
  seekDuration: 10,
};

export const DEFAULT_LIBRARY_SETTINGS: LibrarySettings = {
  autoScanOnLaunch: true,
  includeHiddenFiles: false,
  showHiddenFiles: false,
  excludedFolders: [],
  defaultSortBy: 'name',
  defaultSortOrder: 'asc',
  minimumFileSizeMB: 0,
  scanSubfolders: true,
};

export const DEFAULT_APPEARANCE_SETTINGS: AppearanceSettings = {
  colorScheme: 'premium_dark',
  fontSize: 'medium',
  listViewMode: 'normal',
  showMiniPlayer: true,
  animationsEnabled: true,
};

export const DEFAULT_SETTINGS: Settings = {
  audio: DEFAULT_AUDIO_SETTINGS,
  video: DEFAULT_VIDEO_SETTINGS,
  library: DEFAULT_LIBRARY_SETTINGS,
  appearance: DEFAULT_APPEARANCE_SETTINGS,
};
