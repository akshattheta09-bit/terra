// Now Playing Screen for Terra Media Player

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
import { Colors } from '../utils/colors';
import { DIMENSIONS } from '../utils/constants';
import { formatDuration } from '../utils/formatters';
import { LoopMode } from '../types/playback';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ALBUM_ART_SIZE = SCREEN_WIDTH * 0.75;

export const NowPlayingScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
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
  
  // Rotation animation for album art
  useEffect(() => {
    let animation: Animated.CompositeAnimation;
    
    if (isPlaying) {
      animation = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 20000,
          useNativeDriver: true,
        })
      );
      animation.start();
    } else {
      rotateAnim.stopAnimation();
    }
    
    return () => {
      if (animation) {
        animation.stop();
      }
    };
  }, [isPlaying, rotateAnim]);
  
  // Progress bar pan responder
  const progressPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        scaleAnim.setValue(1.1);
      },
      onPanResponderMove: (_, gestureState) => {
        const progressWidth = SCREEN_WIDTH - DIMENSIONS.spacing.xl * 2;
        const newPosition = Math.max(0, Math.min(gestureState.moveX - DIMENSIONS.spacing.xl, progressWidth));
        const percentage = newPosition / progressWidth;
        const newTime = percentage * duration;
        seekTo(newTime);
      },
      onPanResponderRelease: () => {
        scaleAnim.setValue(1);
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
      case 'all':
        return '🔁';
      case 'one':
        return '🔂';
      default:
        return '↩️';
    }
  };
  
  // Calculate progress percentage
  const progressPercentage = duration > 0 ? (position / duration) * 100 : 0;
  
  // Get rotation interpolation
  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  
  // Get current track favorite status
  const currentSong = allSongs.find(s => s.id === currentTrack?.id);
  const isFavorite = currentSong?.isFavorite || false;
  
  // Playback speed options
  const SPEED_OPTIONS = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0];
  const [showSpeedOptions, setShowSpeedOptions] = useState(false);
  
  if (!currentTrack) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🎵</Text>
          <Text style={styles.emptyTitle}>No Track Playing</Text>
          <Text style={styles.emptySubtitle}>
            Select a song from your library to start playing
          </Text>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Text style={styles.browseButtonText}>Browse Library</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.headerIcon}>▼</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Now Playing</Text>
        </View>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleAddToPlaylist}
          activeOpacity={0.7}
        >
          <Text style={styles.headerIcon}>⋮</Text>
        </TouchableOpacity>
      </View>
      
      {/* Album Art */}
      <View style={styles.albumArtContainer}>
        <Animated.View
          style={[
            styles.albumArtWrapper,
            { transform: [{ rotate }] },
          ]}
        >
          {currentTrack.albumArt ? (
            <Image
              source={{ uri: currentTrack.albumArt }}
              style={styles.albumArt}
            />
          ) : (
            <View style={[styles.albumArt, styles.placeholderArt]}>
              <Text style={styles.placeholderIcon}>🎵</Text>
            </View>
          )}
        </Animated.View>
      </View>
      
      {/* Track Info */}
      <View style={styles.trackInfo}>
        <Text style={styles.trackTitle} numberOfLines={1}>
          {currentTrack.title || currentTrack.fileName}
        </Text>
        <Text style={styles.trackArtist} numberOfLines={1}>
          {currentTrack.artist || 'Unknown Artist'}
        </Text>
        <Text style={styles.trackAlbum} numberOfLines={1}>
          {currentTrack.album || 'Unknown Album'}
        </Text>
      </View>
      
      {/* Progress Bar */}
      <View style={styles.progressContainer} {...progressPanResponder.panHandlers}>
        <View style={styles.progressBar}>
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
          <Text style={styles.timeText}>{formatDuration(duration)}</Text>
        </View>
      </View>
      
      {/* Controls */}
      <View style={styles.controls}>
        {/* Secondary Controls */}
        <View style={styles.secondaryControls}>
          <TouchableOpacity
            style={[styles.secondaryButton, isShuffleEnabled && styles.activeButton]}
            onPress={toggleShuffle}
            activeOpacity={0.7}
          >
            <Text style={styles.secondaryIcon}>🔀</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => setShowSpeedOptions(!showSpeedOptions)}
            activeOpacity={0.7}
          >
            <Text style={styles.speedText}>{playbackSpeed}x</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.secondaryButton, loopMode !== 'off' && styles.activeButton]}
            onPress={cycleLoopMode}
            activeOpacity={0.7}
          >
            <Text style={styles.secondaryIcon}>{getLoopModeIcon(loopMode)}</Text>
          </TouchableOpacity>
        </View>
        
        {/* Main Controls */}
        <View style={styles.mainControls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={skipToPrevious}
            activeOpacity={0.7}
          >
            <Text style={styles.controlIcon}>⏮</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.playButton}
            onPress={togglePlayPause}
            activeOpacity={0.8}
          >
            <Text style={styles.playIcon}>
              {isLoading ? '⏳' : isPlaying ? '⏸' : '▶️'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.controlButton}
            onPress={skipToNext}
            activeOpacity={0.7}
          >
            <Text style={styles.controlIcon}>⏭</Text>
          </TouchableOpacity>
        </View>
        
        {/* Tertiary Controls */}
        <View style={styles.tertiaryControls}>
          <TouchableOpacity
            style={[styles.tertiaryButton, isFavorite && styles.favoriteActive]}
            onPress={handleFavoritePress}
            activeOpacity={0.7}
          >
            <Text style={styles.tertiaryIcon}>{isFavorite ? '❤️' : '🤍'}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.tertiaryButton}
            onPress={handleAddToPlaylist}
            activeOpacity={0.7}
          >
            <Text style={styles.tertiaryIcon}>➕</Text>
          </TouchableOpacity>
        </View>
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
                <Text
                  style={[
                    styles.speedOptionText,
                    playbackSpeed === speed && styles.speedOptionTextActive,
                  ]}
                >
                  {speed}x
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: DIMENSIONS.spacing.md,
    paddingVertical: DIMENSIONS.spacing.sm,
  },
  headerButton: {
    padding: DIMENSIONS.spacing.sm,
  },
  headerIcon: {
    fontSize: 24,
    color: Colors.textPrimary,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: DIMENSIONS.fontSize.md,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  albumArtContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  albumArtWrapper: {
    width: ALBUM_ART_SIZE,
    height: ALBUM_ART_SIZE,
    borderRadius: ALBUM_ART_SIZE / 2,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  albumArt: {
    width: '100%',
    height: '100%',
    borderRadius: ALBUM_ART_SIZE / 2,
  },
  placeholderArt: {
    backgroundColor: Colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: {
    fontSize: 80,
  },
  trackInfo: {
    alignItems: 'center',
    paddingHorizontal: DIMENSIONS.spacing.xl,
    marginBottom: DIMENSIONS.spacing.lg,
  },
  trackTitle: {
    fontSize: DIMENSIONS.fontSize.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: DIMENSIONS.spacing.xs,
    textAlign: 'center',
  },
  trackArtist: {
    fontSize: DIMENSIONS.fontSize.md,
    color: Colors.primary,
    marginBottom: DIMENSIONS.spacing.xs,
    textAlign: 'center',
  },
  trackAlbum: {
    fontSize: DIMENSIONS.fontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  progressContainer: {
    paddingHorizontal: DIMENSIONS.spacing.xl,
    marginBottom: DIMENSIONS.spacing.md,
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 2,
    position: 'relative',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  progressKnob: {
    position: 'absolute',
    top: -6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    marginLeft: -8,
  },
  progressTime: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: DIMENSIONS.spacing.sm,
  },
  timeText: {
    fontSize: DIMENSIONS.fontSize.xs,
    color: Colors.textSecondary,
  },
  controls: {
    paddingHorizontal: DIMENSIONS.spacing.xl,
    paddingBottom: DIMENSIONS.spacing.xl,
  },
  secondaryControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: DIMENSIONS.spacing.lg,
  },
  secondaryButton: {
    padding: DIMENSIONS.spacing.md,
    marginHorizontal: DIMENSIONS.spacing.lg,
  },
  secondaryIcon: {
    fontSize: 24,
    color: Colors.textSecondary,
  },
  speedText: {
    fontSize: DIMENSIONS.fontSize.md,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  activeButton: {
    backgroundColor: Colors.primary + '30',
    borderRadius: DIMENSIONS.borderRadius.full,
  },
  mainControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: DIMENSIONS.spacing.lg,
  },
  controlButton: {
    padding: DIMENSIONS.spacing.lg,
  },
  controlIcon: {
    fontSize: 36,
    color: Colors.textPrimary,
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: DIMENSIONS.spacing.xl,
    elevation: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  playIcon: {
    fontSize: 36,
    color: Colors.white,
  },
  tertiaryControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tertiaryButton: {
    padding: DIMENSIONS.spacing.md,
    marginHorizontal: DIMENSIONS.spacing.lg,
  },
  tertiaryIcon: {
    fontSize: 24,
    color: Colors.textSecondary,
  },
  favoriteActive: {
    backgroundColor: Colors.error + '30',
    borderRadius: DIMENSIONS.borderRadius.full,
  },
  speedModal: {
    position: 'absolute',
    bottom: 200,
    left: DIMENSIONS.spacing.xl,
    right: DIMENSIONS.spacing.xl,
    backgroundColor: Colors.surface,
    borderRadius: DIMENSIONS.borderRadius.lg,
    padding: DIMENSIONS.spacing.lg,
    elevation: 8,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  speedModalTitle: {
    fontSize: DIMENSIONS.fontSize.md,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: DIMENSIONS.spacing.md,
  },
  speedOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  speedOption: {
    paddingHorizontal: DIMENSIONS.spacing.md,
    paddingVertical: DIMENSIONS.spacing.sm,
    borderRadius: DIMENSIONS.borderRadius.sm,
    marginVertical: DIMENSIONS.spacing.xs,
  },
  speedOptionActive: {
    backgroundColor: Colors.primary,
  },
  speedOptionText: {
    fontSize: DIMENSIONS.fontSize.sm,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  speedOptionTextActive: {
    color: Colors.white,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: DIMENSIONS.spacing.xl,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: DIMENSIONS.spacing.lg,
  },
  emptyTitle: {
    fontSize: DIMENSIONS.fontSize.xl,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: DIMENSIONS.spacing.sm,
  },
  emptySubtitle: {
    fontSize: DIMENSIONS.fontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: DIMENSIONS.spacing.xl,
  },
  browseButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: DIMENSIONS.spacing.xl,
    paddingVertical: DIMENSIONS.spacing.md,
    borderRadius: DIMENSIONS.borderRadius.full,
  },
  browseButtonText: {
    fontSize: DIMENSIONS.fontSize.md,
    fontWeight: '600',
    color: Colors.white,
  },
});

export default NowPlayingScreen;
