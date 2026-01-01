// Media Scanner Service for Terra Media Player

import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import { 
  AudioFile, 
  VideoFile, 
  ScanProgress,
  SUPPORTED_AUDIO_EXTENSIONS,
  SUPPORTED_VIDEO_EXTENSIONS 
} from '../types/media';
import { isAudioFile, isVideoFile, isFolderExcluded, isHiddenFile } from '../utils/validators';
import { getFileName, getFolderPath, getFileExtension } from '../utils/formatters';
import * as DatabaseService from './DatabaseService';

export type ScanProgressCallback = (progress: ScanProgress) => void;

interface ScannedMedia {
  audioFiles: AudioFile[];
  videoFiles: VideoFile[];
}

/**
 * Scan media using expo-media-library (primary method)
 */
export const scanMediaLibrary = async (
  onProgress?: ScanProgressCallback,
  includeHidden: boolean = false,
  excludedFolders: string[] = []
): Promise<ScannedMedia> => {
  const audioFiles: AudioFile[] = [];
  const videoFiles: VideoFile[] = [];
  const now = Date.now();
  
  let scannedCount = 0;
  
  try {
    // Scan audio files
    let hasMore = true;
    let endCursor: string | undefined;
    
    onProgress?.({
      currentPath: 'Scanning audio files...',
      scannedFiles: 0,
      totalFiles: 0,
      audioFiles: 0,
      videoFiles: 0,
    });
    
    while (hasMore) {
      const result = await MediaLibrary.getAssetsAsync({
        mediaType: MediaLibrary.MediaType.audio,
        first: 500,
        after: endCursor,
        sortBy: [[MediaLibrary.SortBy.creationTime, false]],
      });
      
      for (const asset of result.assets) {
        scannedCount++;
        
        // Check if file should be excluded
        const folderPath = getFolderPath(asset.uri);
        if (!includeHidden && isHiddenFile(asset.filename)) continue;
        if (isFolderExcluded(folderPath, excludedFolders)) continue;
        
        const audioFile: AudioFile = {
          id: 0, // Will be set by database
          filePath: asset.uri,
          fileName: asset.filename,
          duration: Math.round((asset.duration || 0) * 1000), // Convert to ms
          title: asset.filename.replace(/\.[^/.]+$/, ''), // Remove extension
          artist: '',
          album: '',
          albumArt: null,
          genre: '',
          year: null,
          trackNumber: null,
          fileSize: 0,
          dateAdded: asset.creationTime || now,
          lastPlayed: null,
          playCount: 0,
          isFavorite: false,
          isHidden: false,
          createdAt: asset.creationTime || now,
          updatedAt: now,
        };
        
        audioFiles.push(audioFile);
        
        onProgress?.({
          currentPath: asset.filename,
          scannedFiles: scannedCount,
          totalFiles: result.totalCount,
          audioFiles: audioFiles.length,
          videoFiles: videoFiles.length,
        });
      }
      
      hasMore = result.hasNextPage;
      endCursor = result.endCursor;
    }
    
    // Scan video files
    hasMore = true;
    endCursor = undefined;
    
    onProgress?.({
      currentPath: 'Scanning video files...',
      scannedFiles: scannedCount,
      totalFiles: 0,
      audioFiles: audioFiles.length,
      videoFiles: 0,
    });
    
    while (hasMore) {
      const result = await MediaLibrary.getAssetsAsync({
        mediaType: MediaLibrary.MediaType.video,
        first: 500,
        after: endCursor,
        sortBy: [[MediaLibrary.SortBy.creationTime, false]],
      });
      
      for (const asset of result.assets) {
        scannedCount++;
        
        const folderPath = getFolderPath(asset.uri);
        if (!includeHidden && isHiddenFile(asset.filename)) continue;
        if (isFolderExcluded(folderPath, excludedFolders)) continue;
        
        const videoFile: VideoFile = {
          id: 0,
          filePath: asset.uri,
          fileName: asset.filename,
          folderPath: folderPath,
          duration: Math.round((asset.duration || 0) * 1000),
          width: asset.width || null,
          height: asset.height || null,
          fileSize: 0,
          dateAdded: asset.creationTime || now,
          lastPlayed: null,
          playCount: 0,
          lastWatchedPosition: 0,
          isFavorite: false,
          isHidden: false,
          createdAt: asset.creationTime || now,
          updatedAt: now,
        };
        
        videoFiles.push(videoFile);
        
        onProgress?.({
          currentPath: asset.filename,
          scannedFiles: scannedCount,
          totalFiles: result.totalCount,
          audioFiles: audioFiles.length,
          videoFiles: videoFiles.length,
        });
      }
      
      hasMore = result.hasNextPage;
      endCursor = result.endCursor;
    }
    
  } catch (error) {
    console.error('Error scanning media library:', error);
  }
  
  return { audioFiles, videoFiles };
};

/**
 * Save scanned media to database
 */
export const saveScannedMedia = async (
  scannedMedia: ScannedMedia,
  onProgress?: ScanProgressCallback
): Promise<void> => {
  const { audioFiles, videoFiles } = scannedMedia;
  const total = audioFiles.length + videoFiles.length;
  let saved = 0;
  
  onProgress?.({
    currentPath: 'Saving to database...',
    scannedFiles: total,
    totalFiles: total,
    audioFiles: audioFiles.length,
    videoFiles: videoFiles.length,
  });
  
  // Save audio files
  for (const audio of audioFiles) {
    try {
      // Check if file already exists
      const existing = await DatabaseService.getAudioFileByPath(audio.filePath);
      if (!existing) {
        await DatabaseService.insertAudioFile(audio);
      }
      saved++;
      
      if (saved % 50 === 0) {
        onProgress?.({
          currentPath: `Saving ${saved}/${total}...`,
          scannedFiles: saved,
          totalFiles: total,
          audioFiles: audioFiles.length,
          videoFiles: videoFiles.length,
        });
      }
    } catch (error) {
      console.error('Error saving audio file:', audio.filePath, error);
    }
  }
  
  // Save video files
  for (const video of videoFiles) {
    try {
      const existing = await DatabaseService.getVideoFileByPath(video.filePath);
      if (!existing) {
        await DatabaseService.insertVideoFile(video);
      }
      saved++;
      
      if (saved % 50 === 0) {
        onProgress?.({
          currentPath: `Saving ${saved}/${total}...`,
          scannedFiles: saved,
          totalFiles: total,
          audioFiles: audioFiles.length,
          videoFiles: videoFiles.length,
        });
      }
    } catch (error) {
      console.error('Error saving video file:', video.filePath, error);
    }
  }
};

/**
 * Perform full media scan and save to database
 */
export const performFullScan = async (
  onProgress?: ScanProgressCallback,
  includeHidden: boolean = false,
  excludedFolders: string[] = []
): Promise<{ audioCount: number; videoCount: number }> => {
  // Scan media library
  const scannedMedia = await scanMediaLibrary(onProgress, includeHidden, excludedFolders);
  
  // Save to database
  await saveScannedMedia(scannedMedia, onProgress);
  
  return {
    audioCount: scannedMedia.audioFiles.length,
    videoCount: scannedMedia.videoFiles.length,
  };
};

/**
 * Quick rescan - only scan for new files
 */
export const quickRescan = async (
  onProgress?: ScanProgressCallback,
  includeHidden: boolean = false,
  excludedFolders: string[] = []
): Promise<{ newAudio: number; newVideo: number }> => {
  const scannedMedia = await scanMediaLibrary(onProgress, includeHidden, excludedFolders);
  
  let newAudio = 0;
  let newVideo = 0;
  
  // Only save new files
  for (const audio of scannedMedia.audioFiles) {
    const existing = await DatabaseService.getAudioFileByPath(audio.filePath);
    if (!existing) {
      await DatabaseService.insertAudioFile(audio);
      newAudio++;
    }
  }
  
  for (const video of scannedMedia.videoFiles) {
    const existing = await DatabaseService.getVideoFileByPath(video.filePath);
    if (!existing) {
      await DatabaseService.insertVideoFile(video);
      newVideo++;
    }
  }
  
  return { newAudio, newVideo };
};

/**
 * Clean up database - remove files that no longer exist
 */
export const cleanupDeletedFiles = async (): Promise<{ removed: number }> => {
  let removed = 0;
  
  // Check audio files
  const audioFiles = await DatabaseService.getAllAudioFiles();
  for (const audio of audioFiles) {
    try {
      const info = await FileSystem.getInfoAsync(audio.filePath);
      if (!info.exists) {
        await DatabaseService.deleteAudioFile(audio.id);
        removed++;
      }
    } catch (error) {
      // File not accessible, consider it deleted
      await DatabaseService.deleteAudioFile(audio.id);
      removed++;
    }
  }
  
  // Check video files
  const videoFiles = await DatabaseService.getAllVideoFiles();
  for (const video of videoFiles) {
    try {
      const info = await FileSystem.getInfoAsync(video.filePath);
      if (!info.exists) {
        await DatabaseService.deleteVideoFile(video.id);
        removed++;
      }
    } catch (error) {
      await DatabaseService.deleteVideoFile(video.id);
      removed++;
    }
  }
  
  return { removed };
};

export const MediaScannerService = {
  scanMediaLibrary,
  saveScannedMedia,
  performFullScan,
  quickRescan,
  cleanupDeletedFiles,
};

export default MediaScannerService;
