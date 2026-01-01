// Validation utilities for Terra Media Player

import { 
  SUPPORTED_AUDIO_EXTENSIONS, 
  SUPPORTED_VIDEO_EXTENSIONS 
} from '../types/media';
import { getFileExtension } from './formatters';
import { FILE_SIZE } from './constants';

/**
 * Check if a file extension is a supported audio format
 * @param filePath File path or extension
 * @returns True if supported audio format
 */
export const isAudioFile = (filePath: string): boolean => {
  const extension = getFileExtension(filePath);
  return SUPPORTED_AUDIO_EXTENSIONS.includes(extension);
};

/**
 * Check if a file extension is a supported video format
 * @param filePath File path or extension
 * @returns True if supported video format
 */
export const isVideoFile = (filePath: string): boolean => {
  const extension = getFileExtension(filePath);
  return SUPPORTED_VIDEO_EXTENSIONS.includes(extension);
};

/**
 * Check if a file is a supported media file (audio or video)
 * @param filePath File path or extension
 * @returns True if supported media format
 */
export const isMediaFile = (filePath: string): boolean => {
  return isAudioFile(filePath) || isVideoFile(filePath);
};

/**
 * Check if file size meets minimum requirements
 * @param size File size in bytes
 * @param type Media type
 * @returns True if file meets minimum size
 */
export const isValidFileSize = (size: number, type: 'audio' | 'video'): boolean => {
  const minSize = type === 'audio' ? FILE_SIZE.minAudioBytes : FILE_SIZE.minVideoBytes;
  return size >= minSize;
};

/**
 * Validate a file path exists and is accessible
 * @param filePath File path
 * @returns True if path is valid format
 */
export const isValidFilePath = (filePath: string): boolean => {
  if (!filePath || typeof filePath !== 'string') return false;
  if (filePath.trim() === '') return false;
  
  // Check for invalid characters
  const invalidChars = /[\0<>:"|?*]/;
  if (invalidChars.test(filePath)) return false;
  
  return true;
};

/**
 * Check if a folder path should be excluded from scanning
 * @param folderPath Folder path
 * @param excludedFolders List of excluded folder patterns
 * @returns True if folder should be excluded
 */
export const isFolderExcluded = (folderPath: string, excludedFolders: string[]): boolean => {
  if (!excludedFolders || excludedFolders.length === 0) return false;
  
  const normalizedPath = folderPath.toLowerCase();
  
  // Default excluded folders
  const defaultExclusions = [
    '/android/',
    '/.android/',
    '/cache/',
    '/.cache/',
    '/thumbnails/',
    '/.thumbnails/',
    '/nomedia/',
    '/.nomedia/',
    '/trash/',
    '/.trash/',
  ];
  
  // Check default exclusions
  for (const exclusion of defaultExclusions) {
    if (normalizedPath.includes(exclusion)) return true;
  }
  
  // Check user-defined exclusions
  for (const exclusion of excludedFolders) {
    if (normalizedPath.includes(exclusion.toLowerCase())) return true;
  }
  
  return false;
};

/**
 * Check if a file is hidden (starts with .)
 * @param filePath File path
 * @returns True if file is hidden
 */
export const isHiddenFile = (filePath: string): boolean => {
  const parts = filePath.split('/');
  const fileName = parts[parts.length - 1] || '';
  return fileName.startsWith('.');
};

/**
 * Validate playlist name
 * @param name Playlist name
 * @returns Error message or null if valid
 */
export const validatePlaylistName = (name: string): string | null => {
  if (!name || name.trim() === '') {
    return 'Playlist name is required';
  }
  
  if (name.trim().length < 1) {
    return 'Playlist name must be at least 1 character';
  }
  
  if (name.trim().length > 100) {
    return 'Playlist name must be less than 100 characters';
  }
  
  return null;
};

/**
 * Validate search query
 * @param query Search query
 * @returns Sanitized query or empty string
 */
export const sanitizeSearchQuery = (query: string): string => {
  if (!query || typeof query !== 'string') return '';
  
  // Remove special characters that could cause issues
  return query
    .trim()
    .replace(/[^\w\s\-_.]/g, '')
    .substring(0, 100);
};

/**
 * Check if duration is valid
 * @param duration Duration in milliseconds
 * @returns True if duration is valid
 */
export const isValidDuration = (duration: number | null | undefined): boolean => {
  if (duration === null || duration === undefined) return false;
  return duration > 0 && duration < 24 * 60 * 60 * 1000; // Less than 24 hours
};

/**
 * Validate playback position
 * @param position Position in milliseconds
 * @param duration Total duration in milliseconds
 * @returns Clamped position value
 */
export const validatePlaybackPosition = (position: number, duration: number): number => {
  if (!position || position < 0) return 0;
  if (position > duration) return duration;
  return position;
};

/**
 * Check if subtitle file is valid
 * @param filePath Subtitle file path
 * @returns True if valid subtitle format
 */
export const isSubtitleFile = (filePath: string): boolean => {
  const extension = getFileExtension(filePath);
  const supportedSubtitles = ['.srt', '.vtt', '.ass', '.ssa', '.sub'];
  return supportedSubtitles.includes(extension);
};
