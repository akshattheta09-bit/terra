// ═══════════════════════════════════════════════════════════════════════════════
// MINI PLAYER - Premium Apple-Style Floating Player
// Terra Media Player - Luxury & Clean Interface
// ═══════════════════════════════════════════════════════════════════════════════

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useAudioPlayback } from '../../hooks/useAudioPlayback';
import { Colors, Shadows, Typography } from '../../utils/colors';
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
    <View style={styles.outerContainer}>
      {/* Progress Bar - Thin line at top */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${progressPercentage}%` }]} />
      </View>
      
      <TouchableOpacity
        style={styles.container}
        onPress={onPress}
        activeOpacity={0.95}
      >
        <View style={styles.content}>
          {/* Album Art - Premium rounded corners */}
          <View style={styles.albumArtContainer}>
            {currentTrack.albumArt ? (
              <Image
                source={{ uri: currentTrack.albumArt }}
                style={styles.albumArt}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.albumArt, styles.placeholderArt]}>
                <Text style={styles.placeholderIcon}>♪</Text>
              </View>
            )}
          </View>

          {/* Track Info - Clean typography */}
          <View style={styles.infoContainer}>
            <Text style={styles.title} numberOfLines={1}>
              {formatTitle(currentTrack.title, currentTrack.fileName)}
            </Text>
            <Text style={styles.artist} numberOfLines={1}>
              {formatArtist(currentTrack.artist)}
            </Text>
          </View>

          {/* Controls - Apple Music style */}
          <View style={styles.controls}>
            {/* Play/Pause Button */}
            <TouchableOpacity
              style={styles.playButton}
              onPress={togglePlayPause}
              activeOpacity={0.7}
            >
              {isLoading ? (
                <View style={styles.loadingIndicator}>
                  <Text style={styles.loadingDot}>●</Text>
                </View>
              ) : (
                <Text style={styles.playIcon}>
                  {isPlaying ? '⏸' : '▶'}
                </Text>
              )}
            </TouchableOpacity>

            {/* Next Button */}
            <TouchableOpacity
              style={styles.nextButton}
              onPress={skipToNext}
              activeOpacity={0.7}
            >
              <Text style={styles.nextIcon}>⏭</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    backgroundColor: Colors.surface,
    borderTopWidth: 0.5,
    borderTopColor: Colors.divider,
    ...Shadows.lg,
  },
  progressContainer: {
    height: 3,
    backgroundColor: Colors.progressTrack,
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.primary,
  },
  container: {
    height: DIMENSIONS.miniPlayer - 3,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: DIMENSIONS.spacing.md,
    gap: DIMENSIONS.spacing.md,
  },
  
  // Album Art - Premium styling
  albumArtContainer: {
    ...Shadows.sm,
  },
  albumArt: {
    width: 52,
    height: 52,
    borderRadius: DIMENSIONS.borderRadius.md,
  },
  placeholderArt: {
    backgroundColor: Colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: {
    fontSize: 22,
    color: Colors.textTertiary,
  },
  
  // Track Info
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    ...Typography.subheadBold,
    color: Colors.textPrimary,
  },
  artist: {
    ...Typography.footnote,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  
  // Controls - Apple-style
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DIMENSIONS.spacing.xs,
  },
  playButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    fontSize: 28,
    color: Colors.textPrimary,
  },
  nextButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextIcon: {
    fontSize: 22,
    color: Colors.textSecondary,
  },
  loadingIndicator: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingDot: {
    fontSize: 8,
    color: Colors.primary,
  },
});

export default MiniPlayer;
