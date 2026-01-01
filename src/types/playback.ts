// Playback Types for Terra Media Player

export type PlaybackSpeed = 0.5 | 0.75 | 1 | 1.25 | 1.5 | 2;

export type LoopMode = 'none' | 'all' | 'one';

export interface PlaybackState {
  isPlaying: boolean;
  isLoading: boolean;
  duration: number;
  position: number;
  bufferedPosition: number;
  playbackSpeed: PlaybackSpeed;
  loopMode: LoopMode;
  isShuffle: boolean;
  volume: number;
  isMuted: boolean;
}

export interface AudioPlaybackState extends PlaybackState {
  currentTrackId: number | null;
  queue: number[];
  originalQueue: number[];
  currentIndex: number;
}

export interface VideoPlaybackState extends PlaybackState {
  currentVideoId: number | null;
  isFullscreen: boolean;
  brightness: number;
  showControls: boolean;
  subtitlePath: string | null;
  subtitleDelay: number;
  aspectRatio: 'contain' | 'cover' | 'stretch';
}

export interface PlaybackControls {
  play: () => Promise<void>;
  pause: () => Promise<void>;
  stop: () => Promise<void>;
  seekTo: (position: number) => Promise<void>;
  seekForward: (seconds?: number) => Promise<void>;
  seekBackward: (seconds?: number) => Promise<void>;
  setPlaybackSpeed: (speed: PlaybackSpeed) => void;
  setLoopMode: (mode: LoopMode) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
}

export interface AudioControls extends PlaybackControls {
  playTrack: (trackId: number) => Promise<void>;
  playQueue: (trackIds: number[], startIndex?: number) => Promise<void>;
  addToQueue: (trackId: number) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  nextTrack: () => Promise<void>;
  previousTrack: () => Promise<void>;
  toggleShuffle: () => void;
  shuffleQueue: () => void;
}

export interface VideoControls extends PlaybackControls {
  playVideo: (videoId: number) => Promise<void>;
  toggleFullscreen: () => void;
  setBrightness: (brightness: number) => void;
  loadSubtitle: (path: string) => Promise<void>;
  setSubtitleDelay: (delay: number) => void;
  setAspectRatio: (ratio: 'contain' | 'cover' | 'stretch') => void;
}

export interface Subtitle {
  id: number;
  startTime: number;
  endTime: number;
  text: string;
}

export interface GestureState {
  isSeekingBrightness: boolean;
  isSeekingVolume: boolean;
  isSeekingPosition: boolean;
  seekPreview: number;
}

export const PLAYBACK_SPEEDS: PlaybackSpeed[] = [0.5, 0.75, 1, 1.25, 1.5, 2];
