// Video Item Component for Terra Media Player

import React, { memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { VideoFile } from '../../types/media';
import { Colors } from '../../utils/colors';
import { DIMENSIONS } from '../../utils/constants';
import { formatDuration, formatFileSize, formatResolution } from '../../utils/formatters';

interface VideoItemProps {
  video: VideoFile;
  onPress: (video: VideoFile) => void;
  onLongPress?: (video: VideoFile) => void;
  onFavoritePress?: (video: VideoFile) => void;
  onMorePress?: (video: VideoFile) => void;
  isGrid?: boolean;
  showProgress?: boolean;
}

export const VideoItem: React.FC<VideoItemProps> = memo(({
  video,
  onPress,
  onLongPress,
  onFavoritePress,
  onMorePress,
  isGrid = false,
  showProgress = true,
}) => {
  const progressPercentage = video.duration > 0
    ? (video.lastWatchedPosition / video.duration) * 100
    : 0;

  if (isGrid) {
    return (
      <TouchableOpacity
        style={styles.gridContainer}
        onPress={() => onPress(video)}
        onLongPress={() => onLongPress?.(video)}
        activeOpacity={0.7}
      >
        {/* Thumbnail */}
        <View style={styles.gridThumbnailContainer}>
          {video.thumbnail ? (
            <Image
              source={{ uri: video.thumbnail }}
              style={styles.gridThumbnail}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.gridThumbnail, styles.placeholderThumbnail]}>
              <Text style={styles.placeholderIcon}>🎬</Text>
            </View>
          )}
          
          {/* Duration Badge */}
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>
              {formatDuration(video.duration)}
            </Text>
          </View>
          
          {/* Progress Bar */}
          {showProgress && progressPercentage > 0 && (
            <View style={styles.progressContainer}>
              <View
                style={[
                  styles.progressBar,
                  { width: `${progressPercentage}%` },
                ]}
              />
            </View>
          )}
          
          {/* Favorite Icon */}
          {video.isFavorite && (
            <View style={styles.favoriteOverlay}>
              <Text>❤️</Text>
            </View>
          )}
        </View>
        
        {/* Video Info */}
        <View style={styles.gridInfoContainer}>
          <Text style={styles.gridTitle} numberOfLines={2}>
            {video.fileName}
          </Text>
          <Text style={styles.gridSubtitle} numberOfLines={1}>
            {formatFileSize(video.fileSize)}
            {video.width && video.height && ` • ${formatResolution(video.width, video.height)}`}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  // List view
  return (
    <TouchableOpacity
      style={styles.listContainer}
      onPress={() => onPress(video)}
      onLongPress={() => onLongPress?.(video)}
      activeOpacity={0.7}
    >
      {/* Thumbnail */}
      <View style={styles.listThumbnailContainer}>
        {video.thumbnail ? (
          <Image
            source={{ uri: video.thumbnail }}
            style={styles.listThumbnail}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.listThumbnail, styles.placeholderThumbnail]}>
            <Text style={styles.placeholderIcon}>🎬</Text>
          </View>
        )}
        
        {/* Duration Badge */}
        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>
            {formatDuration(video.duration)}
          </Text>
        </View>
        
        {/* Progress Bar */}
        {showProgress && progressPercentage > 0 && (
          <View style={styles.progressContainer}>
            <View
              style={[
                styles.progressBar,
                { width: `${progressPercentage}%` },
              ]}
            />
          </View>
        )}
      </View>

      {/* Video Info */}
      <View style={styles.listInfoContainer}>
        <Text style={styles.listTitle} numberOfLines={2}>
          {video.fileName}
        </Text>
        <Text style={styles.listSubtitle} numberOfLines={1}>
          {formatFileSize(video.fileSize)}
          {video.width && video.height && ` • ${formatResolution(video.width, video.height)}`}
        </Text>
      </View>

      {/* Right Section */}
      <View style={styles.rightSection}>
        {/* Favorite Button */}
        {onFavoritePress && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onFavoritePress(video)}
            activeOpacity={0.7}
          >
            <Text style={styles.favoriteIcon}>
              {video.isFavorite ? '❤️' : '🤍'}
            </Text>
          </TouchableOpacity>
        )}
        
        {/* More Button */}
        {onMorePress && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onMorePress(video)}
            activeOpacity={0.7}
          >
            <Text style={styles.moreIcon}>⋮</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
});

VideoItem.displayName = 'VideoItem';

const styles = StyleSheet.create({
  // Grid styles
  gridContainer: {
    width: DIMENSIONS.videoThumbnail.medium.width,
    marginBottom: DIMENSIONS.spacing.md,
  },
  gridThumbnailContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: DIMENSIONS.borderRadius.md,
    overflow: 'hidden',
  },
  gridThumbnail: {
    width: '100%',
    height: '100%',
  },
  gridInfoContainer: {
    marginTop: DIMENSIONS.spacing.sm,
  },
  gridTitle: {
    fontSize: DIMENSIONS.fontSize.sm,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  gridSubtitle: {
    fontSize: DIMENSIONS.fontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  
  // List styles
  listContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: DIMENSIONS.spacing.md,
    paddingVertical: DIMENSIONS.spacing.sm,
    backgroundColor: Colors.background,
  },
  listThumbnailContainer: {
    position: 'relative',
    width: DIMENSIONS.videoThumbnail.small.width,
    height: DIMENSIONS.videoThumbnail.small.height,
    borderRadius: DIMENSIONS.borderRadius.sm,
    overflow: 'hidden',
    marginRight: DIMENSIONS.spacing.md,
  },
  listThumbnail: {
    width: '100%',
    height: '100%',
  },
  listInfoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  listTitle: {
    fontSize: DIMENSIONS.fontSize.md,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  listSubtitle: {
    fontSize: DIMENSIONS.fontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  
  // Shared styles
  placeholderThumbnail: {
    backgroundColor: Colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: {
    fontSize: 24,
  },
  durationBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: Colors.black70,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationText: {
    fontSize: DIMENSIONS.fontSize.xs,
    color: Colors.white,
    fontWeight: '500',
  },
  progressContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: Colors.white30,
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.accent,
  },
  favoriteOverlay: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteIcon: {
    fontSize: 18,
  },
  moreIcon: {
    fontSize: 20,
    color: Colors.textSecondary,
  },
});

export default VideoItem;
