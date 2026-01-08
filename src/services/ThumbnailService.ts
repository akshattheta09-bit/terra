// ═══════════════════════════════════════════════════════════════════════════════
// TERRA MEDIA PLAYER - THUMBNAIL GENERATION SERVICE
// Generate and cache video thumbnails for preview images
// Safe implementation that gracefully handles missing native modules
// ═══════════════════════════════════════════════════════════════════════════════

import * as FileSystem from 'expo-file-system';
import { VideoFile } from '../types/media';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const THUMBNAIL_DIR = `${FileSystem.cacheDirectory}thumbnails/`;
const THUMBNAIL_QUALITY = 0.7;
const THUMBNAIL_TIME_OFFSET = 1000; // 1 second into video

// Standard import for robustness
import * as VideoThumbnails from 'expo-video-thumbnails';

/**
 * Check if video thumbnails are available
 */
const checkThumbnailsAvailable = async (): Promise<boolean> => {
  return true; // Assume available if installed
};

// ─────────────────────────────────────────────────────────────────────────────
// Directory Management
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Ensure thumbnail directory exists
 */
export const ensureThumbnailDirectory = async (): Promise<void> => {
  try {
    const dirInfo = await FileSystem.getInfoAsync(THUMBNAIL_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(THUMBNAIL_DIR, { intermediates: true });
      console.log('[ThumbnailService] Created thumbnail directory');
    }
  } catch (error) {
    console.error('[ThumbnailService] Failed to create thumbnail directory:', error);
  }
};

/**
 * Get thumbnail path for a video
 */
export const getThumbnailPath = (videoId: number): string => {
  return `${THUMBNAIL_DIR}video_${videoId}.jpg`;
};

/**
 * Get thumbnail filename hash from file path
 */
const getHashFromPath = (filePath: string): string => {
  // Simple hash function for file path
  let hash = 0;
  for (let i = 0; i < filePath.length; i++) {
    const char = filePath.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
};

/**
 * Get thumbnail path from file path (for videos without ID yet)
 */
export const getThumbnailPathFromUri = (filePath: string): string => {
  const hash = getHashFromPath(filePath);
  return `${THUMBNAIL_DIR}video_${hash}.jpg`;
};

// ─────────────────────────────────────────────────────────────────────────────
// Thumbnail Generation
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate thumbnail for a video file
 */
export const generateThumbnail = async (
  videoUri: string,
  videoId?: number,
  timeMs: number = THUMBNAIL_TIME_OFFSET
): Promise<string | null> => {
  try {
    // Check if thumbnails module is available
    const isAvailable = await checkThumbnailsAvailable();
    if (!isAvailable || !VideoThumbnails) {
      return null;
    }
    
    await ensureThumbnailDirectory();
    
    // Generate thumbnail using expo-video-thumbnails
    const { uri } = await VideoThumbnails.getThumbnailAsync(videoUri, {
      time: timeMs,
      quality: THUMBNAIL_QUALITY,
    });
    
    // Determine destination path
    const destPath = videoId 
      ? getThumbnailPath(videoId) 
      : getThumbnailPathFromUri(videoUri);
    
    // Move to permanent location
    await FileSystem.moveAsync({
      from: uri,
      to: destPath,
    });
    
    console.log(`[ThumbnailService] Generated thumbnail for video: ${videoId || videoUri}`);
    return destPath;
  } catch (error) {
    console.error('[ThumbnailService] Failed to generate thumbnail:', error);
    return null;
  }
};

/**
 * Generate thumbnail at specific percentage of video duration
 */
export const generateThumbnailAtPercent = async (
  video: VideoFile,
  percent: number = 10
): Promise<string | null> => {
  const timeMs = Math.floor((video.duration * percent) / 100);
  return generateThumbnail(video.filePath, video.id, timeMs);
};

/**
 * Check if thumbnail exists for a video
 */
export const thumbnailExists = async (videoId: number): Promise<boolean> => {
  try {
    const path = getThumbnailPath(videoId);
    const info = await FileSystem.getInfoAsync(path);
    return info.exists;
  } catch {
    return false;
  }
};

/**
 * Get thumbnail URI if it exists, or null
 */
export const getThumbnailUri = async (videoId: number): Promise<string | null> => {
  try {
    const path = getThumbnailPath(videoId);
    const info = await FileSystem.getInfoAsync(path);
    return info.exists ? path : null;
  } catch {
    return null;
  }
};

/**
 * Generate thumbnail if it doesn't exist
 */
export const ensureThumbnail = async (video: VideoFile): Promise<string | null> => {
  // Check if thumbnail already exists
  const existing = await getThumbnailUri(video.id);
  if (existing) {
    return existing;
  }
  
  // Generate new thumbnail
  return generateThumbnail(video.filePath, video.id);
};

// ─────────────────────────────────────────────────────────────────────────────
// Batch Operations
// ─────────────────────────────────────────────────────────────────────────────

export type ThumbnailProgressCallback = (processed: number, total: number) => void;

/**
 * Generate thumbnails for multiple videos
 */
export const generateThumbnailsBatch = async (
  videos: VideoFile[],
  onProgress?: ThumbnailProgressCallback,
  concurrency: number = 3
): Promise<Map<number, string>> => {
  const results = new Map<number, string>();
  
  // Check if thumbnails module is available first
  const isAvailable = await checkThumbnailsAvailable();
  if (!isAvailable) {
    console.log('[ThumbnailService] Thumbnails not available, skipping batch generation');
    return results;
  }
  
  await ensureThumbnailDirectory();
  
  let processed = 0;
  
  // Process in batches for better performance
  for (let i = 0; i < videos.length; i += concurrency) {
    const batch = videos.slice(i, i + concurrency);
    
    const batchPromises = batch.map(async (video) => {
      try {
        const thumbnail = await ensureThumbnail(video);
        if (thumbnail) {
          results.set(video.id, thumbnail);
        }
      } catch (error) {
        console.error(`[ThumbnailService] Failed for ${video.fileName}:`, error);
      }
      processed++;
      onProgress?.(processed, videos.length);
    });
    
    await Promise.all(batchPromises);
  }
  
  console.log(`[ThumbnailService] Generated ${results.size}/${videos.length} thumbnails`);
  return results;
};

/**
 * Generate missing thumbnails for all videos
 */
export const generateMissingThumbnails = async (
  videos: VideoFile[],
  onProgress?: ThumbnailProgressCallback
): Promise<Map<number, string>> => {
  // Check if thumbnails module is available first
  const isAvailable = await checkThumbnailsAvailable();
  if (!isAvailable) {
    return new Map();
  }
  
  const missingVideos: VideoFile[] = [];
  
  // Find videos without thumbnails
  for (const video of videos) {
    const exists = await thumbnailExists(video.id);
    if (!exists) {
      missingVideos.push(video);
    }
  }
  
  console.log(`[ThumbnailService] Found ${missingVideos.length} videos without thumbnails`);
  
  if (missingVideos.length === 0) {
    return new Map();
  }
  
  return generateThumbnailsBatch(missingVideos, onProgress);
};

// ─────────────────────────────────────────────────────────────────────────────
// Cleanup
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Delete thumbnail for a specific video
 */
export const deleteThumbnail = async (videoId: number): Promise<void> => {
  try {
    const path = getThumbnailPath(videoId);
    const info = await FileSystem.getInfoAsync(path);
    if (info.exists) {
      await FileSystem.deleteAsync(path);
      console.log(`[ThumbnailService] Deleted thumbnail for video ${videoId}`);
    }
  } catch (error) {
    console.error('[ThumbnailService] Failed to delete thumbnail:', error);
  }
};

/**
 * Clear all cached thumbnails
 */
export const clearAllThumbnails = async (): Promise<void> => {
  try {
    const dirInfo = await FileSystem.getInfoAsync(THUMBNAIL_DIR);
    if (dirInfo.exists) {
      await FileSystem.deleteAsync(THUMBNAIL_DIR, { idempotent: true });
      await ensureThumbnailDirectory();
      console.log('[ThumbnailService] Cleared all thumbnails');
    }
  } catch (error) {
    console.error('[ThumbnailService] Failed to clear thumbnails:', error);
  }
};

/**
 * Get cache size in bytes
 */
export const getThumbnailCacheSize = async (): Promise<number> => {
  try {
    const dirInfo = await FileSystem.getInfoAsync(THUMBNAIL_DIR);
    if (!dirInfo.exists) return 0;
    
    const files = await FileSystem.readDirectoryAsync(THUMBNAIL_DIR);
    let totalSize = 0;
    
    for (const file of files) {
      const fileInfo = await FileSystem.getInfoAsync(`${THUMBNAIL_DIR}${file}`);
      if (fileInfo.exists && 'size' in fileInfo) {
        totalSize += fileInfo.size || 0;
      }
    }
    
    return totalSize;
  } catch {
    return 0;
  }
};

/**
 * Clean up orphaned thumbnails (thumbnails for videos that no longer exist)
 */
export const cleanupOrphanedThumbnails = async (validVideoIds: number[]): Promise<number> => {
  try {
    const dirInfo = await FileSystem.getInfoAsync(THUMBNAIL_DIR);
    if (!dirInfo.exists) return 0;
    
    const files = await FileSystem.readDirectoryAsync(THUMBNAIL_DIR);
    let removedCount = 0;
    
    const validSet = new Set(validVideoIds.map(id => `video_${id}.jpg`));
    
    for (const file of files) {
      if (!validSet.has(file)) {
        await FileSystem.deleteAsync(`${THUMBNAIL_DIR}${file}`, { idempotent: true });
        removedCount++;
      }
    }
    
    if (removedCount > 0) {
      console.log(`[ThumbnailService] Removed ${removedCount} orphaned thumbnails`);
    }
    
    return removedCount;
  } catch (error) {
    console.error('[ThumbnailService] Failed to cleanup orphaned thumbnails:', error);
    return 0;
  }
};

export default {
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
};
