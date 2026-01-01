// Song Item Component for Terra Media Player

import React, { memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { AudioFile } from '../../types/media';
import { Colors } from '../../utils/colors';
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
  const itemHeight = compact ? DIMENSIONS.listItemCompact : DIMENSIONS.listItem;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { height: itemHeight },
        isPlaying && styles.playingContainer,
      ]}
      onPress={() => onPress(song)}
      onLongPress={() => onLongPress?.(song)}
      activeOpacity={0.7}
    >
      {/* Album Art */}
      {showAlbumArt && (
        <View style={styles.albumArtContainer}>
          {song.albumArt ? (
            <Image
              source={{ uri: song.albumArt }}
              style={styles.albumArt}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.albumArt, styles.placeholderArt]}>
              <Text style={styles.placeholderIcon}>🎵</Text>
            </View>
          )}
          {isPlaying && (
            <View style={styles.playingIndicator}>
              <Text style={styles.playingIcon}>▶</Text>
            </View>
          )}
        </View>
      )}

      {/* Song Info */}
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
            {song.album && ` • ${song.album}`}
          </Text>
        )}
      </View>

      {/* Right Section */}
      <View style={styles.rightSection}>
        {/* Duration */}
        {showDuration && song.duration > 0 && (
          <Text style={styles.duration}>
            {formatDuration(song.duration)}
          </Text>
        )}
        
        {/* Favorite Button */}
        {onFavoritePress && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onFavoritePress(song)}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.favoriteIcon,
              song.isFavorite && styles.favoriteActive,
            ]}>
              {song.isFavorite ? '❤️' : '🤍'}
            </Text>
          </TouchableOpacity>
        )}
        
        {/* More Button */}
        {onMorePress && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onMorePress(song)}
            activeOpacity={0.7}
          >
            <Text style={styles.moreIcon}>⋮</Text>
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
    paddingHorizontal: DIMENSIONS.spacing.md,
    backgroundColor: Colors.background,
  },
  playingContainer: {
    backgroundColor: Colors.surfaceLight,
  },
  albumArtContainer: {
    position: 'relative',
    marginRight: DIMENSIONS.spacing.md,
  },
  albumArt: {
    width: DIMENSIONS.albumArt.thumbnail,
    height: DIMENSIONS.albumArt.thumbnail,
    borderRadius: DIMENSIONS.borderRadius.sm,
  },
  placeholderArt: {
    backgroundColor: Colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: {
    fontSize: 20,
  },
  playingIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.overlayLight,
    borderRadius: DIMENSIONS.borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playingIcon: {
    fontSize: 16,
    color: Colors.primary,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: DIMENSIONS.fontSize.md,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  playingText: {
    color: Colors.primary,
  },
  artist: {
    fontSize: DIMENSIONS.fontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  duration: {
    fontSize: DIMENSIONS.fontSize.sm,
    color: Colors.textTertiary,
    marginRight: DIMENSIONS.spacing.sm,
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
  favoriteActive: {
    color: Colors.accent,
  },
  moreIcon: {
    fontSize: 20,
    color: Colors.textSecondary,
  },
});

export default SongItem;
