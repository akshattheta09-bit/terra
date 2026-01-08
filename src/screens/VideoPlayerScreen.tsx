// ═══════════════════════════════════════════════════════════════════════════════
// TERRA MEDIA PLAYER - PREMIUM VIDEO PLAYER SCREEN
// Fixed: Touch, Layout, PiP, Queue, Lock Screen, Customizable Subtitles
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  BackHandler,
  Animated,
  Modal,
  Platform,
  Alert,
  FlatList,
  Image,
  useWindowDimensions,
} from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as ScreenOrientation from 'expo-screen-orientation';
import { MaterialCommunityIcons, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import {
  setVideoCurrentVideo,
  setVideoIsPlaying,
  toggleVideoFavorite,
  setVideoLoopMode,
} from '../store';
import { updateWatchPosition } from '../store/videoSlice';
import { Colors } from '../utils/colors';
import { formatDuration } from '../utils/formatters';
import { VideoFile } from '../types/media';
import { LoopMode, PlaybackSpeed, PLAYBACK_SPEEDS } from '../types/playback';

import {
  registerPlayer,
  jumpToIndex,
  nextVideo as serviceNextVideo,
  previousVideo as servicePreviousVideo,
  setVideoQueue as setServiceVideoQueue,
  initializeVideoService,
  cleanupVideoService,
  setLoopMode as setServiceLoopMode,
  getQueueState,
  toggleShuffle as toggleServiceShuffle,
  getVideoAtIndex,
} from '../services/VideoPlaybackService';
import ProScrubber from '../components/Player/ProScrubber';

// Gesture & Animation Imports
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
// Use alias for Reanimated to avoid conflict with React Native Animated if needed, 
// though RN Animated is used for Controls Opacity.
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolate,
  cancelAnimation,
} from 'react-native-reanimated';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type VideoPlayerParams = {
  VideoPlayer: {
    videoId: number;
    playlistVideos?: VideoFile[];
    startIndex?: number;
  };
};

type GestureType = 'none' | 'brightness' | 'volume' | 'seek';
type AspectRatioMode = 'contain' | 'cover';

interface Subtitle {
  id: number;
  startTime: number;
  endTime: number;
  text: string;
}

// Subtitle Settings Types
type SubSize = 14 | 18 | 24;
type SubColor = 'white' | 'yellow' | 'cyan';
type SubBg = 'black' | 'transparent' | 'semi';

interface SubtitleSettings {
  size: SubSize;
  color: SubColor;
  bg: SubBg;
  bottomOffset: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export const VideoPlayerScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<VideoPlayerParams, 'VideoPlayer'>>();
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  const { videoId, playlistVideos, startIndex = 0 } = route.params;

  const { allVideos } = useAppSelector(state => state.video);
  const videoPlaybackState = useAppSelector(state => state.videoPlayback);

  // ─────────────────────────────────────────────────────────────────────────
  // State
  // ─────────────────────────────────────────────────────────────────────────

  const [currentVideo, setCurrentVideo] = useState<VideoFile | null>(null);
  const [videoQueue, setVideoQueueState] = useState<VideoFile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Playback
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<PlaybackSpeed>(1);

  // Controls & UI
  const [showControls, setShowControls] = useState(true);
  const [controlsLocked, setControlsLocked] = useState(false);
  const [loopMode, setLoopMode] = useState<LoopMode>('none');
  const [shuffleEnabled, setShuffleEnabled] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<AspectRatioMode>('contain');

  // Volume & Brightness
  const [volume, setVolume] = useState(1);
  const [brightness, setBrightness] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  // Gesture UI
  const [gestureType, setGestureType] = useState<GestureType>('none');
  const [gestureValue, setGestureValue] = useState(0);
  const [seekPreview, setSeekPreview] = useState(0);
  const [showDoubleTap, setShowDoubleTap] = useState<'left' | 'right' | null>(null);

  // Subtitles
  const [subtitles, setSubtitles] = useState<Subtitle[]>([]);
  const [currentSubtitle, setCurrentSubtitle] = useState<string | null>(null);
  const [subtitleDelay, setSubtitleDelay] = useState(0);

  // Subtitle Customization
  const [subSettings, setSubSettings] = useState<SubtitleSettings>({
    size: 18,
    color: 'white',
    bg: 'semi',
    bottomOffset: 80,
  });

  // Modals
  const [showSpeedModal, setShowSpeedModal] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [showQueueModal, setShowQueueModal] = useState(false);
  const [showSubtitleModal, setShowSubtitleModal] = useState(false);
  const [resumePosition, setResumePosition] = useState(0);

  // Audio-Only Mode (Battery Saver)
  const [audioOnlyMode, setAudioOnlyMode] = useState(false);

  // Refs
  const controlsTimeout = useRef<NodeJS.Timeout | null>(null);
  // Using RN Animated for controls fade (as requested/legacy, kept for stability)
  const controlsOpacity = useRef(new Animated.Value(1)).current;

  // ─────────────────────────────────────────────────────────────────────────
  // Reanimated Shared Values
  // ─────────────────────────────────────────────────────────────────────────

  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);
  const focalX = useSharedValue(0);
  const focalY = useSharedValue(0);

  const volumeSv = useSharedValue(1);
  const brightnessSv = useSharedValue(1);

  // Helper SharedValues for gestures start state
  const startVolumeSv = useSharedValue(1);
  const startBrightnessSv = useSharedValue(1);

  // ─────────────────────────────────────────────────────────────────────────
  // Video Player Init (Hoisted for Gesture usage)
  // ─────────────────────────────────────────────────────────────────────────

  // ─────────────────────────────────────────────────────────────────────────
  // Video Player Init (Hoisted for Gesture usage)
  // ─────────────────────────────────────────────────────────────────────────

  // Initialize with NULL source. The Service will take over and call .replace()
  // with correct source + metadata.
  const player = useVideoPlayer(null, (player) => {
    player.loop = loopMode === 'one';
    player.volume = isMuted ? 0 : volume;
    player.timeUpdateEventInterval = 0.5;
    // Note: We don't auto-play here because source is null initially.
    // Service will trigger play.
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Control Helpers
  // ─────────────────────────────────────────────────────────────────────────

  const resetControlsTimeout = useCallback(() => {
    if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
    if (!controlsLocked) {
      controlsTimeout.current = setTimeout(() => {
        if (isPlaying) hideControls();
      }, 4000);
    }
  }, [isPlaying, controlsLocked]);

  const showControlsHandler = useCallback(() => {
    setShowControls(true);
    Animated.timing(controlsOpacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    resetControlsTimeout();
  }, [controlsOpacity, resetControlsTimeout]);

  const hideControls = useCallback(() => {
    if (controlsLocked) return;
    Animated.timing(controlsOpacity, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
      setShowControls(false);
    });
  }, [controlsOpacity, controlsLocked]);

  const handlePlayPause = () => {
    if (player) {
      if (isPlaying) player.pause();
      else player.play();
    }
    resetControlsTimeout();
  };

  const handleSeekForward = () => {
    if (player) {
      const newTime = Math.min(player.currentTime + 10, player.duration);
      player.currentTime = newTime;
      setShowDoubleTap('right');
      setTimeout(() => setShowDoubleTap(null), 600);
    }
    resetControlsTimeout();
  };

  const handleSeekBackward = () => {
    if (player) {
      const newTime = Math.max(player.currentTime - 10, 0);
      player.currentTime = newTime;
      setShowDoubleTap('left');
      setTimeout(() => setShowDoubleTap(null), 600);
    }
    resetControlsTimeout();
  };

  const handleNextVideo = () => {
    // Service handles actual player change
    serviceNextVideo();
    resetControlsTimeout();
  };

  const handlePreviousVideo = () => {
    // Service handles actual player change
    servicePreviousVideo();
    resetControlsTimeout();
  };

  const handlePiP = async () => {
    if (player) {
      if (Platform.OS === 'ios') {
        (player as any).startPictureInPicture();
      } else {
        Alert.alert("PiP Mode", "Minimize the app to enter Picture-in-Picture.");
      }
    }
  };

  const parseSRT = (content: string): Subtitle[] => {
    const subs: Subtitle[] = [];
    const blocks = content.trim().split(/\n\s*\n/);
    blocks.forEach((block, index) => {
      const lines = block.split('\n');
      if (lines.length >= 3) {
        const timeLine = lines[1];
        const text = lines.slice(2).join('\n');
        const timeMatch = timeLine.match(/(\d{2}):(\d{2}):(\d{2}),(\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2}),(\d{3})/);
        if (timeMatch) {
          const startTime = parseInt(timeMatch[1]) * 3600000 + parseInt(timeMatch[2]) * 60000 + parseInt(timeMatch[3]) * 1000 + parseInt(timeMatch[4]);
          const endTime = parseInt(timeMatch[5]) * 3600000 + parseInt(timeMatch[6]) * 60000 + parseInt(timeMatch[7]) * 1000 + parseInt(timeMatch[8]);
          subs.push({ id: index, startTime, endTime, text });
        }
      }
    });
    return subs;
  };

  // Subtitle Settings Cycles
  const cycleSubSize = () => {
    setSubSettings(prev => {
      const next = prev.size === 14 ? 18 : prev.size === 18 ? 24 : 14;
      return { ...prev, size: next };
    });
  };

  const cycleSubColor = () => {
    setSubSettings(prev => {
      const next = prev.color === 'white' ? 'yellow' : prev.color === 'yellow' ? 'cyan' : 'white';
      return { ...prev, color: next };
    });
  };

  const cycleSubBg = () => {
    setSubSettings(prev => {
      const next = prev.bg === 'black' ? 'semi' : prev.bg === 'semi' ? 'transparent' : 'black';
      return { ...prev, bg: next };
    });
  };

  const getSubBgColor = () => {
    switch (subSettings.bg) {
      case 'black': return 'rgba(0,0,0,0.9)';
      case 'semi': return 'rgba(0,0,0,0.5)';
      case 'transparent': return 'transparent';
      default: return 'rgba(0,0,0,0.5)';
    }
  };

  const getSubColor = () => {
    switch (subSettings.color) {
      case 'white': return '#FFFFFF';
      case 'yellow': return '#FFEB3B';
      case 'cyan': return '#00BCD4';
      default: return '#FFFFFF';
    }
  };


  const handleVideoEnded = useCallback(() => {
    if (loopMode === 'one') {
      player?.replay();
    } else if (loopMode === 'all' || currentIndex < videoQueue.length - 1) {
      handleNextVideo();
    }
  }, [loopMode, currentIndex, videoQueue, player]);

  // ─────────────────────────────────────────────────────────────────────────
  // Gestures
  // ─────────────────────────────────────────────────────────────────────────

  const pinchGesture = Gesture.Pinch()
    .onStart((e: any) => {
      savedScale.value = scale.value;
      focalX.value = e.focalX;
      focalY.value = e.focalY;
    })
    .onUpdate((e: any) => {
      scale.value = savedScale.value * e.scale;
    })
    .onEnd(() => {
      if (scale.value < 1) {
        scale.value = withSpring(1);
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      } else {
        savedScale.value = scale.value;
      }
    });

  const panZoomGesture = Gesture.Pan()
    .minPointers(2)
    .onStart(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    })
    .onUpdate((e: any) => {
      if (scale.value > 1) {
        translateX.value = savedTranslateX.value + e.translationX;
        translateY.value = savedTranslateY.value + e.translationY;
      }
    });

  const zoomGestures = Gesture.Simultaneous(pinchGesture, panZoomGesture);

  const controlsPanGesture = Gesture.Pan()
    .onStart((e: any) => {
      if (controlsLocked) return;
      // Capture start values in shared values instead of context
      startBrightnessSv.value = brightnessSv.value;
      startVolumeSv.value = volumeSv.value;

      const screenThird = windowWidth / 3;
      if (e.x < screenThird) {
        runOnJS(setGestureType)('brightness');
      } else if (e.x > windowWidth - screenThird) {
        runOnJS(setGestureType)('volume');
      }
    })
    .onUpdate((e: any) => {
      if (controlsLocked) return;
      const delta = -e.translationY / 200;
      // We need to read gestureType from shared value or just infer from position? 
      // Inferring from position constantly in onUpdate is tricky if finger moves out.
      // Better to rely on where it started. 
      // However, we can't easily pass 'type' via shared value without a derived value or check.
      // Re-deriving type from startX is fine.

      const screenThird = windowWidth / 3;
      // Use the start X coordinate which is usually e.absoluteX - e.translationX? 
      // OR better: handle logic based on gestureType state? No, runOnJS is async.
      // We can use a minimal logic:

      // Let's assume left third is brightness, right is volume based on START X
      // But we don't have e.startX in onUpdate easily.
      // We'll trust the runOnJS setGestureType for visual feedback, 
      // but for logic we re-check e.x - e.translationX (approx start X).

      // Actually simpler: we can just check e.x on Start and set a shared value for "activeGestureMode"
      // 0: none, 1: brightness, 2: volume
    })
    // FIX: To properly handle this without context, use a shared value for mode
    .onStart((e: any) => {
      // ... logic handled above in separate onStart block? No, gesture chaining.
    })
    // Let's rewrite the chain properly using a shared value for mode
    .onStart((e: any) => {
      if (controlsLocked) return;
      startBrightnessSv.value = brightnessSv.value;
      startVolumeSv.value = volumeSv.value;

      const screenThird = windowWidth / 3;
      if (e.x < screenThird) {
        runOnJS(setGestureType)('brightness');
      } else if (e.x > windowWidth - screenThird) {
        runOnJS(setGestureType)('volume');
      }
    })
    .onUpdate((e: any) => {
      if (controlsLocked) return;
      const screenThird = windowWidth / 3;
      // Approximation of start X to determine mode consistency
      const startX = e.absoluteX - e.translationX;

      const delta = -e.translationY / 200;

      if (startX < screenThird) {
        // Brightness
        const newVal = Math.max(0, Math.min(1, startBrightnessSv.value + delta));
        brightnessSv.value = newVal;
        runOnJS(setGestureValue)(newVal);
        runOnJS(setBrightness)(newVal);
      } else if (startX > windowWidth - screenThird) {
        // Volume
        const newVal = Math.max(0, Math.min(1, startVolumeSv.value + delta));
        volumeSv.value = newVal;
        runOnJS(setGestureValue)(newVal);
        runOnJS(setVolume)(newVal);
        if (player) runOnJS(() => { player.volume = newVal; })();
      }
    })
    .onEnd(() => {
      runOnJS(setGestureType)('none');
    });

  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd((e: any) => {
      if (controlsLocked) return;
      const screenThird = windowWidth / 3;
      if (e.x < screenThird) {
        runOnJS(handleSeekBackward)();
      } else if (e.x > windowWidth - screenThird) {
        runOnJS(handleSeekForward)();
      }
    });

  const singleTapGesture = Gesture.Tap()
    .requireExternalGestureToFail(doubleTapGesture)
    .onEnd(() => {
      if (showControls) runOnJS(hideControls)();
      else runOnJS(showControlsHandler)();
    });

  const composedGestures = Gesture.Race(
    zoomGestures,
    Gesture.Exclusive(doubleTapGesture, singleTapGesture, controlsPanGesture)
  );

  // ─────────────────────────────────────────────────────────────────────────
  // Effects
  // ─────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    const queue = playlistVideos || allVideos;
    const initialIndex = playlistVideos
      ? startIndex
      : queue.findIndex(v => v.id === videoId);
    const verifiedIndex = initialIndex >= 0 ? initialIndex : 0;

    // 1. Initialize Service & Register Player
    initializeVideoService()
      .then(() => {
        registerPlayer(player);

        // 2. Set Queue & START Playback via Service (which sets metadata)
        setServiceVideoQueue(queue, verifiedIndex);
      })
      .catch(console.error);

    // Update local config
    if (videoPlaybackState.loopMode) {
      setLoopMode(videoPlaybackState.loopMode);
      setServiceLoopMode(videoPlaybackState.loopMode);
    }

    return () => {
      cleanupVideoService();
    };
  }, [videoId, playlistVideos, startIndex, allVideos, player]);

  useEffect(() => {
    if (videoQueue.length > 0 && currentIndex >= 0 && currentIndex < videoQueue.length) {
      const video = videoQueue[currentIndex];
      setCurrentVideo(video);
      dispatch(setVideoCurrentVideo(video));
      setSubtitles([]);
      setCurrentSubtitle(null);

      if (video.lastWatchedPosition > 5000 && video.lastWatchedPosition < video.duration * 0.95) {
        setResumePosition(video.lastWatchedPosition);
        setShowResumeModal(true);
      }
    }
  }, [currentIndex, videoQueue, dispatch]);

  // ─────────────────────────────────────────────────────────────────────────
  // Orientation
  // ─────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    // Allow landscape for video player
    ScreenOrientation.unlockAsync();

    return () => {
      // Restore portrait when leaving player
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    };
  }, []);

  useEffect(() => {
    if (!player) return;
    const interval = setInterval(() => {
      if (player.status !== 'readyToPlay') return;
      const currentPos = player.currentTime * 1000;
      const totalDur = player.duration * 1000;

      setPosition(prev => {
        if (Math.abs(prev - currentPos) < 1000 && isPlaying) return prev;
        return currentPos;
      });
      setDuration(totalDur > 0 ? totalDur : 0);
      setIsPlaying(player.playing);
      setIsLoading(false);

      if (subtitles.length > 0) {
        const activeSub = subtitles.find(
          sub => currentPos >= sub.startTime + subtitleDelay &&
            currentPos <= sub.endTime + subtitleDelay
        );
        setCurrentSubtitle(activeSub ? activeSub.text : null);
      }
    }, 1000);

    const subEnd = player.addListener('playToEnd', () => {
      handleVideoEnded();
    });
    return () => { clearInterval(interval); subEnd.remove(); };
  }, [player, loopMode, subtitles, subtitleDelay, currentIndex, videoQueue, handleVideoEnded]);

  const videoAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
    };
  });

  const getLoopIconName = () => {
    if (loopMode === 'one') return 'repeat-once';
    if (loopMode === 'all') return 'repeat';
    return 'repeat-off';
  };

  if (!currentVideo) return <View style={styles.container} />;

  return (
    <GestureDetector gesture={composedGestures}>
      <View style={styles.container}>
        <StatusBar hidden />

        <Reanimated.View style={[styles.videoContainer, videoAnimatedStyle]}>
          <VideoView
            style={[StyleSheet.absoluteFill, { opacity: audioOnlyMode ? 0 : 1 }]}
            player={player}
            contentFit={aspectRatio}
            nativeControls={false}
            allowsPictureInPicture
          />
          {currentSubtitle && !audioOnlyMode && (
            <View style={[styles.subtitleOverlay, { bottom: subSettings.bottomOffset }]}>
              <Text style={[
                styles.subtitleText,
                {
                  fontSize: subSettings.size,
                  color: getSubColor(),
                  backgroundColor: getSubBgColor()
                }
              ]}>{currentSubtitle}</Text>
            </View>
          )}

          {/* Audio-Only Mode Placeholder */}
          {audioOnlyMode && (
            <View style={styles.audioOnlyPlaceholder}>
              <View style={styles.audioOnlyIconContainer}>
                <MaterialCommunityIcons name="music-circle" size={120} color={Colors.primary} />
              </View>
              <Text style={styles.audioOnlyTitle}>Audio Playing</Text>
              <Text style={styles.audioOnlySubtitle}>{currentVideo.title || currentVideo.fileName}</Text>
              <TouchableOpacity
                style={styles.restoreVideoBtn}
                onPress={() => setAudioOnlyMode(false)}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons name="video" size={20} color="white" />
                <Text style={styles.restoreVideoBtnText}>Tap to restore video</Text>
              </TouchableOpacity>
            </View>
          )}
        </Reanimated.View>

        {gestureType !== 'none' && (
          <View style={styles.gestureOverlay} pointerEvents="none">
            <View style={styles.gestureIndicator}>
              <MaterialCommunityIcons
                name={gestureType === 'brightness' ? 'brightness-6' : (gestureType === 'volume' ? 'volume-high' : 'clock-time-four-outline')}
                size={40} color="white"
              />
              {gestureType === 'seek' ? (
                <Text style={styles.gestureText}>{formatDuration(seekPreview)}</Text>
              ) : (
                <View style={styles.gestureBarContainer}>
                  <View style={[styles.gestureBarFill, { width: `${gestureValue * 100}%` }]} />
                </View>
              )}
            </View>
          </View>
        )}

        {showDoubleTap && (
          <View style={[styles.doubleTapIndicator, showDoubleTap === 'left' ? styles.dTapLeft : styles.dTapRight]} pointerEvents="none">
            <MaterialCommunityIcons name={showDoubleTap === 'left' ? "rewind-10" : "fast-forward-10"} size={40} color="white" />
            <Text style={styles.dTapText}>10s</Text>
          </View>
        )}

        {/* Controls Overlay */}
        {showControls && (
          <Animated.View style={[styles.controlsOverlay, { opacity: controlsOpacity }]} pointerEvents="box-none">

            {/* Top Bar */}
            <View style={[styles.topBar, { paddingTop: insets.top > 20 ? insets.top : 20 }]} pointerEvents="box-none">
              <View style={styles.topGradient} pointerEvents="none" />
              <View style={styles.topContent}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
                  <Ionicons name="arrow-back" size={28} color="white" />
                </TouchableOpacity>

                <View style={styles.metaContainer} pointerEvents="none">
                  <Text style={styles.videoTitle} numberOfLines={1}>{currentVideo.title || currentVideo.fileName}</Text>
                  <Text style={styles.queueInfo}>{currentIndex + 1} / {videoQueue.length}</Text>
                </View>

                <View style={styles.rightActions}>
                  <TouchableOpacity
                    onPress={() => setAudioOnlyMode(!audioOnlyMode)}
                    style={styles.iconBtn}
                  >
                    <MaterialCommunityIcons
                      name="music-circle"
                      size={24}
                      color={audioOnlyMode ? Colors.primary : 'white'}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handlePiP} style={styles.iconBtn}>
                    <MaterialIcons name="picture-in-picture-alt" size={24} color="white" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setShowQueueModal(true)} style={styles.iconBtn}>
                    <MaterialIcons name="playlist-play" size={28} color="white" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setShowSpeedModal(true)} style={styles.iconBtn}>
                    <Text style={styles.speedText}>{playbackSpeed}x</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Center Controls */}
            {!controlsLocked && (
              <View style={styles.centerControls} pointerEvents="box-none">
                <TouchableOpacity onPress={handlePreviousVideo} style={styles.skipBtn}>
                  <Ionicons name="play-skip-back" size={36} color="white" />
                </TouchableOpacity>

                <TouchableOpacity onPress={handleSeekBackward} style={styles.rwBtn}>
                  <MaterialCommunityIcons name="rewind-10" size={32} color="white" />
                </TouchableOpacity>

                <TouchableOpacity onPress={handlePlayPause} style={styles.playPauseBtn}>
                  <Ionicons name={isPlaying ? "pause" : "play"} size={50} color="white" style={{ paddingLeft: isPlaying ? 0 : 4 }} />
                </TouchableOpacity>

                <TouchableOpacity onPress={handleSeekForward} style={styles.rwBtn}>
                  <MaterialCommunityIcons name="fast-forward-10" size={32} color="white" />
                </TouchableOpacity>

                <TouchableOpacity onPress={handleNextVideo} style={styles.skipBtn}>
                  <Ionicons name="play-skip-forward" size={36} color="white" />
                </TouchableOpacity>
              </View>
            )}

            {/* Lock Button */}
            {controlsLocked && (
              <View style={styles.centerLocked} pointerEvents="box-none">
                <TouchableOpacity onPress={() => { setControlsLocked(false); showControlsHandler(); }} style={styles.unlockBtn}>
                  <MaterialCommunityIcons name="lock" size={32} color="white" />
                  <Text style={styles.unlockText}>Unlock</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Bottom Bar */}
            {!controlsLocked && (
              <View style={[styles.bottomBar, { paddingBottom: insets.bottom || 20 }]} pointerEvents="box-none">
                <View style={styles.bottomGradient} pointerEvents="none" />

                {/* Seek Bar */}
                <View style={styles.progressRow}>
                  <Text style={styles.timeText}>{formatDuration(position)}</Text>
                  <View style={[styles.sliderContainer, { marginHorizontal: 0 }]}>
                    <ProScrubber
                      duration={duration > 0 ? duration : 1}
                      currentTime={position}
                      onSeekStart={() => {
                        if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
                      }}
                      onSeekEnd={(time) => {
                        if (player) {
                          player.currentTime = time / 1000;
                        }
                        resetControlsTimeout();
                      }}
                    />
                  </View>
                  <Text style={styles.timeText}>{formatDuration(duration)}</Text>
                </View>

                {/* Bottom Actions */}
                <View style={styles.bottomActions}>
                  <TouchableOpacity activeOpacity={0.7} onPress={() => setControlsLocked(true)}>
                    <MaterialCommunityIcons name="lock-open-outline" size={24} color="white" />
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => dispatch(toggleVideoFavorite(currentVideo.id))}>
                    <MaterialIcons name={currentVideo.isFavorite ? "favorite" : "favorite-border"} size={24} color={currentVideo.isFavorite ? Colors.primary : "white"} />
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => {
                    const newAspect = aspectRatio === 'contain' ? 'cover' : 'contain';
                    setAspectRatio(newAspect);
                  }}>
                    <MaterialCommunityIcons name={aspectRatio === 'cover' ? "arrow-expand-all" : "arrow-collapse-all"} size={24} color="white" />
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => {
                    const modes: LoopMode[] = ['none', 'all', 'one'];
                    const idx = modes.indexOf(loopMode);
                    setLoopMode(modes[(idx + 1) % 3]);
                  }}>
                    <MaterialCommunityIcons name={getLoopIconName()} size={24} color={loopMode !== 'none' ? Colors.primary : "white"} />
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => {
                    const newState = toggleServiceShuffle();
                    setShuffleEnabled(newState);
                    const qs = getQueueState();
                    setVideoQueueState(qs.queue);
                  }}>
                    <MaterialCommunityIcons name="shuffle" size={24} color={shuffleEnabled ? Colors.primary : "white"} />
                  </TouchableOpacity>
                </View>
              </View>
            )}

          </Animated.View>
        )}

        {/* Modal Queue */}
        <Modal visible={showQueueModal} transparent animationType="slide" onRequestClose={() => setShowQueueModal(false)}>
          <View style={styles.queueModalFill}>
            <View style={[styles.queueContainer, { marginTop: insets.top + 20 }]}>
              <View style={styles.queueHeader}>
                <Text style={styles.queueTitle}>Up Next</Text>
                <TouchableOpacity onPress={() => setShowQueueModal(false)}>
                  <Ionicons name="close" size={24} color="white" />
                </TouchableOpacity>
              </View>
              <FlatList
                data={videoQueue}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item, index }) => (
                  <TouchableOpacity
                    style={[styles.queueItem, item.id === currentVideo.id && styles.activeQueueItem]}
                    onPress={() => {
                      setCurrentIndex(index);
                      setShowQueueModal(false);
                    }}
                  >
                    <Image source={{ uri: item.thumbnail }} style={styles.queueThumb} />
                    <View style={styles.queueMeta}>
                      <Text style={[styles.queueName, item.id === currentVideo.id && styles.activeQueueText]} numberOfLines={1}>{item.fileName}</Text>
                      <Text style={styles.queueDuration}>{formatDuration(item.duration)}</Text>
                    </View>
                    {item.id === currentVideo.id && <Ionicons name="volume-high" size={20} color={Colors.primary} />}
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </Modal>

        {/* Modal Subtitle Settings */}
        <Modal visible={showSubtitleModal} transparent animationType="fade" onRequestClose={() => setShowSubtitleModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Subtitles & Audio</Text>

              {/* Delay control */}
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Subtitle Delay: {subtitleDelay / 1000}s</Text>
                <View style={styles.rowControls}>
                  <TouchableOpacity onPress={() => setSubtitleDelay(prev => prev - 100)} style={styles.adjustBtn}>
                    <MaterialCommunityIcons name="minus" size={24} color="white" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setSubtitleDelay(prev => prev + 100)} style={styles.adjustBtn}>
                    <MaterialCommunityIcons name="plus" size={24} color="white" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Size control */}
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Size: {subSettings.size === 14 ? 'Small' : subSettings.size === 18 ? 'Medium' : 'Large'}</Text>
                <TouchableOpacity onPress={cycleSubSize} style={styles.cycleBtn}>
                  <Text style={styles.cycleBtnText}>Cycle</Text>
                </TouchableOpacity>
              </View>

              {/* Color control */}
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Color: {subSettings.color}</Text>
                <View style={[styles.colorPreview, { backgroundColor: getSubColor() }]} />
                <TouchableOpacity onPress={cycleSubColor} style={styles.cycleBtn}>
                  <Text style={styles.cycleBtnText}>Cycle</Text>
                </TouchableOpacity>
              </View>

              {/* Background control */}
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Background: {subSettings.bg}</Text>
                <View style={[styles.colorPreview, { backgroundColor: getSubBgColor(), borderColor: 'white', borderWidth: 1 }]} />
                <TouchableOpacity onPress={cycleSubBg} style={styles.cycleBtn}>
                  <Text style={styles.cycleBtnText}>Cycle</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.modalActionBtn} onPress={() => {
                DocumentPicker.getDocumentAsync({
                  type: ['application/x-subrip', 'text/vtt', 'text/plain'],
                  copyToCacheDirectory: true,
                }).then(async (result) => {
                  if (!result.canceled && result.assets && result.assets.length > 0) {
                    const fileContent = await FileSystem.readAsStringAsync(result.assets[0].uri);
                    const parsed = parseSRT(fileContent);
                    setSubtitles(parsed);
                    setShowSubtitleModal(false);
                  }
                });
              }}>
                <MaterialCommunityIcons name="file-document-outline" size={20} color="black" />
                <Text style={styles.modalActionBtnText}>Load External Subtitle</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.closeBtn} onPress={() => setShowSubtitleModal(false)}>
                <Text style={styles.closeBtnText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Modal Speed */}
        <Modal visible={showSpeedModal} transparent animationType="fade" onRequestClose={() => setShowSpeedModal(false)}>
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowSpeedModal(false)}>
            <View style={styles.speedList}>
              <Text style={styles.speedTitle}>Playback Speed</Text>
              {PLAYBACK_SPEEDS.map(speed => (
                <TouchableOpacity key={speed} style={styles.speedItem} onPress={() => {
                  setPlaybackSpeed(speed);
                  player && (player.playbackRate = speed);
                  setShowSpeedModal(false);
                }}>
                  <Text style={[styles.speedItemText, playbackSpeed === speed && styles.activeSpeedText]}>{speed}x</Text>
                  {playbackSpeed === speed && <Ionicons name="checkmark" size={20} color={Colors.primary} />}
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>

      </View>
    </GestureDetector>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  videoContainer: { flex: 1, backgroundColor: 'black' },

  // Audio-Only Mode Placeholder
  audioOnlyPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0a0a0a',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  audioOnlyIconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  audioOnlyTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  audioOnlySubtitle: {
    color: '#888',
    fontSize: 14,
    marginBottom: 32,
    paddingHorizontal: 40,
    textAlign: 'center',
  },
  restoreVideoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  restoreVideoBtnText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },

  // Overlays
  controlsOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'space-between', zIndex: 10 },
  gestureOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', zIndex: 5 },

  // Top Bar
  topBar: { flexDirection: 'row', width: '100%', paddingHorizontal: 16, alignItems: 'center' },
  topGradient: { position: 'absolute', top: 0, left: 0, right: 0, height: 100, backgroundColor: 'rgba(0,0,0,0.6)' },
  topContent: { flexDirection: 'row', flex: 1, alignItems: 'center' },
  metaContainer: { flex: 1, marginLeft: 12 },
  videoTitle: { color: 'white', fontSize: 16, fontWeight: '600' },
  queueInfo: { color: '#CCC', fontSize: 12 },
  rightActions: { flexDirection: 'row', alignItems: 'center' },
  iconBtn: { padding: 8, marginLeft: 4 },
  speedText: { color: 'white', fontWeight: 'bold', borderWidth: 1, borderColor: 'white', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },

  // Center Controls
  centerControls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%' },
  playPauseBtn: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', marginHorizontal: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  skipBtn: { padding: 10 },
  rwBtn: { padding: 10 },

  // Center Locked
  centerLocked: { alignSelf: 'center', justifyContent: 'center' },
  unlockBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  unlockText: { color: 'white', fontWeight: 'bold', marginLeft: 8 },

  // Bottom Bar
  bottomBar: { width: '100%', paddingHorizontal: 16 },
  bottomGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 120, backgroundColor: 'rgba(0,0,0,0.7)' },
  progressRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  timeText: { color: 'white', fontSize: 12, width: 45, textAlign: 'center' },
  sliderContainer: { flex: 1, height: 30, justifyContent: 'center', marginHorizontal: 10 },
  sliderTrack: { height: 4, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 2, flexDirection: 'row', alignItems: 'center' },
  sliderFill: { height: 4, backgroundColor: Colors.primary, borderRadius: 2 },
  sliderThumb: { width: 14, height: 14, borderRadius: 7, backgroundColor: Colors.primary, position: 'absolute', marginLeft: -7 },
  bottomActions: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10 },

  // Gestures
  gestureIndicator: { backgroundColor: 'rgba(0,0,0,0.7)', padding: 24, borderRadius: 16, alignItems: 'center' },
  gestureBarContainer: { width: 6, height: 60, backgroundColor: '#555', marginTop: 12, borderRadius: 3, overflow: 'hidden' }, // Vertical bar looking for vol? Or horiz? simpler to use text or simple fill
  gestureBarFill: { width: '100%', backgroundColor: Colors.primary, position: 'absolute', bottom: 0 },
  gestureText: { color: 'white', fontSize: 18, fontWeight: 'bold', marginTop: 8 },

  // Double Tap 
  doubleTapIndicator: { position: 'absolute', top: '45%', backgroundColor: 'rgba(0,0,0,0.7)', padding: 16, borderRadius: 40, alignItems: 'center', zIndex: 12 },
  dTapLeft: { left: 60 },
  dTapRight: { right: 60 },
  dTapText: { color: 'white', fontWeight: 'bold', marginTop: 4 },

  // Subtitles
  subtitleOverlay: { position: 'absolute', bottom: 80, width: '100%', alignItems: 'center', paddingHorizontal: 20 },
  subtitleText: { color: 'white', backgroundColor: 'rgba(0,0,0,0.6)', padding: 8, borderRadius: 4, fontSize: 16, textAlign: 'center' },

  // Modal (General)
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#222', padding: 24, borderRadius: 12, width: '80%', alignItems: 'center' },
  modalTitle: { color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 16 },

  // Speed Modal
  speedList: { position: 'absolute', bottom: 100, right: 20, backgroundColor: '#222', padding: 8, borderRadius: 8, width: 120 },
  speedTitle: { color: '#888', fontSize: 10, marginLeft: 8, marginBottom: 8 },
  speedItem: { flexDirection: 'row', justifyContent: 'space-between', padding: 10 },
  speedItemText: { color: 'white' },
  activeSpeedText: { color: Colors.primary, fontWeight: 'bold' },

  // Queue Modal
  queueModalFill: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  queueContainer: { maxHeight: '60%', backgroundColor: '#1a1a1a', borderTopLeftRadius: 16, borderTopRightRadius: 16, paddingBottom: 30 },
  queueHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#333' },
  queueTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  queueItem: { flexDirection: 'row', padding: 12, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#222' },
  activeQueueItem: { backgroundColor: 'rgba(255,255,255,0.05)' },
  queueThumb: { width: 60, height: 40, borderRadius: 4, backgroundColor: '#333', marginRight: 12 },
  queueMeta: { flex: 1, justifyContent: 'center' },
  queueName: { color: 'white', fontSize: 14, marginBottom: 4 },
  activeQueueText: { color: Colors.primary, fontWeight: 'bold' },
  queueDuration: { color: '#888', fontSize: 12 },

  // Settings Modal Styles
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: 20 },
  settingLabel: { color: 'white', fontSize: 16 },
  rowControls: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#333', borderRadius: 8 },
  adjustBtn: { padding: 10 },
  modalActionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primary, padding: 12, borderRadius: 8, width: '100%', marginBottom: 12 },
  modalActionBtnText: { color: 'white', fontWeight: 'bold', marginLeft: 8 },
  cycleBtn: { backgroundColor: '#333', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 },
  cycleBtnText: { color: 'white', fontSize: 14 },
  colorPreview: { width: 20, height: 20, borderRadius: 10, marginRight: 10 },

  closeBtn: { padding: 10, alignSelf: 'center' },
  closeBtnText: { color: '#888', fontSize: 16 },
});

export default VideoPlayerScreen;
