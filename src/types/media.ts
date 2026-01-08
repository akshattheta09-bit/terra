// Media Types for Terra Media Player

export interface AudioFile {
  id: number;
  filePath: string;
  fileName: string;
  duration: number;
  title: string;
  artist: string;
  album: string;
  albumArt: string | null;
  genre: string;
  year: number | null;
  trackNumber: number | null;
  fileSize: number;
  dateAdded: number;
  lastPlayed: number | null;
  playCount: number;
  isFavorite: boolean;
  isHidden: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface VideoFile {
  id: number;
  filePath: string;
  fileName: string;
  title?: string;
  folderPath: string;
  duration: number;
  width: number | null;
  height: number | null;
  fileSize: number;
  dateAdded: number;
  lastPlayed: number | null;
  playCount: number;
  lastWatchedPosition: number;
  isFavorite: boolean;
  isHidden: boolean;
  createdAt: number;
  updatedAt: number;
  thumbnail?: string;
}

export interface Playlist {
  id: number;
  name: string;
  description: string;
  createdAt: number;
  updatedAt: number;
  coverColor: string;
  isSystem: boolean;
  trackCount?: number;
}

export interface PlaylistItem {
  id: number;
  playlistId: number;
  audioId: number;
  position: number;
  addedAt: number;
}

export interface PlayHistory {
  id: number;
  filePath: string;
  fileType: 'audio' | 'video';
  playPosition: number;
  totalDuration: number;
  playedAt: number;
}

export interface Album {
  name: string;
  artist: string;
  albumArt: string | null;
  trackCount: number;
  totalDuration: number;
  year: number | null;
  tracks: AudioFile[];
}

export interface Artist {
  name: string;
  albumCount: number;
  trackCount: number;
  albums: Album[];
}

export interface FolderStructure {
  path: string;
  name: string;
  itemCount: number;
  subFolders: FolderStructure[];
  files: (AudioFile | VideoFile)[];
}

export interface Genre {
  name: string;
  trackCount: number;
  tracks: AudioFile[];
}

// Supported file extensions
export const SUPPORTED_AUDIO_EXTENSIONS = [
  '.mp3', '.aac', '.m4a', '.flac', '.ogg', '.oga',
  '.wav', '.wma', '.amr', '.mid', '.midi', '.opus',
  '.dff', '.dsf', '.ape', '.mka'
];

export const SUPPORTED_VIDEO_EXTENSIONS = [
  '.mp4', '.m4v', '.mkv', '.avi', '.mov', '.flv',
  '.wmv', '.webm', '.3gp', '.3g2', '.ts', '.m2ts',
  '.mts', '.asf', '.ogv', '.h265', '.hevc', '.vp9'
];

export type MediaType = 'audio' | 'video';

export interface ScanProgress {
  currentPath: string;
  scannedFiles: number;
  totalFiles: number;
  audioFiles: number;
  videoFiles: number;
}
