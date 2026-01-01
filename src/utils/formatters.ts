// Formatting utilities for Terra Media Player

/**
 * Format duration from milliseconds to human readable string
 * @param ms Duration in milliseconds
 * @returns Formatted string (e.g., "3:45" or "1:23:45")
 */
export const formatDuration = (ms: number): string => {
  if (!ms || ms < 0) return '0:00';
  
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

/**
 * Format duration from seconds to human readable string
 * @param seconds Duration in seconds
 * @returns Formatted string (e.g., "3:45" or "1:23:45")
 */
export const formatDurationFromSeconds = (seconds: number): string => {
  return formatDuration(seconds * 1000);
};

/**
 * Format file size to human readable string
 * @param bytes File size in bytes
 * @returns Formatted string (e.g., "4.5 MB", "1.2 GB")
 */
export const formatFileSize = (bytes: number): string => {
  if (!bytes || bytes < 0) return '0 B';
  
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let unitIndex = 0;
  let size = bytes;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(unitIndex > 0 ? 1 : 0)} ${units[unitIndex]}`;
};

/**
 * Format date to human readable string
 * @param timestamp Unix timestamp in milliseconds
 * @returns Formatted date string
 */
export const formatDate = (timestamp: number): string => {
  if (!timestamp) return '';
  
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} month${months > 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString();
  }
};

/**
 * Format date to short string
 * @param timestamp Unix timestamp in milliseconds
 * @returns Short formatted date string (e.g., "Jan 15, 2024")
 */
export const formatDateShort = (timestamp: number): string => {
  if (!timestamp) return '';
  
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

/**
 * Format playback speed for display
 * @param speed Playback speed multiplier
 * @returns Formatted string (e.g., "1x", "1.5x")
 */
export const formatPlaybackSpeed = (speed: number): string => {
  return `${speed}x`;
};

/**
 * Format track number with leading zeros
 * @param trackNumber Track number
 * @param totalTracks Total tracks in album
 * @returns Formatted track number (e.g., "01", "12")
 */
export const formatTrackNumber = (trackNumber: number, totalTracks?: number): string => {
  if (!trackNumber) return '';
  
  const digits = totalTracks ? String(totalTracks).length : 2;
  return String(trackNumber).padStart(digits, '0');
};

/**
 * Format resolution for display
 * @param width Video width
 * @param height Video height
 * @returns Resolution string (e.g., "1920x1080", "4K", "HD")
 */
export const formatResolution = (width: number | null, height: number | null): string => {
  if (!width || !height) return 'Unknown';
  
  // Common resolution names
  if (width >= 3840) return '4K';
  if (width >= 2560) return '1440p';
  if (width >= 1920) return '1080p';
  if (width >= 1280) return '720p';
  if (width >= 854) return '480p';
  if (width >= 640) return '360p';
  
  return `${width}x${height}`;
};

/**
 * Format play count for display
 * @param count Play count
 * @returns Formatted string (e.g., "5 plays", "1 play", "Never played")
 */
export const formatPlayCount = (count: number): string => {
  if (!count || count === 0) return 'Never played';
  if (count === 1) return '1 play';
  return `${count} plays`;
};

/**
 * Truncate text with ellipsis
 * @param text Text to truncate
 * @param maxLength Maximum length
 * @returns Truncated text
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

/**
 * Get file extension from path
 * @param filePath File path
 * @returns File extension (lowercase, with dot)
 */
export const getFileExtension = (filePath: string): string => {
  if (!filePath) return '';
  const lastDot = filePath.lastIndexOf('.');
  if (lastDot === -1) return '';
  return filePath.substring(lastDot).toLowerCase();
};

/**
 * Get file name from path
 * @param filePath File path
 * @param includeExtension Whether to include extension
 * @returns File name
 */
export const getFileName = (filePath: string, includeExtension = true): string => {
  if (!filePath) return '';
  
  const parts = filePath.split('/');
  const fileName = parts[parts.length - 1] || '';
  
  if (!includeExtension) {
    const lastDot = fileName.lastIndexOf('.');
    if (lastDot !== -1) {
      return fileName.substring(0, lastDot);
    }
  }
  
  return fileName;
};

/**
 * Get folder path from file path
 * @param filePath File path
 * @returns Folder path
 */
export const getFolderPath = (filePath: string): string => {
  if (!filePath) return '';
  const lastSlash = filePath.lastIndexOf('/');
  if (lastSlash === -1) return '';
  return filePath.substring(0, lastSlash);
};

/**
 * Get folder name from path
 * @param folderPath Folder path
 * @returns Folder name
 */
export const getFolderName = (folderPath: string): string => {
  if (!folderPath) return '';
  const parts = folderPath.split('/').filter(Boolean);
  return parts[parts.length - 1] || '';
};

/**
 * Format artist name for display
 * @param artist Artist name
 * @returns Formatted artist name or "Unknown Artist"
 */
export const formatArtist = (artist: string | null | undefined): string => {
  if (!artist || artist.trim() === '') return 'Unknown Artist';
  return artist.trim();
};

/**
 * Format album name for display
 * @param album Album name
 * @returns Formatted album name or "Unknown Album"
 */
export const formatAlbum = (album: string | null | undefined): string => {
  if (!album || album.trim() === '') return 'Unknown Album';
  return album.trim();
};

/**
 * Format title for display
 * @param title Title
 * @param fileName Fallback file name
 * @returns Formatted title
 */
export const formatTitle = (title: string | null | undefined, fileName?: string): string => {
  if (title && title.trim() !== '') return title.trim();
  if (fileName) return getFileName(fileName, false);
  return 'Unknown Title';
};
