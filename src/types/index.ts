// Type exports for Terra Media Player

export * from './media';
export * from './playback';
export * from './settings';

// Navigation Types
export type RootStackParamList = {
  MainTabs: undefined;
  VideoPlayer: { videoId: number };
  PlaylistDetail: { playlistId: number };
  AlbumDetail: { albumName: string };
  ArtistDetail: { artistName: string };
  FolderView: { folderPath: string };
  Search: { type: 'audio' | 'video' };
};

export type MainTabParamList = {
  AudioLibrary: undefined;
  VideoLibrary: undefined;
  NowPlaying: undefined;
  Favorites: undefined;
  Settings: undefined;
};
