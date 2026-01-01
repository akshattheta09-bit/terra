// Mini Player Component for Terra Media Player

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useAudioPlayback } from '../../hooks/useAudioPlayback';
import { Colors } from '../../utils/colors';
import { DIMENSIONS } from '../../utils/constants';
import { formatTitle, formatArtist } from '../../utils/formatters';

interface MiniPlayerProps {
  onPress?: () => void;
}

export const MiniPlayer: React.FC<MiniPlayerProps> = ({ onPress }) => {
  const {
    currentTrack,
    isPlaying,
    isLoading,
    duration,
    position,
    togglePlayPause,
    skipToNext,
    showMiniPlayer,
  } = useAudioPlayback();

  if (!showMiniPlayer || !currentTrack) {
    return null;
  }

  const progressPercentage = duration > 0 ? (position / duration) * 100 : 0;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.95}
    >
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View
          style={[
            styles.progressBar,
            { width: `${progressPercentage}%` },
          ]}
        />
      </View>

      <View style={styles.content}>
        {/* Album Art */}
        <View style={styles.albumArtContainer}>
          {currentTrack.albumArt ? (
            <Image
              source={{ uri: currentTrack.albumArt }}
              style={styles.albumArt}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.albumArt, styles.placeholderArt]}>
              <Text style={styles.placeholderIcon}>🎵</Text>
            </View>
          )}
        </View>

        {/* Track Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {formatTitle(currentTrack.title, currentTrack.fileName)}
          </Text>
          <Text style={styles.artist} numberOfLines={1}>
            {formatArtist(currentTrack.artist)}
          </Text>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          {/* Play/Pause Button */}
          <TouchableOpacity
            style={styles.controlButton}
            onPress={togglePlayPause}
            activeOpacity={0.7}
          >
            {isLoading ? (
              <Text style={styles.controlIcon}>⏳</Text>
            ) : (
              <Text style={styles.controlIcon}>
                {isPlaying ? '⏸️' : '▶️'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Next Button */}
          <TouchableOpacity
            style={styles.controlButton}
            onPress={skipToNext}
            activeOpacity={0.7}
          >
            <Text style={styles.controlIcon}>⏭️</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    height: DIMENSIONS.miniPlayer,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  progressContainer: {
    height: 2,
    backgroundColor: Colors.divider,
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.primary,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: DIMENSIONS.spacing.md,
  },
  albumArtContainer: {
    marginRight: DIMENSIONS.spacing.md,
  },
  albumArt: {
    width: 48,
    height: 48,
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
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: DIMENSIONS.fontSize.md,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  artist: {
    fontSize: DIMENSIONS.fontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlButton: {
    width: DIMENSIONS.touchTarget.min,
    height: DIMENSIONS.touchTarget.min,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlIcon: {
    fontSize: 24,
  },
});

export default MiniPlayer;
