import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Linking, Platform } from 'react-native';
import { Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as Haptics from 'expo-haptics';

import { tokens } from '../theme/tokens';
import { SettingsStackParamList } from '../navigation/types';
import { DynamicHeader, MaterialIcon } from '../components';

type DesktopAppNavigationProp = StackNavigationProp<SettingsStackParamList, 'DesktopApp'>;

export const DesktopAppScreen: React.FC = () => {
  const navigation = useNavigation<DesktopAppNavigationProp>();
  const [scrollOffset, setScrollOffset] = useState(0);

  const openDownloadLink = async (platform: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    const urls = {
      windows: 'https://birdchat.com/download/windows',
      mac: 'https://birdchat.com/download/mac',
      linux: 'https://birdchat.com/download/linux',
      web: 'https://web.birdchat.com',
    };

    try {
      await Linking.openURL(urls[platform as keyof typeof urls]);
    } catch (error) {
      console.error('Error opening download link:', error);
    }
  };

  const features = [
    {
      icon: 'sync',
      title: 'Sync Across Devices',
      description: 'All your chats and media automatically synced',
    },
    {
      icon: 'keyboard',
      title: 'Better Typing Experience',
      description: 'Full keyboard shortcuts and faster typing',
    },
    {
      icon: 'file-multiple',
      title: 'Drag & Drop Files',
      description: 'Easily share files by dragging them into chats',
    },
    {
      icon: 'picture-in-picture-bottom-right',
      title: 'Multi-Window Support',
      description: 'Chat in multiple windows simultaneously',
    },
    {
      icon: 'bell',
      title: 'Desktop Notifications',
      description: 'Never miss a message with native notifications',
    },
    {
      icon: 'fullscreen',
      title: 'Larger Screen',
      description: 'See more of your conversations at once',
    },
  ];

  return (
    <View style={styles.container}>
      <DynamicHeader 
        title="Desktop App"
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
        scrollY={scrollOffset}
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        onScroll={(event) => {
          setScrollOffset(event.nativeEvent.contentOffset.y);
        }}
        scrollEventThrottle={16}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroIcon}>
            <MaterialIcon name="laptop" size={64} color={tokens.colors.primary} />
          </View>
          <Text style={styles.heroTitle}>Bird Chat for Desktop</Text>
          <Text style={styles.heroSubtitle}>
            Get the full Bird Chat experience on your computer with enhanced features and better productivity.
          </Text>
        </View>

        {/* Quick Access - Web App */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Try Now</Text>
          <View style={styles.cardGroup}>
            <TouchableOpacity 
              style={styles.webAppButton}
              onPress={() => openDownloadLink('web')}
              activeOpacity={0.7}
            >
              <View style={styles.webAppIcon}>
                <MaterialIcon name="web" size={32} color="#FFFFFF" />
              </View>
              <View style={styles.webAppInfo}>
                <Text style={styles.webAppTitle}>Bird Chat Web</Text>
                <Text style={styles.webAppSubtitle}>Use instantly in your browser - no download required</Text>
              </View>
              <MaterialIcon 
                name="open-in-new" 
                size={20} 
                color={tokens.colors.onSurface60} 
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Download Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Download Desktop App</Text>
          <View style={styles.cardGroup}>
            <TouchableOpacity 
              style={styles.downloadItem}
              onPress={() => openDownloadLink('windows')}
              activeOpacity={0.7}
            >
              <View style={styles.downloadItemLeft}>
                <View style={[styles.platformIcon, { backgroundColor: '#0078D4' }]}>
                  <MaterialIcon name="microsoft-windows" size={24} color="#FFFFFF" />
                </View>
                <View style={styles.downloadInfo}>
                  <Text style={styles.platformName}>Windows</Text>
                  <Text style={styles.platformDetails}>Windows 10 or later • 64-bit</Text>
                </View>
              </View>
              <MaterialIcon 
                name="download" 
                size={20} 
                color={tokens.colors.onSurface60} 
              />
            </TouchableOpacity>
            
            <View style={styles.separator} />
            
            <TouchableOpacity 
              style={styles.downloadItem}
              onPress={() => openDownloadLink('mac')}
              activeOpacity={0.7}
            >
              <View style={styles.downloadItemLeft}>
                <View style={[styles.platformIcon, { backgroundColor: '#000000' }]}>
                  <MaterialIcon name="apple" size={24} color="#FFFFFF" />
                </View>
                <View style={styles.downloadInfo}>
                  <Text style={styles.platformName}>macOS</Text>
                  <Text style={styles.platformDetails}>macOS 11.0 or later • Intel & Apple Silicon</Text>
                </View>
              </View>
              <MaterialIcon 
                name="download" 
                size={20} 
                color={tokens.colors.onSurface60} 
              />
            </TouchableOpacity>
            
            <View style={styles.separator} />
            
            <TouchableOpacity 
              style={styles.downloadItem}
              onPress={() => openDownloadLink('linux')}
              activeOpacity={0.7}
            >
              <View style={styles.downloadItemLeft}>
                <View style={[styles.platformIcon, { backgroundColor: '#FCC624' }]}>
                  <Text style={styles.linuxIcon}>🐧</Text>
                </View>
                <View style={styles.downloadInfo}>
                  <Text style={styles.platformName}>Linux</Text>
                  <Text style={styles.platformDetails}>Ubuntu 18.04+ • Debian 9+ • AppImage</Text>
                </View>
              </View>
              <MaterialIcon 
                name="download" 
                size={20} 
                color={tokens.colors.onSurface60} 
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Desktop Features</Text>
          <View style={styles.cardGroup}>
            {features.map((feature, index) => (
              <React.Fragment key={feature.title}>
                <View style={styles.featureItem}>
                  <View style={styles.featureIcon}>
                    <MaterialIcon name={feature.icon} size={20} color={tokens.colors.primary} />
                  </View>
                  <View style={styles.featureInfo}>
                    <Text style={styles.featureTitle}>{feature.title}</Text>
                    <Text style={styles.featureDescription}>{feature.description}</Text>
                  </View>
                </View>
                {index < features.length - 1 && <View style={styles.separator} />}
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* System Requirements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System Requirements</Text>
          <View style={styles.cardGroup}>
            <View style={styles.requirementItem}>
              <View style={styles.requirementHeader}>
                <MaterialIcon name="chip" size={20} color={tokens.colors.onSurface60} />
                <Text style={styles.requirementTitle}>Minimum Requirements</Text>
              </View>
              <View style={styles.requirementList}>
                <Text style={styles.requirementText}>• 4 GB RAM</Text>
                <Text style={styles.requirementText}>• 500 MB free disk space</Text>
                <Text style={styles.requirementText}>• Internet connection</Text>
                <Text style={styles.requirementText}>• Webcam & microphone (for calls)</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Need Help?</Text>
          <View style={styles.cardGroup}>
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => console.log('Desktop FAQ')}
              activeOpacity={0.7}
            >
              <View style={styles.settingItemLeft}>
                <View style={styles.iconContainer}>
                  <MaterialIcon name="help" size={20} color="#FFFFFF" />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Desktop App FAQ</Text>
                  <Text style={styles.settingSubtitle}>Common questions and troubleshooting</Text>
                </View>
              </View>
              <MaterialIcon 
                name="chevron_right" 
                size={20} 
                color={tokens.colors.onSurface60} 
              />
            </TouchableOpacity>
            
            <View style={styles.separator} />
            
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => console.log('Contact support')}
              activeOpacity={0.7}
            >
              <View style={styles.settingItemLeft}>
                <View style={styles.iconContainer}>
                  <MaterialIcon name="headset" size={20} color="#FFFFFF" />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Contact Support</Text>
                  <Text style={styles.settingSubtitle}>Get help with desktop app issues</Text>
                </View>
              </View>
              <MaterialIcon 
                name="chevron_right" 
                size={20} 
                color={tokens.colors.onSurface60} 
              />
            </TouchableOpacity>
          </View>
        </View>
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
  content: {
    padding: tokens.spacing.m,
    paddingTop: 100,
    paddingBottom: tokens.spacing.xl,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: tokens.spacing.xl,
    marginBottom: tokens.spacing.l,
  },
  heroIcon: {
    marginBottom: tokens.spacing.l,
  },
  heroTitle: {
    ...tokens.typography.h2,
    color: tokens.colors.onSurface,
    fontWeight: '700',
    fontSize: 24,
    textAlign: 'center',
    marginBottom: tokens.spacing.s,
  },
  heroSubtitle: {
    ...tokens.typography.body,
    color: tokens.colors.onSurface60,
    textAlign: 'center',
    paddingHorizontal: tokens.spacing.l,
    lineHeight: 22,
  },
  section: {
    marginBottom: tokens.spacing.l,
  },
  sectionTitle: {
    ...tokens.typography.caption,
    color: tokens.colors.onSurface60,
    textTransform: 'uppercase',
    fontWeight: '600',
    fontSize: 12,
    marginBottom: tokens.spacing.m,
    marginLeft: tokens.spacing.xs,
  },
  cardGroup: {
    backgroundColor: tokens.colors.cardBackground,
    borderRadius: tokens.radius.m,
    marginHorizontal: tokens.spacing.xs,
    overflow: 'hidden',
    ...tokens.elevation.small,
  },
  webAppButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: tokens.spacing.l,
    paddingHorizontal: tokens.spacing.m,
    backgroundColor: tokens.colors.primary,
    margin: tokens.spacing.s,
    borderRadius: tokens.radius.m,
    gap: tokens.spacing.m,
  },
  webAppIcon: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
  },
  webAppInfo: {
    flex: 1,
    gap: tokens.spacing.xs,
  },
  webAppTitle: {
    ...tokens.typography.body,
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  webAppSubtitle: {
    ...tokens.typography.caption,
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
  },
  downloadItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: tokens.spacing.m,
    paddingHorizontal: tokens.spacing.m,
    minHeight: 64,
  },
  downloadItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: tokens.spacing.m,
  },
  platformIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  downloadInfo: {
    flex: 1,
    gap: tokens.spacing.xs / 2,
  },
  platformName: {
    ...tokens.typography.body,
    color: tokens.colors.onSurface,
    fontWeight: '600',
  },
  platformDetails: {
    ...tokens.typography.caption,
    color: tokens.colors.onSurface60,
    fontSize: 12,
  },
  linuxIcon: {
    fontSize: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: tokens.spacing.m,
    paddingHorizontal: tokens.spacing.m,
    gap: tokens.spacing.m,
  },
  featureIcon: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.colors.surface2,
    borderRadius: 8,
  },
  featureInfo: {
    flex: 1,
    gap: tokens.spacing.xs / 2,
  },
  featureTitle: {
    ...tokens.typography.body,
    color: tokens.colors.onSurface,
    fontWeight: '600',
  },
  featureDescription: {
    ...tokens.typography.caption,
    color: tokens.colors.onSurface60,
    fontSize: 12,
    lineHeight: 16,
  },
  requirementItem: {
    paddingVertical: tokens.spacing.m,
    paddingHorizontal: tokens.spacing.m,
    gap: tokens.spacing.m,
  },
  requirementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.s,
  },
  requirementTitle: {
    ...tokens.typography.body,
    color: tokens.colors.onSurface,
    fontWeight: '600',
  },
  requirementList: {
    gap: tokens.spacing.xs,
    marginLeft: tokens.spacing.l,
  },
  requirementText: {
    ...tokens.typography.caption,
    color: tokens.colors.onSurface60,
    fontSize: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: tokens.spacing.m,
    paddingHorizontal: tokens.spacing.m,
    minHeight: 56,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: tokens.spacing.m,
  },
  iconContainer: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: tokens.colors.primary,
  },
  settingTextContainer: {
    flex: 1,
    gap: tokens.spacing.xs / 2,
  },
  settingTitle: {
    ...tokens.typography.body,
    color: tokens.colors.onSurface,
    fontWeight: '500',
  },
  settingSubtitle: {
    ...tokens.typography.caption,
    color: tokens.colors.onSurface60,
    fontSize: 12,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: tokens.colors.surface3,
    marginLeft: 52,
  },
});
