// ═══════════════════════════════════════════════════════════════════════════════
// NOW PLAYING SCREEN - Premium Apple Music-Style Full Screen Player
// Terra Media Player - Luxury & Clean Interface
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useCallback, useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { useAudioPlayback } from '../hooks/useAudioPlayback';
import { toggleFavorite, openAddToPlaylistModal } from '../store';
import { Colors, Shadows, Typography } from '../utils/colors';
import { DIMENSIONS } from '../utils/constants';
import { formatDuration } from '../utils/formatters';
import { LoopMode } from '../types/playback';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const ALBUM_ART_SIZE = SCREEN_WIDTH - DIMENSIONS.spacing.xxl * 2;

export const NowPlayingScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  const {
    currentTrack,
    isPlaying,
    position,
    duration,
    isLoading,
    isShuffleEnabled,
    loopMode,
    playbackSpeed,
    volume,
    togglePlayPause,
    skipToNext,
    skipToPrevious,
    seekTo,
    toggleShuffle,
    cycleLoopMode,
    setPlaybackSpeed,
    setVolume,
  } = useAudioPlayback();
  
  const { allSongs } = useAppSelector(state => state.audio);
  
  // Pulse animation for playing state
  useEffect(() => {
    let animation: Animated.CompositeAnimation;
    
    if (isPlaying) {
      animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.02,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
    } else {
      pulseAnim.setValue(1);
    }
    
    return () => animation?.stop();
  }, [isPlaying, pulseAnim]);
  
  // Progress bar pan responder
  const progressPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        Animated.spring(scaleAnim, {
          toValue: 1.2,
          useNativeDriver: true,
        }).start();
      },
      onPanResponderMove: (_, gestureState) => {
        const progressWidth = SCREEN_WIDTH - DIMENSIONS.spacing.xl * 2;
        const newPosition = Math.max(0, Math.min(gestureState.moveX - DIMENSIONS.spacing.xl, progressWidth));
        const percentage = newPosition / progressWidth;
        const newTime = percentage * duration;
        seekTo(newTime);
      },
      onPanResponderRelease: () => {
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
        }).start();
      },
    })
  ).current;
  
  // Handle toggle favorite
  const handleFavoritePress = useCallback(() => {
    if (currentTrack) {
      dispatch(toggleFavorite(currentTrack.id));
    }
  }, [currentTrack, dispatch]);
  
  // Handle add to playlist
  const handleAddToPlaylist = useCallback(() => {
    if (currentTrack) {
      dispatch(openAddToPlaylistModal(currentTrack.id));
    }
  }, [currentTrack, dispatch]);
  
  // Get loop mode icon
  const getLoopModeIcon = (mode: LoopMode) => {
    switch (mode) {
      case 'all': return '🔁';
      case 'one': return '🔂';
      default: return '↩';
    }
  };
  
  // Calculate progress percentage
  const progressPercentage = duration > 0 ? (position / duration) * 100 : 0;
  
  // Get current track favorite status
  const currentSong = allSongs.find(s => s.id === currentTrack?.id);
  const isFavorite = currentSong?.isFavorite || false;
  
  // Speed options
  const [showSpeedOptions, setShowSpeedOptions] = useState(false);
  const SPEED_OPTIONS: Array<0.5 | 0.75 | 1 | 1.25 | 1.5 | 2> = [0.5, 0.75, 1, 1.25, 1.5, 2];
  
  if (!currentTrack) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Text style={styles.emptyIcon}>🎵</Text>
          </View>
          <Text style={styles.emptyTitle}>Nothing Playing</Text>
          <Text style={styles.emptySubtitle}>
            Choose something from your library
          </Text>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Text style={styles.browseButtonText}>Browse Library</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Premium Header - Minimal */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.chevronIcon}>⌄</Text>
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.headerLabel}>PLAYING FROM</Text>
          <Text style={styles.headerSource} numberOfLines={1}>
            {currentTrack.album || 'Library'}
          </Text>
        </View>
        
        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleAddToPlaylist}
          activeOpacity={0.7}
        >
          <Text style={styles.menuIcon}>•••</Text>
        </TouchableOpacity>
      </View>
      
      {/* Premium Album Art - Large with Shadow */}
      <View style={styles.albumArtSection}>
        <Animated.View
          style={[
            styles.albumArtContainer,
            { transform: [{ scale: pulseAnim }] },
          ]}
        >
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
        </Animated.View>
      </View>
      
      {/* Track Info Section */}
      <View style={styles.trackInfoSection}>
        <View style={styles.trackInfoRow}>
          <View style={styles.trackTextContainer}>
            <Text style={styles.trackTitle} numberOfLines={1}>
              {currentTrack.title || currentTrack.fileName}
            </Text>
            <Text style={styles.trackArtist} numberOfLines={1}>
              {currentTrack.artist || 'Unknown Artist'}
            </Text>
          </View>
          
          {/* Favorite Button */}
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={handleFavoritePress}
            activeOpacity={0.7}
          >
            <Text style={[styles.favoriteIcon, isFavorite && styles.favoriteActive]}>
              {isFavorite ? '♥' : '♡'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Premium Progress Bar */}
      <View style={styles.progressSection} {...progressPanResponder.panHandlers}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
          <Animated.View
            style={[
              styles.progressKnob,
              {
                left: `${progressPercentage}%`,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          />
        </View>
        <View style={styles.progressTime}>
          <Text style={styles.timeText}>{formatDuration(position)}</Text>
          <Text style={styles.timeText}>-{formatDuration(Math.max(0, duration - position))}</Text>
        </View>
      </View>
      
      {/* Main Playback Controls */}
      <View style={styles.controlsSection}>
        <View style={styles.mainControls}>
          <TouchableOpacity
            style={styles.skipButton}
            onPress={skipToPrevious}
            activeOpacity={0.7}
          >
            <Text style={styles.skipIcon}>⏮</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.playButton}
            onPress={togglePlayPause}
            activeOpacity={0.85}
          >
            <View style={styles.playButtonInner}>
              <Text style={styles.playIcon}>
                {isLoading ? '●' : isPlaying ? '⏸' : '▶'}
              </Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.skipButton}
            onPress={skipToNext}
            activeOpacity={0.7}
          >
            <Text style={styles.skipIcon}>⏭</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Secondary Controls - Bottom */}
      <View style={styles.secondaryControls}>
        <TouchableOpacity
          style={[styles.secondaryButton, isShuffleEnabled && styles.activeButton]}
          onPress={toggleShuffle}
          activeOpacity={0.7}
        >
          <Text style={[styles.secondaryIcon, isShuffleEnabled && styles.activeIcon]}>🔀</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => setShowSpeedOptions(!showSpeedOptions)}
          activeOpacity={0.7}
        >
          <Text style={styles.speedText}>{playbackSpeed}×</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.secondaryButton, loopMode !== 'none' && styles.activeButton]}
          onPress={cycleLoopMode}
          activeOpacity={0.7}
        >
          <Text style={[styles.secondaryIcon, loopMode !== 'none' && styles.activeIcon]}>
            {getLoopModeIcon(loopMode)}
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Speed Options Modal */}
      {showSpeedOptions && (
        <View style={styles.speedModal}>
          <Text style={styles.speedModalTitle}>Playback Speed</Text>
          <View style={styles.speedOptions}>
            {SPEED_OPTIONS.map(speed => (
              <TouchableOpacity
                key={speed}
                style={[
                  styles.speedOption,
                  playbackSpeed === speed && styles.speedOptionActive,
                ]}
                onPress={() => {
                  setPlaybackSpeed(speed);
                  setShowSpeedOptions(false);
                }}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.speedOptionText,
                  playbackSpeed === speed && styles.speedOptionTextActive,
                ]}>
                  {speed}×
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: DIMENSIONS.spacing.lg,
    paddingVertical: DIMENSIONS.spacing.md,
  },
  headerButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chevronIcon: {
    fontSize: 28,
    color: Colors.textSecondary,
    fontWeight: '300',
  },
  menuIcon: {
    fontSize: 18,
    color: Colors.textSecondary,
    letterSpacing: -1,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerLabel: {
    ...Typography.caption2,
    color: Colors.textTertiary,
    letterSpacing: 1,
    marginBottom: 2,
  },
  headerSource: {
    ...Typography.footnote,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  
  // Album Art Section
  albumArtSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: DIMENSIONS.spacing.xxl,
    paddingBottom: DIMENSIONS.spacing.lg,
  },
  albumArtContainer: {
    width: ALBUM_ART_SIZE,
    height: ALBUM_ART_SIZE,
    borderRadius: DIMENSIONS.borderRadius.xl,
    ...Shadows.xl,
  },
  albumArt: {
    width: '100%',
    height: '100%',
    borderRadius: DIMENSIONS.borderRadius.xl,
  },
  placeholderArt: {
    backgroundColor: Colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: {
    fontSize: 80,
    color: Colors.textTertiary,
  },
  
  // Track Info
  trackInfoSection: {
    paddingHorizontal: DIMENSIONS.spacing.xl,
    marginBottom: DIMENSIONS.spacing.lg,
  },
  trackInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trackTextContainer: {
    flex: 1,
  },
  trackTitle: {
    ...Typography.title2,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  trackArtist: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  favoriteButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteIcon: {
    fontSize: 28,
    color: Colors.textTertiary,
  },
  favoriteActive: {
    color: Colors.favorite,
  },
  
  // Progress
  progressSection: {
    paddingHorizontal: DIMENSIONS.spacing.xl,
    marginBottom: DIMENSIONS.spacing.lg,
  },
  progressTrack: {
    height: 6,
    backgroundColor: Colors.progressTrack,
    borderRadius: 3,
    position: 'relative',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  progressKnob: {
    position: 'absolute',
    top: -5,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.white,
    marginLeft: -8,
    ...Shadows.sm,
  },
  progressTime: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: DIMENSIONS.spacing.sm,
  },
  timeText: {
    ...Typography.caption1,
    color: Colors.textTertiary,
  },
  
  // Main Controls
  controlsSection: {
    paddingHorizontal: DIMENSIONS.spacing.xl,
    marginBottom: DIMENSIONS.spacing.xl,
  },
  mainControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: DIMENSIONS.spacing.xxl,
  },
  skipButton: {
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipIcon: {
    fontSize: 36,
    color: Colors.textPrimary,
  },
  playButton: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonInner: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.lg,
  },
  playIcon: {
    fontSize: 32,
    color: Colors.black,
    marginLeft: 2,
  },
  
  // Secondary Controls
  secondaryControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: DIMENSIONS.spacing.xxl,
    paddingBottom: DIMENSIONS.spacing.xl,
    gap: DIMENSIONS.spacing.xxl,
  },
  secondaryButton: {
    width: 56,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeButton: {
    backgroundColor: Colors.blue10,
    borderRadius: DIMENSIONS.borderRadius.lg,
  },
  secondaryIcon: {
    fontSize: 22,
    color: Colors.textTertiary,
  },
  activeIcon: {
    color: Colors.primary,
  },
  speedText: {
    ...Typography.subheadBold,
    color: Colors.textSecondary,
  },
  
  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: DIMENSIONS.spacing.xxl,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: DIMENSIONS.spacing.xl,
    ...Shadows.md,
  },
  emptyIcon: {
    fontSize: 56,
  },
  emptyTitle: {
    ...Typography.title2,
    color: Colors.textPrimary,
    marginBottom: DIMENSIONS.spacing.sm,
  },
  emptySubtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: DIMENSIONS.spacing.xl,
  },
  browseButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: DIMENSIONS.spacing.xl,
    paddingVertical: DIMENSIONS.spacing.md,
    borderRadius: DIMENSIONS.borderRadius.full,
    ...Shadows.glow,
  },
  browseButtonText: {
    ...Typography.headline,
    color: Colors.white,
  },
  
  // Speed Modal
  speedModal: {
    position: 'absolute',
    bottom: 150,
    left: DIMENSIONS.spacing.xl,
    right: DIMENSIONS.spacing.xl,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: DIMENSIONS.borderRadius.xl,
    padding: DIMENSIONS.spacing.lg,
    ...Shadows.xl,
  },
  speedModalTitle: {
    ...Typography.headline,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: DIMENSIONS.spacing.md,
  },
  speedOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: DIMENSIONS.spacing.sm,
  },
  speedOption: {
    paddingHorizontal: DIMENSIONS.spacing.md,
    paddingVertical: DIMENSIONS.spacing.sm,
    borderRadius: DIMENSIONS.borderRadius.md,
    backgroundColor: Colors.surfaceLight,
  },
  speedOptionActive: {
    backgroundColor: Colors.primary,
  },
  speedOptionText: {
    ...Typography.subhead,
    color: Colors.textSecondary,
  },
  speedOptionTextActive: {
    color: Colors.white,
    fontWeight: '600',
  },
});

export default NowPlayingScreen;
