import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Animated,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { tokens } from '../theme/tokens';
import { Avatar, MaterialIcon } from '../components';

type VideoCallStackParamList = {
  VideoCall: {
    contactId: string;
    contactName: string;
    contactAvatar?: string;
    isIncoming?: boolean;
  };
};

type VideoCallRouteProp = RouteProp<VideoCallStackParamList, 'VideoCall'>;
type VideoCallNavigationProp = StackNavigationProp<VideoCallStackParamList>;

const { width, height } = Dimensions.get('window');

export const VideoCallScreen: React.FC = () => {
  const navigation = useNavigation<VideoCallNavigationProp>();
  const route = useRoute<VideoCallRouteProp>();
  const { contactId, contactName, contactAvatar, isIncoming = false } = route.params;

  const [isCallActive, setIsCallActive] = useState(!isIncoming);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isFrontCamera, setIsFrontCamera] = useState<CameraType>('front');
  const [callDuration, setCallDuration] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  const cameraRef = useRef<CameraView>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const minimizeAnim = useRef(new Animated.Value(1)).current;

  // iOS-style icon background colors for video call controls
  const getIconBackgroundColor = (iconName: string, isActive: boolean = false): string => {
    if (isActive) {
      const activeBackgrounds: { [key: string]: string } = {
        mic_off: '#FF453A',        // Red for muted mic
        videocam_off: '#FF453A',   // Red for disabled video
      };
      return activeBackgrounds[iconName] || '#FF453A';
    }
    
    const iconBackgrounds: { [key: string]: string } = {
      mic: '#34C759',            // Green for mic
      mic_off: '#FF453A',        // Red for muted mic  
      videocam: '#007AFF',       // Blue for video
      videocam_off: '#FF453A',   // Red for disabled video
      flip_camera_ios: '#8E8E93', // Gray for camera flip
      call_end: '#FF453A',       // Red for end call
      check: '#34C759',          // Green for accept
      close: '#FF453A',          // Red for decline
      fullscreen: '#8E8E93',     // Gray for minimize/expand
      fullscreen_exit: '#8E8E93', // Gray for minimize/expand
    };
    return iconBackgrounds[iconName] || '#8E8E93';
  };

  useEffect(() => {
    // Permissions are handled by the useCameraPermissions hook
  }, []);

  // Call duration timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCallActive) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCallActive]);

  // Pulsing animation for incoming call
  useEffect(() => {
    if (!isCallActive && isIncoming) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [isCallActive, isIncoming, pulseAnim]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAcceptCall = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsCallActive(true);
  };

  const handleDeclineCall = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    navigation.goBack();
  };

  const handleEndCall = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    navigation.goBack();
  };

  const handleToggleMute = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsMuted(!isMuted);
  };

  const handleToggleVideo = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsVideoEnabled(!isVideoEnabled);
  };

  const handleFlipCamera = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsFrontCamera(current => current === 'front' ? 'back' : 'front');
  };

  const handleMinimize = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsMinimized(!isMinimized);
    
    Animated.timing(minimizeAnim, {
      toValue: isMinimized ? 1 : 0.3,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  if (!permission) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>No access to camera</Text>
        <Text style={styles.permissionSubtext}>
          Please enable camera access in settings to make video calls
        </Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestPermission}
        >
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Remote video (placeholder) */}
      <View style={styles.remoteVideo}>
        <View style={styles.remoteVideoPlaceholder}>
          <Avatar
            source={contactAvatar}
            name={contactName}
            size={120}
          />
          <Text style={styles.contactName}>{contactName}</Text>
          {isCallActive && (
            <Text style={styles.callDuration}>{formatDuration(callDuration)}</Text>
          )}
          {!isCallActive && isIncoming && (
            <Text style={styles.incomingText}>Incoming video call...</Text>
          )}
          {!isCallActive && !isIncoming && (
            <Text style={styles.connectingText}>Calling...</Text>
          )}
        </View>
      </View>

      {/* Local video */}
      {isVideoEnabled && (
        <Animated.View style={[
          styles.localVideo,
          { transform: [{ scale: minimizeAnim }] }
        ]}>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing={isFrontCamera}
          />
          {isMinimized && (
            <TouchableOpacity 
              style={[styles.expandButton, { backgroundColor: getIconBackgroundColor('fullscreen') }]}
              onPress={handleMinimize}
            >
              <MaterialIcon name="fullscreen" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </Animated.View>
      )}

      {/* Call controls */}
      <View style={styles.controlsContainer}>
        {!isCallActive && isIncoming ? (
          // Incoming call controls
          <View style={styles.incomingControls}>
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <TouchableOpacity
                style={[styles.callButton, { backgroundColor: getIconBackgroundColor('close') }]}
                onPress={handleDeclineCall}
              >
                <MaterialIcon name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </Animated.View>
            
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <TouchableOpacity
                style={[styles.callButton, { backgroundColor: getIconBackgroundColor('check') }]}
                onPress={handleAcceptCall}
              >
                <MaterialIcon name="check" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </Animated.View>
          </View>
        ) : (
          // Active call controls
          <View style={styles.activeControls}>
            <MotiView
              from={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 200 }}
            >
              <TouchableOpacity
                style={[styles.controlButton, { backgroundColor: getIconBackgroundColor(isMuted ? 'mic_off' : 'mic', isMuted) }]}
                onPress={handleToggleMute}
              >
                <MaterialIcon 
                  name={isMuted ? 'mic_off' : 'mic'} 
                  size={24} 
                  color="#FFFFFF"
                />
              </TouchableOpacity>
            </MotiView>

            <MotiView
              from={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 300 }}
            >
              <TouchableOpacity
                style={[styles.endCallButton, { backgroundColor: getIconBackgroundColor('call_end') }]}
                onPress={handleEndCall}
              >
                <MaterialIcon name="call_end" size={32} color="#FFFFFF" />
              </TouchableOpacity>
            </MotiView>

            <MotiView
              from={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 400 }}
            >
              <TouchableOpacity
                style={[styles.controlButton, { backgroundColor: getIconBackgroundColor(isVideoEnabled ? 'videocam' : 'videocam_off', !isVideoEnabled) }]}
                onPress={handleToggleVideo}
              >
                <MaterialIcon 
                  name={isVideoEnabled ? 'videocam' : 'videocam_off'} 
                  size={24} 
                  color="#FFFFFF"
                />
              </TouchableOpacity>
            </MotiView>

            <MotiView
              from={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 500 }}
            >
              <TouchableOpacity
                style={[styles.controlButton, { backgroundColor: getIconBackgroundColor('flip_camera_ios') }]}
                onPress={handleFlipCamera}
              >
                <MaterialIcon name="flip_camera_ios" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </MotiView>

            <MotiView
              from={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 600 }}
            >
              <TouchableOpacity
                style={[styles.controlButton, { backgroundColor: getIconBackgroundColor(isMinimized ? 'fullscreen' : 'fullscreen_exit') }]}
                onPress={handleMinimize}
              >
                <MaterialIcon 
                  name={isMinimized ? 'fullscreen' : 'fullscreen_exit'} 
                  size={24} 
                  color="#FFFFFF"
                />
              </TouchableOpacity>
            </MotiView>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: tokens.colors.bg,
    justifyContent: 'center',
    alignItems: 'center',
    padding: tokens.spacing.l,
  },
  permissionText: {
    ...tokens.typography.h2,
    color: tokens.colors.onSurface,
    textAlign: 'center',
    marginBottom: tokens.spacing.m,
  },
  permissionSubtext: {
    ...tokens.typography.body,
    color: tokens.colors.onSurface60,
    textAlign: 'center',
    lineHeight: 24,
  },
  remoteVideo: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  remoteVideoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  contactName: {
    ...tokens.typography.h1,
    color: '#FFFFFF',
    marginTop: tokens.spacing.l,
    textAlign: 'center',
  },
  callDuration: {
    ...tokens.typography.body,
    color: '#FFFFFF',
    marginTop: tokens.spacing.s,
    fontSize: 12,
  },
  incomingText: {
    ...tokens.typography.body,
    color: '#FFFFFF',
    marginTop: tokens.spacing.s,
    fontSize: 12,
  },
  connectingText: {
    ...tokens.typography.body,
    color: '#FFFFFF',
    marginTop: tokens.spacing.s,
    fontSize: 12,
  },
  localVideo: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 120,
    height: 160,
    borderRadius: tokens.radius.m,
    overflow: 'hidden',
    backgroundColor: '#2a2a2a',
    elevation: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  camera: {
    flex: 1,
  },
  expandButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    paddingHorizontal: tokens.spacing.l,
  },
  incomingControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  activeControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  callButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  endCallButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  permissionButton: {
    backgroundColor: tokens.colors.primary,
    paddingHorizontal: tokens.spacing.l,
    paddingVertical: tokens.spacing.m,
    borderRadius: tokens.radius.m,
    marginTop: tokens.spacing.l,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
