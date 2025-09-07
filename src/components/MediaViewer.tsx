import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  StatusBar,
  Dimensions,
  Text,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import {
  PinchGestureHandler,
  PanGestureHandler,
  TapGestureHandler,
  State,
  PinchGestureHandlerGestureEvent,
  PanGestureHandlerGestureEvent,
  TapGestureHandlerStateChangeEvent,
} from 'react-native-gesture-handler';
import { MotiView } from 'moti';
import { MaterialIcon } from './MaterialIcon';
import { tokens } from '../theme/tokens';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface MediaViewerProps {
  visible: boolean;
  onClose: () => void;
  mediaUri: string;
  caption?: string;
  mediaType?: 'image' | 'video';
}

export const MediaViewer: React.FC<MediaViewerProps> = ({
  visible,
  onClose,
  mediaUri,
  caption,
  mediaType = 'image',
}) => {
  const [controlsVisible, setControlsVisible] = useState(true);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // iOS-style icon background color function
  const getIconBackgroundColor = (iconName: string): string => {
    const iconBackgrounds: { [key: string]: string } = {
      // Media viewer icons
      close: '#8E8E93',             // Gray for close
      share: '#007AFF',             // Blue for share
      download: '#34C759',          // Green for download
      // Common icons
      back: '#007AFF',              // Blue for back
      menu: '#8E8E93',              // Gray for menu
    };
    return iconBackgrounds[iconName] || '#8E8E93';
  };

  // Animation values
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const headerOpacity = useSharedValue(1);
  const captionOpacity = useSharedValue(1);

  // Reset animation values when modal opens
  useEffect(() => {
    if (visible) {
      scale.value = 1;
      translateX.value = 0;
      translateY.value = 0;
      headerOpacity.value = withTiming(1);
      captionOpacity.value = withTiming(1);
      setControlsVisible(true);
      startHideTimer();
    }
  }, [visible]);

  const startHideTimer = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    hideTimeoutRef.current = setTimeout(() => {
      hideControls();
    }, 2000);
  };

  const hideControls = () => {
    setControlsVisible(false);
    headerOpacity.value = withTiming(0, { duration: 300 });
    captionOpacity.value = withTiming(0, { duration: 300 });
  };

  const showControls = () => {
    setControlsVisible(true);
    headerOpacity.value = withTiming(1, { duration: 300 });
    captionOpacity.value = withTiming(1, { duration: 300 });
    startHideTimer();
  };

  const toggleControls = () => {
    if (controlsVisible) {
      hideControls();
    } else {
      showControls();
    }
  };

  // Pinch gesture handler
  const pinchHandler = useAnimatedGestureHandler<PinchGestureHandlerGestureEvent>({
    onStart: () => {
      runOnJS(showControls)();
    },
    onActive: (event) => {
      scale.value = Math.max(0.5, Math.min(event.scale, 4));
    },
    onEnd: () => {
      if (scale.value < 1) {
        scale.value = withSpring(1);
      } else if (scale.value > 3) {
        scale.value = withSpring(3);
      }
    },
  });

  // Pan gesture handler
  const panHandler = useAnimatedGestureHandler<PanGestureHandlerGestureEvent>({
    onStart: () => {
      runOnJS(showControls)();
    },
    onActive: (event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    },
    onEnd: () => {
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
    },
  });

  // Double tap handler
  const doubleTapHandler = (event: TapGestureHandlerStateChangeEvent) => {
    'worklet';
    if (event.nativeEvent.state === State.ACTIVE) {
      if (scale.value === 1) {
        scale.value = withSpring(2);
      } else {
        scale.value = withSpring(1);
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
      runOnJS(showControls)();
    }
  };

  // Single tap handler
  const singleTapHandler = (event: TapGestureHandlerStateChangeEvent) => {
    'worklet';
    if (event.nativeEvent.state === State.ACTIVE) {
      runOnJS(toggleControls)();
    }
  };

  // Animated styles
  const imageStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
  }));

  const captionStyle = useAnimatedStyle(() => ({
    opacity: captionOpacity.value,
  }));

  const handleClose = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <StatusBar hidden />
      <View style={styles.container}>
        {/* Header */}
        <Animated.View style={[styles.header, headerStyle]}>
          <SafeAreaView edges={['top']}>
            <View style={styles.headerContent}>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={handleClose}
              >
                <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor('close') }]}>
                  <MaterialIcon name="close" size={24} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
              
              <View style={styles.headerActions}>
                <TouchableOpacity style={styles.actionButton}>
                  <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor('share') }]}>
                    <MaterialIcon name="share" size={24} color="#FFFFFF" />
                  </View>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor('download') }]}>
                    <MaterialIcon name="download" size={24} color="#FFFFFF" />
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>
        </Animated.View>

        {/* Media Content */}
        <View style={styles.mediaContainer}>
          <TapGestureHandler
            onHandlerStateChange={singleTapHandler}
            waitFor={doubleTapHandler}
          >
            <Animated.View>
              <TapGestureHandler
                onHandlerStateChange={doubleTapHandler}
                numberOfTaps={2}
              >
                <Animated.View>
                  <PanGestureHandler onGestureEvent={panHandler}>
                    <Animated.View>
                      <PinchGestureHandler onGestureEvent={pinchHandler}>
                        <Animated.View style={styles.gestureContainer}>
                          <Animated.Image
                            source={{ uri: mediaUri }}
                            style={[styles.media, imageStyle]}
                            resizeMode="contain"
                          />
                        </Animated.View>
                      </PinchGestureHandler>
                    </Animated.View>
                  </PanGestureHandler>
                </Animated.View>
              </TapGestureHandler>
            </Animated.View>
          </TapGestureHandler>
        </View>

        {/* Caption Bar */}
        {caption && (
          <Animated.View style={[styles.captionContainer, captionStyle]}>
            <SafeAreaView edges={['bottom']}>
              <View style={styles.captionContent}>
                <Text style={styles.captionText}>{caption}</Text>
              </View>
            </SafeAreaView>
          </Animated.View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing.m,
    paddingVertical: tokens.spacing.s,
  },
  closeButton: {
    padding: tokens.spacing.s,
    borderRadius: tokens.radius.m,
  },
  headerActions: {
    flexDirection: 'row',
    gap: tokens.spacing.s,
  },
  actionButton: {
    padding: tokens.spacing.s,
    borderRadius: tokens.radius.m,
  },
  mediaContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gestureContainer: {
    width: screenWidth,
    height: screenHeight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  media: {
    width: screenWidth,
    height: screenHeight * 0.8,
  },
  captionContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  captionContent: {
    paddingHorizontal: tokens.spacing.m,
    paddingVertical: tokens.spacing.m,
  },
  captionText: {
    color: '#FFFFFF',
    ...tokens.typography.body,
    textAlign: 'center',
    lineHeight: 20,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
