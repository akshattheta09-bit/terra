// Database Service for Terra Media Player

import * as SQLite from 'expo-sqlite';
import { DATABASE_NAME } from '../utils/constants';
import { 
  AudioFile, 
  VideoFile, 
  Playlist, 
  PlaylistItem, 
  PlayHistory 
} from '../types/media';

let db: SQLite.SQLiteDatabase | null = null;

// Initialize database
export const initDatabase = async (): Promise<void> => {
  try {
    db = await SQLite.openDatabaseAsync(DATABASE_NAME);
    await createTables();
    await insertSystemPlaylists();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
};

// Create tables
const createTables = async (): Promise<void> => {
  if (!db) throw new Error('Database not initialized');

  await db.execAsync(`
    -- Audio Files Table
    CREATE TABLE IF NOT EXISTS audio_files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      file_path TEXT UNIQUE NOT NULL,
      file_name TEXT NOT NULL,
      duration INTEGER DEFAULT 0,
      title TEXT,
      artist TEXT,
      album TEXT,
      album_art TEXT,
      genre TEXT,
      year INTEGER,
      track_number INTEGER,
      file_size INTEGER DEFAULT 0,
      date_added INTEGER NOT NULL,
      last_played INTEGER,
      play_count INTEGER DEFAULT 0,
      is_favorite INTEGER DEFAULT 0,
      is_hidden INTEGER DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    -- Video Files Table
    CREATE TABLE IF NOT EXISTS video_files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      file_path TEXT UNIQUE NOT NULL,
      file_name TEXT NOT NULL,
      folder_path TEXT NOT NULL,
      duration INTEGER DEFAULT 0,
      width INTEGER,
      height INTEGER,
      file_size INTEGER DEFAULT 0,
      date_added INTEGER NOT NULL,
      last_played INTEGER,
      play_count INTEGER DEFAULT 0,
      last_watched_position INTEGER DEFAULT 0,
      is_favorite INTEGER DEFAULT 0,
      is_hidden INTEGER DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    -- Playlists Table
    CREATE TABLE IF NOT EXISTS playlists (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      cover_color TEXT DEFAULT '#2196F3',
      is_system INTEGER DEFAULT 0
    );

    -- Playlist Items Table
    CREATE TABLE IF NOT EXISTS playlist_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      playlist_id INTEGER NOT NULL,
      audio_id INTEGER NOT NULL,
      position INTEGER NOT NULL,
      added_at INTEGER NOT NULL,
      FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE,
      FOREIGN KEY (audio_id) REFERENCES audio_files(id) ON DELETE CASCADE
    );

    -- Play History Table
    CREATE TABLE IF NOT EXISTS play_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      file_path TEXT NOT NULL,
      file_type TEXT NOT NULL,
      play_position INTEGER DEFAULT 0,
      total_duration INTEGER DEFAULT 0,
      played_at INTEGER NOT NULL
    );

    -- Create indexes
    CREATE INDEX IF NOT EXISTS idx_audio_artist ON audio_files(artist);
    CREATE INDEX IF NOT EXISTS idx_audio_album ON audio_files(album);
    CREATE INDEX IF NOT EXISTS idx_audio_genre ON audio_files(genre);
    CREATE INDEX IF NOT EXISTS idx_audio_favorite ON audio_files(is_favorite);
    CREATE INDEX IF NOT EXISTS idx_video_folder ON video_files(folder_path);
    CREATE INDEX IF NOT EXISTS idx_video_favorite ON video_files(is_favorite);
  `);
};

// Insert system playlists
const insertSystemPlaylists = async (): Promise<void> => {
  if (!db) throw new Error('Database not initialized');

  const now = Date.now();
  
  await db.runAsync(`
    INSERT OR IGNORE INTO playlists (id, name, description, created_at, updated_at, cover_color, is_system)
    VALUES (1, 'Favorites', 'Your favorite tracks', ?, ?, '#F44336', 1)
  `, [now, now]);
  
  await db.runAsync(`
    INSERT OR IGNORE INTO playlists (id, name, description, created_at, updated_at, cover_color, is_system)
    VALUES (2, 'Recently Played', 'Your recently played tracks', ?, ?, '#2196F3', 1)
  `, [now, now]);
  
  await db.runAsync(`
    INSERT OR IGNORE INTO playlists (id, name, description, created_at, updated_at, cover_color, is_system)
    VALUES (3, 'Most Played', 'Your most played tracks', ?, ?, '#4CAF50', 1)
  `, [now, now]);
};

// Get database instance
export const getDatabase = (): SQLite.SQLiteDatabase => {
  if (!db) throw new Error('Database not initialized');
  return db;
};

// ==================== AUDIO FILE OPERATIONS ====================

export const insertAudioFile = async (audio: Omit<AudioFile, 'id'>): Promise<number> => {
  if (!db) throw new Error('Database not initialized');

  const result = await db.runAsync(
    `INSERT OR REPLACE INTO audio_files 
     (file_path, file_name, duration, title, artist, album, album_art, genre, year, 
      track_number, file_size, date_added, last_played, play_count, is_favorite, 
      is_hidden, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      audio.filePath,
      audio.fileName,
      audio.duration,
      audio.title,
      audio.artist,
      audio.album,
      audio.albumArt,
      audio.genre,
      audio.year,
      audio.trackNumber,
      audio.fileSize,
      audio.dateAdded,
      audio.lastPlayed,
      audio.playCount,
      audio.isFavorite ? 1 : 0,
      audio.isHidden ? 1 : 0,
      audio.createdAt,
      audio.updatedAt,
    ]
  );

  return result.lastInsertRowId;
};

export const getAllAudioFiles = async (
  sortBy: string = 'title',
  sortOrder: string = 'ASC',
  includeHidden: boolean = false
): Promise<AudioFile[]> => {
  if (!db) throw new Error('Database not initialized');

  const hiddenClause = includeHidden ? '' : 'WHERE is_hidden = 0';
  const rows = await db.getAllAsync<any>(
    `SELECT * FROM audio_files ${hiddenClause} ORDER BY ${sortBy} ${sortOrder}`
  );

  return rows.map(mapRowToAudioFile);
};

export const getAudioFileById = async (id: number): Promise<AudioFile | null> => {
  if (!db) throw new Error('Database not initialized');

  const row = await db.getFirstAsync<any>(
    'SELECT * FROM audio_files WHERE id = ?',
    [id]
  );

  return row ? mapRowToAudioFile(row) : null;
};

export const getAudioFileByPath = async (filePath: string): Promise<AudioFile | null> => {
  if (!db) throw new Error('Database not initialized');

  const row = await db.getFirstAsync<any>(
    'SELECT * FROM audio_files WHERE file_path = ?',
    [filePath]
  );

  return row ? mapRowToAudioFile(row) : null;
};

export const updateAudioPlayCount = async (id: number): Promise<void> => {
  if (!db) throw new Error('Database not initialized');

  const now = Date.now();
  await db.runAsync(
    'UPDATE audio_files SET play_count = play_count + 1, last_played = ?, updated_at = ? WHERE id = ?',
    [now, now, id]
  );
};

export const toggleAudioFavorite = async (id: number): Promise<boolean> => {
  if (!db) throw new Error('Database not initialized');

  const now = Date.now();
  await db.runAsync(
    'UPDATE audio_files SET is_favorite = CASE WHEN is_favorite = 1 THEN 0 ELSE 1 END, updated_at = ? WHERE id = ?',
    [now, id]
  );

  const row = await db.getFirstAsync<any>(
    'SELECT is_favorite FROM audio_files WHERE id = ?',
    [id]
  );

  return row?.is_favorite === 1;
};

export const getFavoriteAudioFiles = async (): Promise<AudioFile[]> => {
  if (!db) throw new Error('Database not initialized');

  const rows = await db.getAllAsync<any>(
    'SELECT * FROM audio_files WHERE is_favorite = 1 ORDER BY title ASC'
  );

  return rows.map(mapRowToAudioFile);
};

export const getRecentlyPlayedAudio = async (limit: number = 100): Promise<AudioFile[]> => {
  if (!db) throw new Error('Database not initialized');

  const rows = await db.getAllAsync<any>(
    'SELECT * FROM audio_files WHERE last_played IS NOT NULL ORDER BY last_played DESC LIMIT ?',
    [limit]
  );

  return rows.map(mapRowToAudioFile);
};

export const getMostPlayedAudio = async (limit: number = 50): Promise<AudioFile[]> => {
  if (!db) throw new Error('Database not initialized');

  const rows = await db.getAllAsync<any>(
    'SELECT * FROM audio_files WHERE play_count > 0 ORDER BY play_count DESC LIMIT ?',
    [limit]
  );

  return rows.map(mapRowToAudioFile);
};

export const searchAudioFiles = async (query: string): Promise<AudioFile[]> => {
  if (!db) throw new Error('Database not initialized');

  const searchTerm = `%${query}%`;
  const rows = await db.getAllAsync<any>(
    `SELECT * FROM audio_files 
     WHERE title LIKE ? OR artist LIKE ? OR album LIKE ? OR file_name LIKE ?
     ORDER BY title ASC`,
    [searchTerm, searchTerm, searchTerm, searchTerm]
  );

  return rows.map(mapRowToAudioFile);
};

export const getAudioByAlbum = async (album: string): Promise<AudioFile[]> => {
  if (!db) throw new Error('Database not initialized');

  const rows = await db.getAllAsync<any>(
    'SELECT * FROM audio_files WHERE album = ? ORDER BY track_number ASC, title ASC',
    [album]
  );

  return rows.map(mapRowToAudioFile);
};

export const getAudioByArtist = async (artist: string): Promise<AudioFile[]> => {
  if (!db) throw new Error('Database not initialized');

  const rows = await db.getAllAsync<any>(
    'SELECT * FROM audio_files WHERE artist = ? ORDER BY album ASC, track_number ASC',
    [artist]
  );

  return rows.map(mapRowToAudioFile);
};

export const getAudioByGenre = async (genre: string): Promise<AudioFile[]> => {
  if (!db) throw new Error('Database not initialized');

  const rows = await db.getAllAsync<any>(
    'SELECT * FROM audio_files WHERE genre = ? ORDER BY title ASC',
    [genre]
  );

  return rows.map(mapRowToAudioFile);
};

export const getUniqueAlbums = async (): Promise<string[]> => {
  if (!db) throw new Error('Database not initialized');

  const rows = await db.getAllAsync<any>(
    'SELECT DISTINCT album FROM audio_files WHERE album IS NOT NULL AND album != "" ORDER BY album ASC'
  );

  return rows.map(row => row.album);
};

export const getUniqueArtists = async (): Promise<string[]> => {
  if (!db) throw new Error('Database not initialized');

  const rows = await db.getAllAsync<any>(
    'SELECT DISTINCT artist FROM audio_files WHERE artist IS NOT NULL AND artist != "" ORDER BY artist ASC'
  );

  return rows.map(row => row.artist);
};

export const getUniqueGenres = async (): Promise<string[]> => {
  if (!db) throw new Error('Database not initialized');

  const rows = await db.getAllAsync<any>(
    'SELECT DISTINCT genre FROM audio_files WHERE genre IS NOT NULL AND genre != "" ORDER BY genre ASC'
  );

  return rows.map(row => row.genre);
};

export const deleteAudioFile = async (id: number): Promise<void> => {
  if (!db) throw new Error('Database not initialized');
  await db.runAsync('DELETE FROM audio_files WHERE id = ?', [id]);
};

export const clearAllAudioFiles = async (): Promise<void> => {
  if (!db) throw new Error('Database not initialized');
  await db.runAsync('DELETE FROM audio_files');
};

// ==================== VIDEO FILE OPERATIONS ====================

export const insertVideoFile = async (video: Omit<VideoFile, 'id'>): Promise<number> => {
  if (!db) throw new Error('Database not initialized');

  const result = await db.runAsync(
    `INSERT OR REPLACE INTO video_files 
     (file_path, file_name, folder_path, duration, width, height, file_size, 
      date_added, last_played, play_count, last_watched_position, is_favorite, 
      is_hidden, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      video.filePath,
      video.fileName,
      video.folderPath,
      video.duration,
      video.width,
      video.height,
      video.fileSize,
      video.dateAdded,
      video.lastPlayed,
      video.playCount,
      video.lastWatchedPosition,
      video.isFavorite ? 1 : 0,
      video.isHidden ? 1 : 0,
      video.createdAt,
      video.updatedAt,
    ]
  );

  return result.lastInsertRowId;
};

export const getAllVideoFiles = async (
  sortBy: string = 'file_name',
  sortOrder: string = 'ASC',
  includeHidden: boolean = false
): Promise<VideoFile[]> => {
  if (!db) throw new Error('Database not initialized');

  const hiddenClause = includeHidden ? '' : 'WHERE is_hidden = 0';
  const rows = await db.getAllAsync<any>(
    `SELECT * FROM video_files ${hiddenClause} ORDER BY ${sortBy} ${sortOrder}`
  );

  return rows.map(mapRowToVideoFile);
};

export const getVideoFileById = async (id: number): Promise<VideoFile | null> => {
  if (!db) throw new Error('Database not initialized');

  const row = await db.getFirstAsync<any>(
    'SELECT * FROM video_files WHERE id = ?',
    [id]
  );

  return row ? mapRowToVideoFile(row) : null;
};

export const getVideoFileByPath = async (filePath: string): Promise<VideoFile | null> => {
  if (!db) throw new Error('Database not initialized');

  const row = await db.getFirstAsync<any>(
    'SELECT * FROM video_files WHERE file_path = ?',
    [filePath]
  );

  return row ? mapRowToVideoFile(row) : null;
};

export const updateVideoPlayCount = async (id: number): Promise<void> => {
  if (!db) throw new Error('Database not initialized');

  const now = Date.now();
  await db.runAsync(
    'UPDATE video_files SET play_count = play_count + 1, last_played = ?, updated_at = ? WHERE id = ?',
    [now, now, id]
  );
};

export const updateVideoWatchPosition = async (id: number, position: number): Promise<void> => {
  if (!db) throw new Error('Database not initialized');

  const now = Date.now();
  await db.runAsync(
    'UPDATE video_files SET last_watched_position = ?, updated_at = ? WHERE id = ?',
    [position, now, id]
  );
};

export const toggleVideoFavorite = async (id: number): Promise<boolean> => {
  if (!db) throw new Error('Database not initialized');

  const now = Date.now();
  await db.runAsync(
    'UPDATE video_files SET is_favorite = CASE WHEN is_favorite = 1 THEN 0 ELSE 1 END, updated_at = ? WHERE id = ?',
    [now, id]
  );

  const row = await db.getFirstAsync<any>(
    'SELECT is_favorite FROM video_files WHERE id = ?',
    [id]
  );

  return row?.is_favorite === 1;
};

export const getFavoriteVideoFiles = async (): Promise<VideoFile[]> => {
  if (!db) throw new Error('Database not initialized');

  const rows = await db.getAllAsync<any>(
    'SELECT * FROM video_files WHERE is_favorite = 1 ORDER BY file_name ASC'
  );

  return rows.map(mapRowToVideoFile);
};

export const getRecentlyPlayedVideos = async (limit: number = 100): Promise<VideoFile[]> => {
  if (!db) throw new Error('Database not initialized');

  const rows = await db.getAllAsync<any>(
    'SELECT * FROM video_files WHERE last_played IS NOT NULL ORDER BY last_played DESC LIMIT ?',
    [limit]
  );

  return rows.map(mapRowToVideoFile);
};

export const getVideosByFolder = async (folderPath: string): Promise<VideoFile[]> => {
  if (!db) throw new Error('Database not initialized');

  const rows = await db.getAllAsync<any>(
    'SELECT * FROM video_files WHERE folder_path = ? ORDER BY file_name ASC',
    [folderPath]
  );

  return rows.map(mapRowToVideoFile);
};

export const getUniqueFolders = async (): Promise<string[]> => {
  if (!db) throw new Error('Database not initialized');

  const rows = await db.getAllAsync<any>(
    'SELECT DISTINCT folder_path FROM video_files ORDER BY folder_path ASC'
  );

  return rows.map(row => row.folder_path);
};

export const searchVideoFiles = async (query: string): Promise<VideoFile[]> => {
  if (!db) throw new Error('Database not initialized');

  const searchTerm = `%${query}%`;
  const rows = await db.getAllAsync<any>(
    'SELECT * FROM video_files WHERE file_name LIKE ? ORDER BY file_name ASC',
    [searchTerm]
  );

  return rows.map(mapRowToVideoFile);
};

export const deleteVideoFile = async (id: number): Promise<void> => {
  if (!db) throw new Error('Database not initialized');
  await db.runAsync('DELETE FROM video_files WHERE id = ?', [id]);
};

export const clearAllVideoFiles = async (): Promise<void> => {
  if (!db) throw new Error('Database not initialized');
  await db.runAsync('DELETE FROM video_files');
};

// ==================== PLAYLIST OPERATIONS ====================

export const createPlaylist = async (
  name: string,
  description: string = '',
  coverColor: string = '#2196F3'
): Promise<number> => {
  if (!db) throw new Error('Database not initialized');

  const now = Date.now();
  const result = await db.runAsync(
    `INSERT INTO playlists (name, description, created_at, updated_at, cover_color, is_system)
     VALUES (?, ?, ?, ?, ?, 0)`,
    [name, description, now, now, coverColor]
  );

  return result.lastInsertRowId;
};

export const getAllPlaylists = async (): Promise<Playlist[]> => {
  if (!db) throw new Error('Database not initialized');

  const rows = await db.getAllAsync<any>(
    `SELECT p.*, COUNT(pi.id) as track_count 
     FROM playlists p 
     LEFT JOIN playlist_items pi ON p.id = pi.playlist_id 
     GROUP BY p.id 
     ORDER BY p.is_system DESC, p.name ASC`
  );

  return rows.map(mapRowToPlaylist);
};

export const getPlaylistById = async (id: number): Promise<Playlist | null> => {
  if (!db) throw new Error('Database not initialized');

  const row = await db.getFirstAsync<any>(
    `SELECT p.*, COUNT(pi.id) as track_count 
     FROM playlists p 
     LEFT JOIN playlist_items pi ON p.id = pi.playlist_id 
     WHERE p.id = ?
     GROUP BY p.id`,
    [id]
  );

  return row ? mapRowToPlaylist(row) : null;
};

export const updatePlaylist = async (
  id: number,
  name: string,
  description: string,
  coverColor: string
): Promise<void> => {
  if (!db) throw new Error('Database not initialized');

  const now = Date.now();
  await db.runAsync(
    'UPDATE playlists SET name = ?, description = ?, cover_color = ?, updated_at = ? WHERE id = ? AND is_system = 0',
    [name, description, coverColor, now, id]
  );
};

export const deletePlaylist = async (id: number): Promise<void> => {
  if (!db) throw new Error('Database not initialized');
  await db.runAsync('DELETE FROM playlists WHERE id = ? AND is_system = 0', [id]);
};

export const addToPlaylist = async (playlistId: number, audioId: number): Promise<void> => {
  if (!db) throw new Error('Database not initialized');

  // Get the current max position
  const maxRow = await db.getFirstAsync<any>(
    'SELECT MAX(position) as max_pos FROM playlist_items WHERE playlist_id = ?',
    [playlistId]
  );
  
  const position = (maxRow?.max_pos ?? -1) + 1;
  const now = Date.now();

  await db.runAsync(
    'INSERT OR IGNORE INTO playlist_items (playlist_id, audio_id, position, added_at) VALUES (?, ?, ?, ?)',
    [playlistId, audioId, position, now]
  );

  // Update playlist timestamp
  await db.runAsync(
    'UPDATE playlists SET updated_at = ? WHERE id = ?',
    [now, playlistId]
  );
};

export const removeFromPlaylist = async (playlistId: number, audioId: number): Promise<void> => {
  if (!db) throw new Error('Database not initialized');
  await db.runAsync(
    'DELETE FROM playlist_items WHERE playlist_id = ? AND audio_id = ?',
    [playlistId, audioId]
  );
};

export const getPlaylistTracks = async (playlistId: number): Promise<AudioFile[]> => {
  if (!db) throw new Error('Database not initialized');

  const rows = await db.getAllAsync<any>(
    `SELECT a.* FROM audio_files a
     INNER JOIN playlist_items pi ON a.id = pi.audio_id
     WHERE pi.playlist_id = ?
     ORDER BY pi.position ASC`,
    [playlistId]
  );

  return rows.map(mapRowToAudioFile);
};

export const clearPlaylist = async (playlistId: number): Promise<void> => {
  if (!db) throw new Error('Database not initialized');
  await db.runAsync('DELETE FROM playlist_items WHERE playlist_id = ?', [playlistId]);
};

// ==================== PLAY HISTORY OPERATIONS ====================

export const addToPlayHistory = async (
  filePath: string,
  fileType: 'audio' | 'video',
  playPosition: number,
  totalDuration: number
): Promise<void> => {
  if (!db) throw new Error('Database not initialized');

  const now = Date.now();
  await db.runAsync(
    `INSERT INTO play_history (file_path, file_type, play_position, total_duration, played_at)
     VALUES (?, ?, ?, ?, ?)`,
    [filePath, fileType, playPosition, totalDuration, now]
  );
};

export const getPlayHistory = async (
  fileType?: 'audio' | 'video',
  limit: number = 100
): Promise<PlayHistory[]> => {
  if (!db) throw new Error('Database not initialized');

  const typeClause = fileType ? `WHERE file_type = '${fileType}'` : '';
  const rows = await db.getAllAsync<any>(
    `SELECT * FROM play_history ${typeClause} ORDER BY played_at DESC LIMIT ?`,
    [limit]
  );

  return rows.map(mapRowToPlayHistory);
};

export const clearPlayHistory = async (): Promise<void> => {
  if (!db) throw new Error('Database not initialized');
  await db.runAsync('DELETE FROM play_history');
};

// ==================== HELPER FUNCTIONS ====================

const mapRowToAudioFile = (row: any): AudioFile => ({
  id: row.id,
  filePath: row.file_path,
  fileName: row.file_name,
  duration: row.duration,
  title: row.title,
  artist: row.artist,
  album: row.album,
  albumArt: row.album_art,
  genre: row.genre,
  year: row.year,
  trackNumber: row.track_number,
  fileSize: row.file_size,
  dateAdded: row.date_added,
  lastPlayed: row.last_played,
  playCount: row.play_count,
  isFavorite: row.is_favorite === 1,
  isHidden: row.is_hidden === 1,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const mapRowToVideoFile = (row: any): VideoFile => ({
  id: row.id,
  filePath: row.file_path,
  fileName: row.file_name,
  folderPath: row.folder_path,
  duration: row.duration,
  width: row.width,
  height: row.height,
  fileSize: row.file_size,
  dateAdded: row.date_added,
  lastPlayed: row.last_played,
  playCount: row.play_count,
  lastWatchedPosition: row.last_watched_position,
  isFavorite: row.is_favorite === 1,
  isHidden: row.is_hidden === 1,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const mapRowToPlaylist = (row: any): Playlist => ({
  id: row.id,
  name: row.name,
  description: row.description,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  coverColor: row.cover_color,
  isSystem: row.is_system === 1,
  trackCount: row.track_count ?? 0,
});

const mapRowToPlayHistory = (row: any): PlayHistory => ({
  id: row.id,
  filePath: row.file_path,
  fileType: row.file_type,
  playPosition: row.play_position,
  totalDuration: row.total_duration,
  playedAt: row.played_at,
});

// Export database service
export const DatabaseService = {
  initDatabase,
  getDatabase,
  // Audio
  insertAudioFile,
  getAllAudioFiles,
  getAudioFileById,
  getAudioFileByPath,
  updateAudioPlayCount,
  toggleAudioFavorite,
  getFavoriteAudioFiles,
  getRecentlyPlayedAudio,
  getMostPlayedAudio,
  searchAudioFiles,
  getAudioByAlbum,
  getAudioByArtist,
  getAudioByGenre,
  getUniqueAlbums,
  getUniqueArtists,
  getUniqueGenres,
  deleteAudioFile,
  clearAllAudioFiles,
  // Video
  insertVideoFile,
  getAllVideoFiles,
  getVideoFileById,
  getVideoFileByPath,
  updateVideoPlayCount,
  updateVideoWatchPosition,
  toggleVideoFavorite,
  getFavoriteVideoFiles,
  getRecentlyPlayedVideos,
  getVideosByFolder,
  getUniqueFolders,
  searchVideoFiles,
  deleteVideoFile,
  clearAllVideoFiles,
  // Playlists
  createPlaylist,
  getAllPlaylists,
  getPlaylistById,
  updatePlaylist,
  deletePlaylist,
  addToPlaylist,
  removeFromPlaylist,
  getPlaylistTracks,
  clearPlaylist,
  // History
  addToPlayHistory,
  getPlayHistory,
  clearPlayHistory,
};

export default DatabaseService;
