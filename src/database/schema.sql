-- Terra Media Player Database Schema

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
  file_type TEXT NOT NULL CHECK(file_type IN ('audio', 'video')),
  play_position INTEGER DEFAULT 0,
  total_duration INTEGER DEFAULT 0,
  played_at INTEGER NOT NULL
);

-- Settings Table (key-value store)
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_audio_artist ON audio_files(artist);
CREATE INDEX IF NOT EXISTS idx_audio_album ON audio_files(album);
CREATE INDEX IF NOT EXISTS idx_audio_genre ON audio_files(genre);
CREATE INDEX IF NOT EXISTS idx_audio_favorite ON audio_files(is_favorite);
CREATE INDEX IF NOT EXISTS idx_audio_play_count ON audio_files(play_count DESC);
CREATE INDEX IF NOT EXISTS idx_audio_last_played ON audio_files(last_played DESC);

CREATE INDEX IF NOT EXISTS idx_video_folder ON video_files(folder_path);
CREATE INDEX IF NOT EXISTS idx_video_favorite ON video_files(is_favorite);
CREATE INDEX IF NOT EXISTS idx_video_play_count ON video_files(play_count DESC);
CREATE INDEX IF NOT EXISTS idx_video_last_played ON video_files(last_played DESC);

CREATE INDEX IF NOT EXISTS idx_playlist_items_playlist ON playlist_items(playlist_id);
CREATE INDEX IF NOT EXISTS idx_playlist_items_audio ON playlist_items(audio_id);

CREATE INDEX IF NOT EXISTS idx_history_type ON play_history(file_type);
CREATE INDEX IF NOT EXISTS idx_history_played_at ON play_history(played_at DESC);

-- Insert system playlists
INSERT OR IGNORE INTO playlists (id, name, description, created_at, updated_at, cover_color, is_system)
VALUES 
  (1, 'Favorites', 'Your favorite tracks', strftime('%s', 'now') * 1000, strftime('%s', 'now') * 1000, '#F44336', 1),
  (2, 'Recently Played', 'Your recently played tracks', strftime('%s', 'now') * 1000, strftime('%s', 'now') * 1000, '#2196F3', 1),
  (3, 'Most Played', 'Your most played tracks', strftime('%s', 'now') * 1000, strftime('%s', 'now') * 1000, '#4CAF50', 1);
