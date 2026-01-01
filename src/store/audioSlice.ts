// Audio Slice for Terra Media Player

import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { AudioFile, Album, Artist, Playlist, Genre } from '../types/media';
import * as DatabaseService from '../services/DatabaseService';

export type AudioFilter = 'all' | 'albums' | 'artists' | 'playlists' | 'recently_played' | 'most_played' | 'genres' | 'folders';
export type AudioSortBy = 'title' | 'artist' | 'album' | 'date_added' | 'play_count' | 'duration';
export type SortOrder = 'asc' | 'desc';

interface AudioState {
  allSongs: AudioFile[];
  albums: Album[];
  artists: Artist[];
  playlists: Playlist[];
  genres: Genre[];
  selectedPlaylist: Playlist | null;
  selectedAlbum: Album | null;
  selectedArtist: Artist | null;
  filter: AudioFilter;
  sortBy: AudioSortBy;
  sortOrder: SortOrder;
  searchQuery: string;
  searchResults: AudioFile[];
  isLoading: boolean;
  error: string | null;
}

const initialState: AudioState = {
  allSongs: [],
  albums: [],
  artists: [],
  playlists: [],
  genres: [],
  selectedPlaylist: null,
  selectedAlbum: null,
  selectedArtist: null,
  filter: 'all',
  sortBy: 'title',
  sortOrder: 'asc',
  searchQuery: '',
  searchResults: [],
  isLoading: false,
  error: null,
};

// Async thunks
export const loadAllAudioFiles = createAsyncThunk(
  'audio/loadAllAudioFiles',
  async (_, { rejectWithValue }) => {
    try {
      const songs = await DatabaseService.getAllAudioFiles();
      return songs;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const loadPlaylists = createAsyncThunk(
  'audio/loadPlaylists',
  async (_, { rejectWithValue }) => {
    try {
      const playlists = await DatabaseService.getAllPlaylists();
      return playlists;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const searchAudio = createAsyncThunk(
  'audio/searchAudio',
  async (query: string, { rejectWithValue }) => {
    try {
      if (!query.trim()) return [];
      const results = await DatabaseService.searchAudioFiles(query);
      return results;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const toggleFavorite = createAsyncThunk(
  'audio/toggleFavorite',
  async (id: number, { rejectWithValue }) => {
    try {
      const isFavorite = await DatabaseService.toggleAudioFavorite(id);
      return { id, isFavorite };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createNewPlaylist = createAsyncThunk(
  'audio/createNewPlaylist',
  async (
    { name, description, coverColor }: { name: string; description?: string; coverColor?: string },
    { rejectWithValue }
  ) => {
    try {
      const id = await DatabaseService.createPlaylist(name, description, coverColor);
      const playlist = await DatabaseService.getPlaylistById(id);
      return playlist;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const addTrackToPlaylist = createAsyncThunk(
  'audio/addTrackToPlaylist',
  async ({ playlistId, audioId }: { playlistId: number; audioId: number }, { rejectWithValue }) => {
    try {
      await DatabaseService.addToPlaylist(playlistId, audioId);
      return { playlistId, audioId };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const removeTrackFromPlaylist = createAsyncThunk(
  'audio/removeTrackFromPlaylist',
  async ({ playlistId, audioId }: { playlistId: number; audioId: number }, { rejectWithValue }) => {
    try {
      await DatabaseService.removeFromPlaylist(playlistId, audioId);
      return { playlistId, audioId };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deletePlaylist = createAsyncThunk(
  'audio/deletePlaylist',
  async (playlistId: number, { rejectWithValue }) => {
    try {
      await DatabaseService.deletePlaylist(playlistId);
      return playlistId;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Helper functions to compute albums, artists, genres from songs
const computeAlbums = (songs: AudioFile[]): Album[] => {
  const albumMap = new Map<string, AudioFile[]>();
  
  songs.forEach(song => {
    const albumName = song.album || 'Unknown Album';
    if (!albumMap.has(albumName)) {
      albumMap.set(albumName, []);
    }
    albumMap.get(albumName)!.push(song);
  });
  
  return Array.from(albumMap.entries()).map(([name, tracks]) => ({
    name,
    artist: tracks[0]?.artist || 'Unknown Artist',
    albumArt: tracks[0]?.albumArt || null,
    trackCount: tracks.length,
    totalDuration: tracks.reduce((sum, t) => sum + (t.duration || 0), 0),
    year: tracks[0]?.year || null,
    tracks,
  }));
};

const computeArtists = (songs: AudioFile[]): Artist[] => {
  const artistMap = new Map<string, AudioFile[]>();
  
  songs.forEach(song => {
    const artistName = song.artist || 'Unknown Artist';
    if (!artistMap.has(artistName)) {
      artistMap.set(artistName, []);
    }
    artistMap.get(artistName)!.push(song);
  });
  
  return Array.from(artistMap.entries()).map(([name, tracks]) => {
    const albums = computeAlbums(tracks);
    return {
      name,
      albumCount: albums.length,
      trackCount: tracks.length,
      albums,
    };
  });
};

const computeGenres = (songs: AudioFile[]): Genre[] => {
  const genreMap = new Map<string, AudioFile[]>();
  
  songs.forEach(song => {
    const genreName = song.genre || 'Unknown Genre';
    if (!genreMap.has(genreName)) {
      genreMap.set(genreName, []);
    }
    genreMap.get(genreName)!.push(song);
  });
  
  return Array.from(genreMap.entries()).map(([name, tracks]) => ({
    name,
    trackCount: tracks.length,
    tracks,
  }));
};

const audioSlice = createSlice({
  name: 'audio',
  initialState,
  reducers: {
    setFilter: (state, action: PayloadAction<AudioFilter>) => {
      state.filter = action.payload;
    },
    setSortBy: (state, action: PayloadAction<AudioSortBy>) => {
      state.sortBy = action.payload;
    },
    setSortOrder: (state, action: PayloadAction<SortOrder>) => {
      state.sortOrder = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setSelectedPlaylist: (state, action: PayloadAction<Playlist | null>) => {
      state.selectedPlaylist = action.payload;
    },
    setSelectedAlbum: (state, action: PayloadAction<Album | null>) => {
      state.selectedAlbum = action.payload;
    },
    setSelectedArtist: (state, action: PayloadAction<Artist | null>) => {
      state.selectedArtist = action.payload;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.searchQuery = '';
    },
    setAudioFiles: (state, action: PayloadAction<AudioFile[]>) => {
      state.allSongs = action.payload;
      state.albums = computeAlbums(action.payload);
      state.artists = computeArtists(action.payload);
      state.genres = computeGenres(action.payload);
    },
    updateAudioFile: (state, action: PayloadAction<AudioFile>) => {
      const index = state.allSongs.findIndex(s => s.id === action.payload.id);
      if (index !== -1) {
        state.allSongs[index] = action.payload;
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Load all audio files
      .addCase(loadAllAudioFiles.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadAllAudioFiles.fulfilled, (state, action) => {
        state.isLoading = false;
        state.allSongs = action.payload;
        state.albums = computeAlbums(action.payload);
        state.artists = computeArtists(action.payload);
        state.genres = computeGenres(action.payload);
      })
      .addCase(loadAllAudioFiles.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Load playlists
      .addCase(loadPlaylists.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadPlaylists.fulfilled, (state, action) => {
        state.isLoading = false;
        state.playlists = action.payload;
      })
      .addCase(loadPlaylists.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Search
      .addCase(searchAudio.fulfilled, (state, action) => {
        state.searchResults = action.payload;
      })
      // Toggle favorite
      .addCase(toggleFavorite.fulfilled, (state, action) => {
        const { id, isFavorite } = action.payload;
        const song = state.allSongs.find(s => s.id === id);
        if (song) {
          song.isFavorite = isFavorite;
        }
      })
      // Create playlist
      .addCase(createNewPlaylist.fulfilled, (state, action) => {
        if (action.payload) {
          state.playlists.push(action.payload);
        }
      })
      // Delete playlist
      .addCase(deletePlaylist.fulfilled, (state, action) => {
        state.playlists = state.playlists.filter(p => p.id !== action.payload);
      });
  },
});

export const {
  setFilter,
  setSortBy,
  setSortOrder,
  setSearchQuery,
  setSelectedPlaylist,
  setSelectedAlbum,
  setSelectedArtist,
  clearSearchResults,
  setAudioFiles,
  updateAudioFile,
  clearError,
} = audioSlice.actions;

export default audioSlice.reducer;
