import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
  Dimensions,
} from 'react-native';
import { Text } from 'react-native-paper';
import { MotiView } from 'moti';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as Haptics from 'expo-haptics';
import QRCode from 'react-native-qrcode-svg';

import { tokens } from '../theme/tokens';
import { SettingsStackParamList } from '../navigation/types';
import { DynamicHeader, MaterialIcon } from '../components';

type MyQRNavigationProp = StackNavigationProp<SettingsStackParamList, 'MyQR'>;

const { width } = Dimensions.get('window');
const qrSize = width * 0.6;

// Mock user data - in a real app, this would come from user context/state
const userData = {
  name: 'John Doe',
  phone: '+1 234 567 8900',
  username: '@johndoe',
  avatar: null,
  userId: 'user_12345',
  bio: 'Love connecting with people!',
};

export const MyQRScreen: React.FC = () => {
  const navigation = useNavigation<MyQRNavigationProp>();
  const [scrollOffset, setScrollOffset] = useState(0);
  const qrRef = useRef<View>(null);

  // Generate QR data - contains contact information in vCard format
  const generateQRData = () => {
    // Create a vCard format for contact sharing
    const vCard = `BEGIN:VCARD
VERSION:3.0
FN:${userData.name}
TEL:${userData.phone}
URL:bird://user/${userData.userId}
NOTE:${userData.bio}
NICKNAME:${userData.username}
END:VCARD`;
    return vCard;
  };

  const qrData = generateQRData();

  const handleShare = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      await Share.share({
        title: 'My Bird QR Code',
        message: `Connect with me on Bird! Use this link: bird://user/${userData.userId}`,
      });
    } catch (error) {
      console.error('Error sharing QR code:', error);
      Alert.alert('Error', 'Failed to share QR code');
    }
  };

  const handleSaveToPhotos = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Alert.alert(
        'Save QR Code',
        'QR code saved to your photos!',
        [{ text: 'OK', style: 'default' }]
      );
    } catch (error) {
      console.error('Error saving QR code:', error);
      Alert.alert('Error', 'Failed to save QR code');
    }
  };

  const actionButtons = [
    {
      id: 'share',
      title: 'Share QR Code',
      icon: 'share',
      onPress: handleShare,
      color: tokens.colors.primary,
    },
    {
      id: 'save',
      title: 'Save to Photos',
      icon: 'download',
      onPress: handleSaveToPhotos,
      color: '#34C759',
    },
    {
      id: 'copy',
      title: 'Copy Link',
      icon: 'content-copy',
      onPress: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        Alert.alert('Copied', 'Profile link copied to clipboard');
      },
      color: '#FF9500',
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <DynamicHeader
        title="My QR Code"
        scrollY={scrollOffset}
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
        titleSize={18}
        rightIcons={[
          {
            icon: 'share',
            onPress: handleShare
          }
        ]}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        onScroll={(event) => setScrollOffset(event.nativeEvent.contentOffset.y)}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* User Info */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 300 }}
          style={styles.userSection}
        >
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <MaterialIcon name="account" size={40} color={tokens.colors.onSurface60} />
            </View>
          </View>
          
          <Text style={styles.userName}>{userData.name}</Text>
          <Text style={styles.userHandle}>{userData.username}</Text>
          <Text style={styles.userBio}>{userData.bio}</Text>
        </MotiView>

        {/* QR Code */}
        <MotiView
          from={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'timing', duration: 400, delay: 200 }}
          style={styles.qrSection}
        >
          <View style={styles.qrContainer} ref={qrRef}>
            <View style={styles.qrBackground}>
              <QRCode
                value={qrData}
                size={qrSize}
                color={tokens.colors.onSurface}
                backgroundColor="#FFFFFF"
                logoSize={30}
                logoMargin={2}
                logoBackgroundColor="transparent"
              />
            </View>
          </View>
          
          <Text style={styles.qrDescription}>
            Others can scan this code to add you as a contact and start chatting
          </Text>
        </MotiView>

        {/* Action Buttons */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 300, delay: 400 }}
          style={styles.actionsSection}
        >
          {actionButtons.map((button, index) => (
            <MotiView
              key={button.id}
              from={{ opacity: 0, translateX: -20 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{ type: 'timing', duration: 300, delay: 500 + index * 100 }}
            >
              <TouchableOpacity
                style={styles.actionButton}
                onPress={button.onPress}
                activeOpacity={0.7}
              >
                <View style={[styles.actionIcon, { backgroundColor: button.color }]}>
                  <MaterialIcon name={button.icon} size={20} color="#FFFFFF" />
                </View>
                
                <View style={styles.actionContent}>
                  <Text style={styles.actionTitle}>{button.title}</Text>
                </View>
                
                <MaterialIcon name="chevron_right" size={20} color={tokens.colors.onSurface38} />
              </TouchableOpacity>
              {index < actionButtons.length - 1 && <View style={styles.separator} />}
            </MotiView>
          ))}
        </MotiView>

        {/* Info Card */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', duration: 300, delay: 800 }}
          style={styles.infoCard}
        >
          <MaterialIcon name="information" size={20} color={tokens.colors.primary} />
          <Text style={styles.infoText}>
            Your QR code is unique to you and contains your contact information. 
            Anyone who scans it can add you on Bird and start a conversation.
          </Text>
        </MotiView>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.bg,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 100, // Space for header
    paddingHorizontal: tokens.spacing.m,
    paddingBottom: tokens.spacing.xl,
  },
  userSection: {
    alignItems: 'center',
    marginBottom: tokens.spacing.l,
  },
  avatarContainer: {
    marginBottom: tokens.spacing.m,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: tokens.colors.surface1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: tokens.colors.primary,
  },
  userName: {
    ...tokens.typography.h2,
    color: tokens.colors.onSurface,
    fontWeight: '600',
    marginBottom: 4,
  },
  userHandle: {
    ...tokens.typography.body,
    color: tokens.colors.primary,
    marginBottom: tokens.spacing.s,
  },
  userBio: {
    ...tokens.typography.caption,
    color: tokens.colors.onSurface60,
    textAlign: 'center',
    maxWidth: '80%',
  },
  qrSection: {
    alignItems: 'center',
    marginBottom: tokens.spacing.l,
  },
  qrContainer: {
    marginBottom: tokens.spacing.m,
  },
  qrBackground: {
    backgroundColor: '#FFFFFF',
    padding: tokens.spacing.m,
    borderRadius: tokens.radius.l,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  qrDescription: {
    ...tokens.typography.caption,
    color: tokens.colors.onSurface60,
    textAlign: 'center',
    maxWidth: '85%',
    lineHeight: 18,
  },
  actionsSection: {
    backgroundColor: tokens.colors.surface1,
    borderRadius: tokens.radius.m,
    overflow: 'hidden',
    marginBottom: tokens.spacing.l,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: tokens.spacing.m,
    paddingHorizontal: tokens.spacing.m,
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: tokens.spacing.m,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    ...tokens.typography.body,
    color: tokens.colors.onSurface,
    fontWeight: '500',
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginLeft: 48,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: tokens.colors.surface1,
    padding: tokens.spacing.m,
    borderRadius: tokens.radius.m,
    borderLeftWidth: 3,
    borderLeftColor: tokens.colors.primary,
  },
  infoText: {
    ...tokens.typography.caption,
    color: tokens.colors.onSurface60,
    flex: 1,
    marginLeft: tokens.spacing.s,
    lineHeight: 16,
  },
});
