import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { Text } from 'react-native-paper';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';

import { tokens } from '../theme/tokens';
import { CallsStackParamList } from '../navigation/types';
import { Avatar, MaterialIcon } from '../components';

const { width: screenWidth } = Dimensions.get('window');

type CallScreenNavigationProp = StackNavigationProp<CallsStackParamList, 'CallScreen'>;
type CallScreenRouteProp = RouteProp<CallsStackParamList, 'CallScreen'>;

export const CallScreen: React.FC = () => {
  const navigation = useNavigation<CallScreenNavigationProp>();
  const route = useRoute<CallScreenRouteProp>();
  const { contactName, contactAvatar, isIncoming } = route.params;
  
  const [callDuration, setCallDuration] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isOnHold, setIsOnHold] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [callStatus, setCallStatus] = useState<'ringing' | 'connecting' | 'connected'>('ringing');

  useEffect(() => {
    // Simulate call connection after 3 seconds
    const connectTimer = setTimeout(() => {
      setIsConnected(true);
      setCallStatus('connected');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }, 3000);

    return () => clearTimeout(connectTimer);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isConnected) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isConnected]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusText = () => {
    switch (callStatus) {
      case 'ringing':
        return isIncoming ? 'Incoming call...' : 'Calling...';
      case 'connecting':
        return 'Connecting...';
      case 'connected':
        return formatDuration(callDuration);
      default:
        return 'Ringing...';
    }
  };

  const handleEndCall = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    navigation.goBack();
  };

  const handleMute = () => {
    setIsMuted(!isMuted);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleHold = () => {
    setIsOnHold(!isOnHold);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <LinearGradient
      colors={[tokens.colors.surface1, tokens.colors.bg]}
      style={styles.container}
    >
      {/* Main Content */}
      <View style={styles.content}>
        {/* Avatar with pulsing ring */}
        <View style={styles.avatarContainer}>
          {callStatus === 'ringing' && (
            <MotiView
              from={{ scale: 1, opacity: 0.8 }}
              animate={{ scale: 1.2, opacity: 0 }}
              transition={{
                type: 'timing',
                duration: 2000,
                loop: true,
              }}
              style={[styles.pulseRing, { borderColor: tokens.colors.secondary }]}
            />
          )}
          <Avatar
            source={contactAvatar}
            name={contactName}
            size={120}
          />
        </View>

        {/* Contact Name */}
        <Text style={styles.contactName}>
          {contactName}
        </Text>

        {/* Status */}
        <Text style={styles.statusText}>
          {getStatusText()}
        </Text>
      </View>

      {/* Control Buttons */}
      <View style={styles.controlsContainer}>
        <View style={styles.controlsRow}>
          {/* Mute Button */}
          <TouchableOpacity
            style={[
              styles.controlButton,
              isMuted && styles.activeControlButton
            ]}
            onPress={handleMute}
          >
            <MaterialIcon 
              name={isMuted ? 'mic_off' : 'mic'} 
              size={24} 
              color={isMuted ? tokens.colors.bg : tokens.colors.onSurface} 
            />
          </TouchableOpacity>

          {/* Hold Button */}
          <TouchableOpacity
            style={[
              styles.controlButton,
              isOnHold && styles.activeControlButton
            ]}
            onPress={handleHold}
          >
            <MaterialIcon 
              name="pause" 
              size={24} 
              color={isOnHold ? tokens.colors.bg : tokens.colors.onSurface} 
            />
          </TouchableOpacity>

          {/* Speaker Button */}
          <TouchableOpacity
            style={[
              styles.controlButton,
              isSpeakerOn && styles.activeControlButton
            ]}
            onPress={handleSpeaker}
          >
            <MaterialIcon 
              name="volume_up" 
              size={24} 
              color={isSpeakerOn ? tokens.colors.bg : tokens.colors.onSurface} 
            />
          </TouchableOpacity>

          {/* End Call Button */}
          <TouchableOpacity
            style={styles.endCallButton}
            onPress={handleEndCall}
          >
            <MaterialIcon 
              name="call_end" 
              size={32} 
              color="#FFFFFF" 
            />
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing.xl,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: tokens.spacing.xl,
  },
  pulseRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    top: -10,
    left: -10,
  },
  contactName: {
    ...tokens.typography.h1,
    color: tokens.colors.onSurface,
    textAlign: 'center',
    marginBottom: tokens.spacing.m,
  },
  statusText: {
    ...tokens.typography.body,
    color: tokens.colors.onSurface60,
    textAlign: 'center',
  },
  controlsContainer: {
    paddingBottom: tokens.spacing.xxl,
    paddingHorizontal: tokens.spacing.xl,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: tokens.spacing.l,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: tokens.colors.surface2,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  activeControlButton: {
    backgroundColor: tokens.colors.secondary,
  },
  endCallButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: tokens.colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    marginLeft: tokens.spacing.m,
  },
});
