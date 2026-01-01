// Media Scanning Hook for Terra Media Player

import { useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from './useRedux';
import {
  setIsScanning,
  setScanProgress,
  setLastScanTime,
  showToast,
  setAudioFiles,
  setVideoFiles,
  loadAllAudioFiles,
  loadAllVideoFiles,
  loadPlaylists,
} from '../store';
import { ScanProgress } from '../types/media';
import { MediaScannerService } from '../services/MediaScannerService';
import { PermissionService } from '../services/PermissionService';

export const useMediaScanning = () => {
  const dispatch = useAppDispatch();
  const [isPermissionDenied, setIsPermissionDenied] = useState(false);
  
  const { isScanning, scanProgress, lastScanTime } = useAppSelector(state => state.ui);
  const librarySettings = useAppSelector(state => state.settings.settings.library);
  
  // Check permissions
  const checkPermissions = useCallback(async (): Promise<boolean> => {
    const permission = await PermissionService.checkMediaPermission();
    
    if (!permission.granted) {
      const requestResult = await PermissionService.requestMediaPermission();
      
      if (!requestResult.granted) {
        setIsPermissionDenied(true);
        dispatch(showToast({
          message: 'Storage permission is required to scan media files',
          type: 'error',
        }));
        return false;
      }
    }
    
    setIsPermissionDenied(false);
    return true;
  }, [dispatch]);
  
  // Progress callback
  const handleProgress = useCallback((progress: ScanProgress) => {
    dispatch(setScanProgress(progress));
  }, [dispatch]);
  
  // Perform full scan
  const performFullScan = useCallback(async () => {
    // Check permissions first
    const hasPermission = await checkPermissions();
    if (!hasPermission) return { success: false, audioCount: 0, videoCount: 0 };
    
    dispatch(setIsScanning(true));
    dispatch(setScanProgress({
      currentPath: 'Starting scan...',
      scannedFiles: 0,
      totalFiles: 0,
      audioFiles: 0,
      videoFiles: 0,
    }));
    
    try {
      const result = await MediaScannerService.performFullScan(
        handleProgress,
        librarySettings.includeHiddenFiles,
        librarySettings.excludedFolders
      );
      
      // Reload data from database
      await dispatch(loadAllAudioFiles());
      await dispatch(loadAllVideoFiles());
      await dispatch(loadPlaylists());
      
      const now = Date.now();
      dispatch(setLastScanTime(now));
      
      dispatch(showToast({
        message: `Found ${result.audioCount} audio and ${result.videoCount} video files`,
        type: 'success',
      }));
      
      return { success: true, ...result };
    } catch (error: any) {
      console.error('Scan failed:', error);
      dispatch(showToast({
        message: 'Failed to scan media files',
        type: 'error',
      }));
      return { success: false, audioCount: 0, videoCount: 0 };
    } finally {
      dispatch(setIsScanning(false));
      dispatch(setScanProgress(null));
    }
  }, [dispatch, checkPermissions, handleProgress, librarySettings]);
  
  // Perform quick scan (only new files)
  const performQuickScan = useCallback(async () => {
    const hasPermission = await checkPermissions();
    if (!hasPermission) return { success: false, newAudio: 0, newVideo: 0 };
    
    dispatch(setIsScanning(true));
    dispatch(setScanProgress({
      currentPath: 'Quick scanning...',
      scannedFiles: 0,
      totalFiles: 0,
      audioFiles: 0,
      videoFiles: 0,
    }));
    
    try {
      const result = await MediaScannerService.quickRescan(
        handleProgress,
        librarySettings.includeHiddenFiles,
        librarySettings.excludedFolders
      );
      
      if (result.newAudio > 0 || result.newVideo > 0) {
        await dispatch(loadAllAudioFiles());
        await dispatch(loadAllVideoFiles());
        
        dispatch(showToast({
          message: `Found ${result.newAudio} new audio and ${result.newVideo} new video files`,
          type: 'success',
        }));
      } else {
        dispatch(showToast({
          message: 'No new files found',
          type: 'info',
        }));
      }
      
      const now = Date.now();
      dispatch(setLastScanTime(now));
      
      return { success: true, ...result };
    } catch (error: any) {
      console.error('Quick scan failed:', error);
      dispatch(showToast({
        message: 'Failed to scan for new files',
        type: 'error',
      }));
      return { success: false, newAudio: 0, newVideo: 0 };
    } finally {
      dispatch(setIsScanning(false));
      dispatch(setScanProgress(null));
    }
  }, [dispatch, checkPermissions, handleProgress, librarySettings]);
  
  // Clean up deleted files from database
  const cleanupDeletedFiles = useCallback(async () => {
    dispatch(setIsScanning(true));
    dispatch(setScanProgress({
      currentPath: 'Cleaning up deleted files...',
      scannedFiles: 0,
      totalFiles: 0,
      audioFiles: 0,
      videoFiles: 0,
    }));
    
    try {
      const result = await MediaScannerService.cleanupDeletedFiles();
      
      if (result.removed > 0) {
        await dispatch(loadAllAudioFiles());
        await dispatch(loadAllVideoFiles());
        
        dispatch(showToast({
          message: `Removed ${result.removed} deleted files from library`,
          type: 'success',
        }));
      } else {
        dispatch(showToast({
          message: 'No deleted files found',
          type: 'info',
        }));
      }
      
      return { success: true, removed: result.removed };
    } catch (error: any) {
      console.error('Cleanup failed:', error);
      dispatch(showToast({
        message: 'Failed to clean up deleted files',
        type: 'error',
      }));
      return { success: false, removed: 0 };
    } finally {
      dispatch(setIsScanning(false));
      dispatch(setScanProgress(null));
    }
  }, [dispatch]);
  
  return {
    // State
    isScanning,
    scanProgress,
    lastScanTime,
    isPermissionDenied,
    
    // Actions
    checkPermissions,
    performFullScan,
    performQuickScan,
    cleanupDeletedFiles,
  };
};

export default useMediaScanning;
