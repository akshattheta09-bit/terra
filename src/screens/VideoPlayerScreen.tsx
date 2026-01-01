// Video Player Screen for Terra Media Player

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  ActivityIndicator,
  BackHandler,
  Animated,
} from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import {
  setVideoCurrentVideo,
  setVideoIsPlaying,
  setVideoPosition,
  setVideoDuration,
  updateVideoProgress,
  toggleVideoFavorite,
} from '../store';
import { Colors } from '../utils/colors';
import { DIMENSIONS } from '../utils/constants';
import { formatDuration } from '../utils/formatters';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type VideoPlayerParams = {
  VideoPlayer: { videoId: number };
};

export const VideoPlayerScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<VideoPlayerParams, 'VideoPlayer'>>();
  const dispatch = useAppDispatch();
  
  const { videoId } = route.params;
  
  const { allVideos } = useAppSelector(state => state.video);
  const currentVideo = allVideos.find(v => v.id === videoId);
  
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekPosition, setSeekPosition] = useState(0);
  
  const controlsTimeout = useRef<NodeJS.Timeout | null>(null);
  const controlsOpacity = useRef(new Animated.Value(1)).current;
  
  // Initialize video player
  const player = useVideoPlayer(currentVideo?.filePath || '', (player) => {
    player.loop = false;
    player.play();
  });
  
  // Track position and duration
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Update playback state
  useEffect(() => {
    if (player) {
      const interval = setInterval(() => {
        setPosition(player.currentTime * 1000);
        setDuration(player.duration * 1000);
        setIsPlaying(player.playing);
      }, 500);
      
      return () => clearInterval(interval);
    }
  }, [player]);
  
  // Set current video in store
  useEffect(() => {
    if (currentVideo) {
      dispatch(setVideoCurrentVideo(currentVideo));
    }
  }, [currentVideo, dispatch]);
  
  // Handle back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      handleClose();
      return true;
    });
    
    return () => backHandler.remove();
  }, []);
  
  // Auto-hide controls
  const resetControlsTimeout = useCallback(() => {
    if (controlsTimeout.current) {
      clearTimeout(controlsTimeout.current);
    }
    
    controlsTimeout.current = setTimeout(() => {
      if (isPlaying) {
        hideControls();
      }
    }, 3000);
  }, [isPlaying]);
  
  const showControlsHandler = useCallback(() => {
    Animated.timing(controlsOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
    setShowControls(true);
    resetControlsTimeout();
  }, [controlsOpacity, resetControlsTimeout]);
  
  const hideControls = useCallback(() => {
    Animated.timing(controlsOpacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setShowControls(false));
  }, [controlsOpacity]);
  
  // Toggle controls on tap
  const handleVideoPress = useCallback(() => {
    if (showControls) {
      hideControls();
    } else {
      showControlsHandler();
    }
  }, [showControls, hideControls, showControlsHandler]);
  
  // Play/pause toggle
  const handlePlayPause = useCallback(() => {
    if (player) {
      if (isPlaying) {
        player.pause();
      } else {
        player.play();
      }
    }
    resetControlsTimeout();
  }, [player, isPlaying, resetControlsTimeout]);
  
  // Seek forward/backward
  const handleSeekForward = useCallback(() => {
    if (player) {
      const newPosition = Math.min(player.currentTime + 10, player.duration);
      player.seekBy(10);
    }
    resetControlsTimeout();
  }, [player, resetControlsTimeout]);
  
  const handleSeekBackward = useCallback(() => {
    if (player) {
      player.seekBy(-10);
    }
    resetControlsTimeout();
  }, [player, resetControlsTimeout]);
  
  // Progress bar seek
  const handleProgressSeek = useCallback((percentage: number) => {
    if (player && duration > 0) {
      const newPosition = (percentage * duration) / 1000;
      player.currentTime = newPosition;
    }
  }, [player, duration]);
  
  // Handle close
  const handleClose = useCallback(() => {
    if (currentVideo && position > 0) {
      dispatch(updateVideoProgress({ videoId: currentVideo.id, position }));
    }
    navigation.goBack();
  }, [currentVideo, position, dispatch, navigation]);
  
  // Toggle favorite
  const handleFavoritePress = useCallback(() => {
    if (currentVideo) {
      dispatch(toggleVideoFavorite(currentVideo.id));
    }
  }, [currentVideo, dispatch]);
  
  // Calculate progress percentage
  const progressPercentage = duration > 0 ? (position / duration) * 100 : 0;
  
  if (!currentVideo) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Video not found</Text>
        <TouchableOpacity
          style={styles.errorButton}
          onPress={handleClose}
          activeOpacity={0.7}
        >
          <Text style={styles.errorButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      
      {/* Video */}
      <TouchableOpacity
        style={styles.videoContainer}
        onPress={handleVideoPress}
        activeOpacity={1}
      >
        <VideoView
          style={styles.video}
          player={player}
          contentFit="contain"
          nativeControls={false}
        />
        
        {/* Loading Indicator */}
        {(isLoading || isBuffering) && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        )}
      </TouchableOpacity>
      
      {/* Controls Overlay */}
      {showControls && (
        <Animated.View style={[styles.controlsOverlay, { opacity: controlsOpacity }]}>
          {/* Top Bar */}
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.topButton}
              onPress={handleClose}
              activeOpacity={0.7}
            >
              <Text style={styles.topIcon}>←</Text>
            </TouchableOpacity>
            
            <View style={styles.topCenter}>
              <Text style={styles.videoTitle} numberOfLines={1}>
                {currentVideo.title || currentVideo.fileName}
              </Text>
            </View>
            
            <TouchableOpacity
              style={styles.topButton}
              onPress={handleFavoritePress}
              activeOpacity={0.7}
            >
              <Text style={styles.topIcon}>
                {currentVideo.isFavorite ? '❤️' : '🤍'}
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Center Controls */}
          <View style={styles.centerControls}>
            <TouchableOpacity
              style={styles.seekButton}
              onPress={handleSeekBackward}
              activeOpacity={0.7}
            >
              <Text style={styles.seekIcon}>⏪</Text>
              <Text style={styles.seekText}>10</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.playButton}
              onPress={handlePlayPause}
              activeOpacity={0.8}
            >
              <Text style={styles.playIcon}>
                {isPlaying ? '⏸' : '▶️'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.seekButton}
              onPress={handleSeekForward}
              activeOpacity={0.7}
            >
              <Text style={styles.seekIcon}>⏩</Text>
              <Text style={styles.seekText}>10</Text>
            </TouchableOpacity>
          </View>
          
          {/* Bottom Bar */}
          <View style={styles.bottomBar}>
            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <TouchableOpacity
                style={styles.progressBarWrapper}
                onPress={(e) => {
                  const { locationX } = e.nativeEvent;
                  const percentage = locationX / (SCREEN_WIDTH - DIMENSIONS.spacing.md * 2);
                  handleProgressSeek(Math.max(0, Math.min(1, percentage)));
                }}
                activeOpacity={1}
              >
                <View style={styles.progressBar}>
                  <View
                    style={[styles.progressFill, { width: `${progressPercentage}%` }]}
                  />
                  <View
                    style={[
                      styles.progressKnob,
                      { left: `${progressPercentage}%` },
                    ]}
                  />
                </View>
              </TouchableOpacity>
              
              <View style={styles.timeContainer}>
                <Text style={styles.timeText}>{formatDuration(position)}</Text>
                <Text style={styles.timeText}>{formatDuration(duration)}</Text>
              </View>
            </View>
            
            {/* Bottom Controls */}
            <View style={styles.bottomControls}>
              <TouchableOpacity style={styles.bottomButton} activeOpacity={0.7}>
                <Text style={styles.bottomIcon}>🔊</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.bottomButton} activeOpacity={0.7}>
                <Text style={styles.bottomIcon}>⚙️</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.bottomButton} activeOpacity={0.7}>
                <Text style={styles.bottomIcon}>⛶</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  videoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  controlsOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: DIMENSIONS.spacing.xl,
    paddingHorizontal: DIMENSIONS.spacing.md,
    paddingBottom: DIMENSIONS.spacing.md,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  topButton: {
    padding: DIMENSIONS.spacing.sm,
  },
  topIcon: {
    fontSize: 24,
    color: Colors.white,
  },
  topCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: DIMENSIONS.spacing.md,
  },
  videoTitle: {
    fontSize: DIMENSIONS.fontSize.md,
    fontWeight: '600',
    color: Colors.white,
  },
  centerControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  seekButton: {
    alignItems: 'center',
    padding: DIMENSIONS.spacing.lg,
    marginHorizontal: DIMENSIONS.spacing.xl,
  },
  seekIcon: {
    fontSize: 32,
    color: Colors.white,
  },
  seekText: {
    fontSize: DIMENSIONS.fontSize.xs,
    color: Colors.white,
    marginTop: DIMENSIONS.spacing.xs,
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    fontSize: 40,
    color: Colors.white,
  },
  bottomBar: {
    paddingHorizontal: DIMENSIONS.spacing.md,
    paddingBottom: DIMENSIONS.spacing.xl,
    paddingTop: DIMENSIONS.spacing.md,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  progressContainer: {
    marginBottom: DIMENSIONS.spacing.md,
  },
  progressBarWrapper: {
    paddingVertical: DIMENSIONS.spacing.sm,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    position: 'relative',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.secondary,
    borderRadius: 2,
  },
  progressKnob: {
    position: 'absolute',
    top: -6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.secondary,
    marginLeft: -8,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: DIMENSIONS.spacing.sm,
  },
  timeText: {
    fontSize: DIMENSIONS.fontSize.sm,
    color: Colors.white,
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bottomButton: {
    padding: DIMENSIONS.spacing.sm,
    marginLeft: DIMENSIONS.spacing.md,
  },
  bottomIcon: {
    fontSize: 24,
    color: Colors.white,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  errorText: {
    fontSize: DIMENSIONS.fontSize.lg,
    color: Colors.textPrimary,
    marginBottom: DIMENSIONS.spacing.lg,
  },
  errorButton: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: DIMENSIONS.spacing.xl,
    paddingVertical: DIMENSIONS.spacing.md,
    borderRadius: DIMENSIONS.borderRadius.full,
  },
  errorButtonText: {
    fontSize: DIMENSIONS.fontSize.md,
    fontWeight: '600',
    color: Colors.white,
  },
});

export default VideoPlayerScreen;
