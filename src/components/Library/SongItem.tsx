// ═══════════════════════════════════════════════════════════════════════════════
// SONG ITEM - Premium Apple-Style List Item
// Terra Media Player - Luxury & Clean Interface
// ═══════════════════════════════════════════════════════════════════════════════

import React, { memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { AudioFile } from '../../types/media';
import { Colors, Shadows, Typography } from '../../utils/colors';
import { DIMENSIONS } from '../../utils/constants';
import { formatDuration, formatArtist, formatTitle } from '../../utils/formatters';

interface SongItemProps {
  song: AudioFile;
  onPress: (song: AudioFile) => void;
  onLongPress?: (song: AudioFile) => void;
  onFavoritePress?: (song: AudioFile) => void;
  onMorePress?: (song: AudioFile) => void;
  isPlaying?: boolean;
  showAlbumArt?: boolean;
  showDuration?: boolean;
  showArtist?: boolean;
  compact?: boolean;
}

export const SongItem: React.FC<SongItemProps> = memo(({
  song,
  onPress,
  onLongPress,
  onFavoritePress,
  onMorePress,
  isPlaying = false,
  showAlbumArt = true,
  showDuration = true,
  showArtist = true,
  compact = false,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        isPlaying && styles.playingContainer,
      ]}
      onPress={() => onPress(song)}
      onLongPress={() => onLongPress?.(song)}
      activeOpacity={0.6}
    >
      {/* Album Art with Premium Styling */}
      {showAlbumArt && (
        <View style={[styles.albumArtContainer, isPlaying && styles.albumArtPlaying]}>
          {song.albumArt ? (
            <Image
              source={{ uri: song.albumArt }}
              style={styles.albumArt}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.albumArt, styles.placeholderArt]}>
              <Text style={styles.placeholderIcon}>♪</Text>
            </View>
          )}
          {isPlaying && (
            <View style={styles.playingIndicator}>
              <View style={styles.playingBars}>
                <View style={[styles.bar, styles.bar1]} />
                <View style={[styles.bar, styles.bar2]} />
                <View style={[styles.bar, styles.bar3]} />
              </View>
            </View>
          )}
        </View>
      )}

      {/* Song Info with Premium Typography */}
      <View style={styles.infoContainer}>
        <Text
          style={[styles.title, isPlaying && styles.playingText]}
          numberOfLines={1}
        >
          {formatTitle(song.title, song.fileName)}
        </Text>
        
        {showArtist && (
          <Text style={styles.artist} numberOfLines={1}>
            {formatArtist(song.artist)}
            {song.album && ` · ${song.album}`}
          </Text>
        )}
      </View>

      {/* Right Section - Premium Actions */}
      <View style={styles.rightSection}>
        {/* Duration */}
        {showDuration && song.duration > 0 && (
          <Text style={[styles.duration, isPlaying && styles.durationPlaying]}>
            {formatDuration(song.duration)}
          </Text>
        )}
        
        {/* More Button */}
        {onMorePress && (
          <TouchableOpacity
            style={styles.moreButton}
            onPress={() => onMorePress(song)}
            activeOpacity={0.6}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.moreIcon}>•••</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
});

SongItem.displayName = 'SongItem';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: DIMENSIONS.spacing.lg,
    paddingVertical: DIMENSIONS.spacing.sm,
    minHeight: DIMENSIONS.listItem,
    backgroundColor: Colors.background,
  },
  playingContainer: {
    backgroundColor: Colors.blue10,
  },
  
  // Album Art
  albumArtContainer: {
    position: 'relative',
    marginRight: DIMENSIONS.spacing.md,
    borderRadius: DIMENSIONS.borderRadius.md,
    overflow: 'hidden',
  },
  albumArtPlaying: {
    ...Shadows.glow,
  },
  albumArt: {
    width: DIMENSIONS.albumArt.thumbnail,
    height: DIMENSIONS.albumArt.thumbnail,
    borderRadius: DIMENSIONS.borderRadius.md,
  },
  placeholderArt: {
    backgroundColor: Colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: {
    fontSize: 24,
    color: Colors.textTertiary,
  },
  playingIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: DIMENSIONS.borderRadius.md,
  },
  playingBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 20,
    gap: 3,
  },
  bar: {
    width: 4,
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  bar1: {
    height: 12,
  },
  bar2: {
    height: 18,
  },
  bar3: {
    height: 8,
  },
  
  // Info Section
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: DIMENSIONS.spacing.sm,
  },
  title: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  playingText: {
    color: Colors.primary,
  },
  artist: {
    ...Typography.footnote,
    color: Colors.textSecondary,
    marginTop: 3,
  },
  
  // Right Section
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DIMENSIONS.spacing.sm,
  },
  duration: {
    ...Typography.caption1,
    color: Colors.textTertiary,
    minWidth: 40,
    textAlign: 'right',
  },
  durationPlaying: {
    color: Colors.primary,
  },
  moreButton: {
    width: DIMENSIONS.touchTarget.min,
    height: DIMENSIONS.touchTarget.min,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreIcon: {
    fontSize: 16,
    color: Colors.textTertiary,
    letterSpacing: -2,
  },
});

export default SongItem;
