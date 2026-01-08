// ═══════════════════════════════════════════════════════════════════════════════
// TERRA MEDIA PLAYER - PREMIUM VIDEO ITEM COMPONENT
// High-quality thumbnails with loading states and premium design
// ═══════════════════════════════════════════════════════════════════════════════

import React, { memo, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { VideoFile } from '../../types/media';
import { Colors } from '../../utils/colors';
import { DIMENSIONS } from '../../utils/constants';
import { formatDuration, formatFileSize, formatResolution } from '../../utils/formatters';
import { getThumbnailUri, generateThumbnail } from '../../services/ThumbnailService';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface VideoItemProps {
  video: VideoFile;
  onPress: (video: VideoFile) => void;
  onLongPress?: (video: VideoFile) => void;
  onFavoritePress?: (video: VideoFile) => void;
  onMorePress?: (video: VideoFile) => void;
  isGrid?: boolean;
  viewMode?: 'grid' | 'list';
  showProgress?: boolean;
  style?: any;
}

// ─────────────────────────────────────────────────────────────────────────────
// Video Thumbnail Component
// ─────────────────────────────────────────────────────────────────────────────

const VideoThumbnail: React.FC<{
  video: VideoFile;
  style?: any;
  showPlayIcon?: boolean;
}> = memo(({ video, style, showPlayIcon = false }) => {
  const [thumbnailUri, setThumbnailUri] = useState<string | null>(video.thumbnail || null);
  const [isLoading, setIsLoading] = useState(!video.thumbnail);
  const [hasError, setHasError] = useState(false);
  
  // Try to load or generate thumbnail
  useEffect(() => {
    let mounted = true;
    
    const loadThumbnail = async () => {
      // If video already has thumbnail, use it
      if (video.thumbnail) {
        setThumbnailUri(video.thumbnail);
        setIsLoading(false);
        return;
      }
      
      try {
        // Try to get existing thumbnail
        const existing = await getThumbnailUri(video.id);
        if (existing && mounted) {
          setThumbnailUri(existing);
          setIsLoading(false);
          return;
        }
        
        // Generate new thumbnail
        const generated = await generateThumbnail(
          video.filePath,
          video.id
        );
        
        if (mounted) {
          if (generated) {
            setThumbnailUri(generated);
          } else {
            setHasError(true);
          }
          setIsLoading(false);
        }
      } catch (error) {
        if (mounted) {
          setHasError(true);
          setIsLoading(false);
        }
      }
    };
    
    loadThumbnail();
    
    return () => {
      mounted = false;
    };
  }, [video.id, video.filePath, video.thumbnail]);
  
  // Handle image load error
  const handleError = () => {
    setHasError(true);
    setThumbnailUri(null);
  };
  
  if (isLoading) {
    return (
      <View style={[style, styles.thumbnailPlaceholder]}>
        <ActivityIndicator size="small" color={Colors.primary} />
      </View>
    );
  }
  
  if (hasError || !thumbnailUri) {
    return (
      <View style={[style, styles.thumbnailPlaceholder]}>
        <Text style={styles.thumbnailIcon}>🎬</Text>
        {showPlayIcon && (
          <View style={styles.playOverlay}>
            <View style={styles.playIconContainer}>
              <Text style={styles.playIconText}>▶</Text>
            </View>
          </View>
        )}
      </View>
    );
  }
  
  return (
    <View style={style}>
      <Image
        source={{ uri: thumbnailUri }}
        style={styles.thumbnailImage}
        resizeMode="cover"
        onError={handleError}
      />
      {showPlayIcon && (
        <View style={styles.playOverlay}>
          <View style={styles.playIconContainer}>
            <Text style={styles.playIconText}>▶</Text>
          </View>
        </View>
      )}
    </View>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export const VideoItem: React.FC<VideoItemProps> = memo(({
  video,
  onPress,
  onLongPress,
  onFavoritePress,
  onMorePress,
  isGrid = false,
  viewMode,
  showProgress = true,
  style,
}) => {
  // Use viewMode if provided, otherwise fall back to isGrid
  const isGridView = viewMode ? viewMode === 'grid' : isGrid;
  
  // Calculate progress percentage
  const progressPercentage = video.duration > 0
    ? (video.lastWatchedPosition / video.duration) * 100
    : 0;
  
  // Format duration display
  const durationText = formatDuration(video.duration);
  
  // Get resolution text
  const resolutionText = video.width && video.height 
    ? formatResolution(video.width, video.height)
    : null;

  // ─────────────────────────────────────────────────────────────────────────
  // Grid View
  // ─────────────────────────────────────────────────────────────────────────
  
  if (isGridView) {
    return (
      <TouchableOpacity
        style={[styles.gridContainer, style]}
        onPress={() => onPress(video)}
        onLongPress={() => onLongPress?.(video)}
        activeOpacity={0.7}
      >
        {/* Thumbnail Container */}
        <View style={styles.gridThumbnailContainer}>
          <VideoThumbnail 
            video={video} 
            style={styles.gridThumbnail}
            showPlayIcon
          />
          
          {/* Duration Badge */}
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>{durationText}</Text>
          </View>
          
          {/* Resolution Badge */}
          {resolutionText && (
            <View style={styles.resolutionBadge}>
              <Text style={styles.resolutionText}>{resolutionText}</Text>
            </View>
          )}
          
          {/* Progress Bar */}
          {showProgress && progressPercentage > 0 && (
            <View style={styles.progressContainer}>
              <View
                style={[styles.progressBar, { width: `${Math.min(progressPercentage, 100)}%` }]}
              />
            </View>
          )}
          
          {/* Favorite Indicator */}
          {video.isFavorite && (
            <View style={styles.favoriteOverlay}>
              <Text style={styles.favoriteIcon}>❤️</Text>
            </View>
          )}
        </View>
        
        {/* Video Info */}
        <View style={styles.gridInfoContainer}>
          <Text style={styles.gridTitle} numberOfLines={2}>
            {video.title || video.fileName}
          </Text>
          <Text style={styles.gridSubtitle} numberOfLines={1}>
            {formatFileSize(video.fileSize)}
            {resolutionText && ` • ${resolutionText}`}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // List View
  // ─────────────────────────────────────────────────────────────────────────
  
  return (
    <TouchableOpacity
      style={[styles.listContainer, style]}
      onPress={() => onPress(video)}
      onLongPress={() => onLongPress?.(video)}
      activeOpacity={0.7}
    >
      {/* Thumbnail */}
      <View style={styles.listThumbnailContainer}>
        <VideoThumbnail 
          video={video} 
          style={styles.listThumbnail}
          showPlayIcon
        />
        
        {/* Duration Badge */}
        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>{durationText}</Text>
        </View>
        
        {/* Progress Bar */}
        {showProgress && progressPercentage > 0 && (
          <View style={styles.progressContainer}>
            <View
              style={[styles.progressBar, { width: `${Math.min(progressPercentage, 100)}%` }]}
            />
          </View>
        )}
      </View>

      {/* Video Info */}
      <View style={styles.listInfoContainer}>
        <Text style={styles.listTitle} numberOfLines={2}>
          {video.title || video.fileName}
        </Text>
        <View style={styles.listMetaRow}>
          <Text style={styles.listSubtitle} numberOfLines={1}>
            {formatFileSize(video.fileSize)}
          </Text>
          {resolutionText && (
            <>
              <Text style={styles.listDot}>•</Text>
              <Text style={styles.listSubtitle}>{resolutionText}</Text>
            </>
          )}
        </View>
        {progressPercentage > 0 && (
          <Text style={styles.watchedText}>
            {Math.round(progressPercentage)}% watched
          </Text>
        )}
      </View>

      {/* Right Section - Actions */}
      <View style={styles.rightSection}>
        {/* Favorite Indicator or Button */}
        {(video.isFavorite || onFavoritePress) && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onFavoritePress?.(video)}
            activeOpacity={0.7}
            disabled={!onFavoritePress}
          >
            <Text style={styles.actionIcon}>
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

// ═══════════════════════════════════════════════════════════════════════════════
// STYLES - Premium Design
// ═══════════════════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  // Thumbnail Shared
  thumbnailPlaceholder: {
    backgroundColor: Colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailIcon: {
    fontSize: 32,
    opacity: 0.6,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  playIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  playIconText: {
    fontSize: 18,
    color: '#000',
    marginLeft: 3,
  },
  
  // Grid styles
  gridContainer: {
    marginBottom: DIMENSIONS.spacing.md,
  },
  gridThumbnailContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: DIMENSIONS.borderRadius.md,
    overflow: 'hidden',
    backgroundColor: Colors.surfaceLight,
  },
  gridThumbnail: {
    width: '100%',
    height: '100%',
  },
  gridInfoContainer: {
    marginTop: DIMENSIONS.spacing.sm,
    paddingHorizontal: 2,
  },
  gridTitle: {
    fontSize: DIMENSIONS.fontSize.sm,
    fontWeight: '600',
    color: Colors.textPrimary,
    lineHeight: 18,
  },
  gridSubtitle: {
    fontSize: DIMENSIONS.fontSize.xs,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  
  // List styles
  listContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: DIMENSIONS.spacing.md,
    paddingVertical: DIMENSIONS.spacing.sm + 2,
    backgroundColor: Colors.background,
  },
  listThumbnailContainer: {
    position: 'relative',
    width: 140,
    height: 80,
    borderRadius: DIMENSIONS.borderRadius.md,
    overflow: 'hidden',
    marginRight: DIMENSIONS.spacing.md,
    backgroundColor: Colors.surfaceLight,
  },
  listThumbnail: {
    width: '100%',
    height: '100%',
  },
  listInfoContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: DIMENSIONS.spacing.sm,
  },
  listTitle: {
    fontSize: DIMENSIONS.fontSize.md,
    fontWeight: '600',
    color: Colors.textPrimary,
    lineHeight: 20,
    marginBottom: 4,
  },
  listMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listSubtitle: {
    fontSize: DIMENSIONS.fontSize.sm,
    color: Colors.textSecondary,
  },
  listDot: {
    fontSize: DIMENSIONS.fontSize.sm,
    color: Colors.textSecondary,
    marginHorizontal: 6,
  },
  watchedText: {
    fontSize: DIMENSIONS.fontSize.xs,
    color: Colors.primary,
    marginTop: 4,
    fontWeight: '500',
  },
  
  // Badges
  durationBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  durationText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '600',
  },
  resolutionBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  resolutionText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '700',
  },
  
  // Progress
  progressContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.primary,
  },
  
  // Favorite
  favoriteOverlay: {
    position: 'absolute',
    top: 6,
    right: 6,
  },
  favoriteIcon: {
    fontSize: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  
  // Actions
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 18,
  },
  moreIcon: {
    fontSize: 22,
    color: Colors.textSecondary,
    fontWeight: '700',
  },
});

export default VideoItem;
