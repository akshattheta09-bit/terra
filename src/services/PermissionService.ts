// Permission Service for Terra Media Player

import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';

export interface PermissionStatus {
  granted: boolean;
  canAskAgain: boolean;
  status: 'granted' | 'denied' | 'undetermined';
}

/**
 * Request media library permission
 */
export const requestMediaPermission = async (): Promise<PermissionStatus> => {
  try {
    const { status, canAskAgain } = await MediaLibrary.requestPermissionsAsync();
    
    return {
      granted: status === 'granted',
      canAskAgain,
      status: status as 'granted' | 'denied' | 'undetermined',
    };
  } catch (error) {
    console.error('Error requesting media permission:', error);
    return {
      granted: false,
      canAskAgain: false,
      status: 'denied',
    };
  }
};

/**
 * Check current media library permission status
 */
export const checkMediaPermission = async (): Promise<PermissionStatus> => {
  try {
    const { status, canAskAgain } = await MediaLibrary.getPermissionsAsync();
    
    return {
      granted: status === 'granted',
      canAskAgain,
      status: status as 'granted' | 'denied' | 'undetermined',
    };
  } catch (error) {
    console.error('Error checking media permission:', error);
    return {
      granted: false,
      canAskAgain: false,
      status: 'denied',
    };
  }
};

/**
 * Check if storage directory is accessible
 */
export const checkDirectoryAccess = async (path: string): Promise<boolean> => {
  try {
    const info = await FileSystem.getInfoAsync(path);
    return info.exists && info.isDirectory;
  } catch (error) {
    return false;
  }
};

/**
 * Get list of accessible storage paths
 */
export const getAccessibleStoragePaths = async (): Promise<string[]> => {
  const potentialPaths = [
    FileSystem.documentDirectory,
    FileSystem.cacheDirectory,
    '/storage/emulated/0/',
    '/sdcard/',
  ].filter(Boolean) as string[];

  const accessiblePaths: string[] = [];
  
  for (const path of potentialPaths) {
    try {
      const info = await FileSystem.getInfoAsync(path);
      if (info.exists) {
        accessiblePaths.push(path);
      }
    } catch (error) {
      // Path not accessible, skip
    }
  }
  
  return accessiblePaths;
};

export const PermissionService = {
  requestMediaPermission,
  checkMediaPermission,
  checkDirectoryAccess,
  getAccessibleStoragePaths,
};

export default PermissionService;
