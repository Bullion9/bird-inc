import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { Text } from 'react-native-paper';
import { MotiView } from 'moti';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as Haptics from 'expo-haptics';

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

  // Debug: Log when screen mounts
  React.useEffect(() => {
    console.log('MyQRScreen mounted - Coming Soon feature');
    console.log('User data:', {
      qrSize,
      userId: userData.userId,
      name: userData.name
    });
  }, []);

  const handleShare = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      Alert.alert(
        'Coming Soon',
        'QR code sharing will be available in the next update!',
        [{ text: 'OK', style: 'default' }]
      );
    } catch (error) {
      console.error('Error sharing QR code:', error);
    }
  };

  const handleSaveToPhotos = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Alert.alert(
        'Coming Soon',
        'Save to photos will be available in the next update!',
        [{ text: 'OK', style: 'default' }]
      );
    } catch (error) {
      console.error('Error saving QR code:', error);
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
        Alert.alert('Coming Soon', 'Copy link feature will be available in the next update!');
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

        {/* Coming Soon Feature */}
        <MotiView
          from={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'timing', duration: 400, delay: 200 }}
          style={styles.qrSection}
        >
          <View style={styles.qrContainer} ref={qrRef}>
            <View style={styles.comingSoonBackground}>
              <View style={styles.comingSoonContent}>
                <MaterialIcon name="qrcode" size={80} color={tokens.colors.primary} />
                <Text style={styles.comingSoonTitle}>QR Code Generation</Text>
                <Text style={styles.comingSoonSubtitle}>Coming Soon</Text>
                <View style={styles.comingSoonBadge}>
                  <MaterialIcon name="schedule" size={16} color="#FFFFFF" />
                  <Text style={styles.comingSoonBadgeText}>In Development</Text>
                </View>
              </View>
            </View>
          </View>
          
          <Text style={styles.qrDescription}>
            This feature will allow others to scan your code to add you as a contact and start chatting
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
          <MaterialIcon name="information" size={20} color="#FF9500" />
          <Text style={styles.infoText}>
            🚀 We're working hard to bring you QR code generation! This feature will allow 
            others to scan your unique code to instantly add you on Bird and start conversations. 
            Stay tuned for the next update!
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
  qrErrorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: tokens.colors.surface1,
  },
  qrErrorText: {
    ...tokens.typography.caption,
    color: tokens.colors.onSurface38,
    marginTop: tokens.spacing.s,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: tokens.spacing.m,
    paddingHorizontal: tokens.spacing.m,
    paddingVertical: tokens.spacing.s,
    backgroundColor: tokens.colors.primary,
    borderRadius: tokens.radius.s,
  },
  retryText: {
    ...tokens.typography.caption,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  comingSoonBackground: {
    backgroundColor: '#FFFFFF',
    padding: tokens.spacing.l,
    borderRadius: tokens.radius.l,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    width: qrSize,
    height: qrSize,
    borderWidth: 2,
    borderColor: tokens.colors.primary,
    borderStyle: 'dashed',
  },
  comingSoonContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  comingSoonTitle: {
    ...tokens.typography.h3,
    color: tokens.colors.onSurface,
    fontWeight: '600',
    marginTop: tokens.spacing.m,
    textAlign: 'center',
  },
  comingSoonSubtitle: {
    ...tokens.typography.h2,
    color: tokens.colors.primary,
    fontWeight: '700',
    marginTop: tokens.spacing.s,
    textAlign: 'center',
  },
  comingSoonBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF9500',
    paddingHorizontal: tokens.spacing.s,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: tokens.spacing.m,
  },
  comingSoonBadgeText: {
    ...tokens.typography.caption,
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 4,
    fontSize: 11,
  },
});
