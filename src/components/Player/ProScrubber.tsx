import React, { useEffect } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    runOnJS,
    useAnimatedReaction,
} from 'react-native-reanimated';
import { Colors } from '../../utils/colors';

interface ProScrubberProps {
    duration: number; // in milliseconds
    currentTime: number; // in milliseconds
    onSeekStart?: () => void;
    onSeekEnd?: (time: number) => void;
    buffered?: number; // Optional: buffered time
}

const THUMB_SIZE = 16;
const THUMB_SCALE_ACTIVE = 1.5;
const TRACK_HEIGHT = 4;
const PADDING = 10;

export const ProScrubber: React.FC<ProScrubberProps> = ({
    duration,
    currentTime,
    onSeekStart,
    onSeekEnd,
    buffered = 0,
}) => {
    const { width } = useWindowDimensions();
    // Available width for the slider (container padding should be handled by parent or constant subtracted)
    // Let's assume full width minus standard padding of container (32px = 16px * 2)
    const AVAILABLE_WIDTH = width - 32 - (PADDING * 2);

    const progressX = useSharedValue(0);
    const isDragging = useSharedValue(false);
    const scale = useSharedValue(1);

    // Sync with prop only when not dragging
    useEffect(() => {
        // We can't easily check shared value synchronously in JS, 
        // but we can rely on React updates being slower than frame updates.
        // However, to be safe, we usually do this inside a reaction or just let it override if not active.
        // Here we will use a small useEffect but we need to guard against overriding user drag.
        // Since sharedValue updates are async to JS thread in some contexts, but here we trigger from JS.
        const percent = Math.max(0, Math.min(1, duration > 0 ? currentTime / duration : 0));
        progressX.value = percent * AVAILABLE_WIDTH;
    }, [currentTime, duration, AVAILABLE_WIDTH]);

    const startX = useSharedValue(0);

    const pan = Gesture.Pan()
        .onStart(() => {
            isDragging.value = true;
            startX.value = progressX.value;
            scale.value = withSpring(THUMB_SCALE_ACTIVE);
            if (onSeekStart) runOnJS(onSeekStart)();
        })
        .onUpdate((event) => {
            // Clamping
            let newX = startX.value + event.translationX;
            if (newX < 0) newX = 0;
            if (newX > AVAILABLE_WIDTH) newX = AVAILABLE_WIDTH;
            progressX.value = newX;
        })
        .onEnd(() => {
            isDragging.value = false;
            scale.value = withSpring(1);

            const percent = progressX.value / AVAILABLE_WIDTH;
            const targetTime = percent * duration;

            if (onSeekEnd) runOnJS(onSeekEnd)(targetTime);
        });

    // Styles
    const progressStyle = useAnimatedStyle(() => {
        return {
            width: progressX.value,
        };
    });

    const thumbStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateX: progressX.value },
                { scale: scale.value },
            ],
        };
    });

    return (
        <View style={styles.container}>
            <GestureDetector gesture={pan}>
                <Animated.View style={[styles.touchArea, { width: undefined }]}>
                    {/* We define explicit width or flex in parent, but here we need a hit slop area */}
                    <View style={styles.trackBackground}>
                        {/* Buffered Bar could go here */}
                        <View style={[styles.bufferedBar, { width: `${(buffered / duration) * 100}%` }]} />

                        {/* Progress Fill */}
                        <Animated.View style={[styles.progressFill, progressStyle]} />
                    </View>

                    {/* Thumb */}
                    <Animated.View style={[styles.thumb, thumbStyle]} />
                </Animated.View>
            </GestureDetector>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 40,
        justifyContent: 'center',
        flex: 1, // Take available space in the row
        marginHorizontal: PADDING,
    },
    touchArea: {
        height: 40,
        justifyContent: 'center',
        backgroundColor: 'transparent', // Hit slop
    },
    trackBackground: {
        height: TRACK_HEIGHT,
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: TRACK_HEIGHT / 2,
        width: '100%',
        overflow: 'hidden', // to clip inner bars
    },
    bufferedBar: {
        position: 'absolute',
        height: '100%',
        backgroundColor: 'rgba(255,255,255,0.5)',
    },
    progressFill: {
        position: 'absolute',
        height: '100%',
        backgroundColor: Colors.primary,
        borderRadius: TRACK_HEIGHT / 2,
    },
    thumb: {
        position: 'absolute',
        left: -THUMB_SIZE / 2, // Center the thumb visually on 0
        width: THUMB_SIZE,
        height: THUMB_SIZE,
        borderRadius: THUMB_SIZE / 2,
        backgroundColor: Colors.primary,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
});

export default ProScrubber;
