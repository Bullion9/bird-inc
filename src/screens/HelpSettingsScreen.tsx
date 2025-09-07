import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as Haptics from 'expo-haptics';

import { tokens } from '../theme/tokens';
import { SettingsStackParamList } from '../navigation/types';
import { DynamicHeader, MaterialIcon } from '../components';

type HelpSettingsNavigationProp = StackNavigationProp<SettingsStackParamList, 'HelpSettings'>;

export const HelpSettingsScreen: React.FC = () => {
  const navigation = useNavigation<HelpSettingsNavigationProp>();
  const [scrollOffset, setScrollOffset] = useState(0);

  // Icon color mapping for better visual hierarchy
  const getIconColor = (iconName: string): string => {
    const colorMap: Record<string, string> = {
      // Getting started icons - learning theme
      'info': '#2196F3',
      'play_circle': '#4CAF50',
      'star': '#FF9800',
      // Common issues icons - problem theme
      'settings': '#FF9500',
      'error': '#FF453A',
      'notifications': '#5856D6',
      'schedule': '#FF9500',
      // Account & security icons - security theme
      'lock': '#FF453A',
      // Support icons - help theme
      'help': '#007AFF',
      'chat': '#34C759',
      // Legal icons - document theme
      'check': '#34C759',
      'visibility': '#5856D6',
      'circle': '#00C7BE',
      // About icons - info theme
      'tag': '#FF9500',
    };
    return colorMap[iconName] || '#007AFF';
  };

  const getIconBackgroundColor = (iconName: string): string => {
    // iOS Settings-style solid background colors
    const backgroundColorMap: Record<string, string> = {
      // Getting started icons
      'info': '#007AFF',              // Blue background
      'play_circle': '#34C759',       // Green background  
      'star': '#FF9500',              // Orange background
      // Common issues icons
      'settings': '#FF9500',          // Orange background
      'error': '#FF453A',             // Red background
      'notifications': '#5856D6',     // Purple background
      'schedule': '#FF9500',          // Orange background
      // Account & security icons
      'lock': '#FF453A',              // Red background
      // Support icons
      'help': '#007AFF',              // Blue background
      'chat': '#34C759',              // Green background
      // Legal icons
      'check': '#34C759',             // Green background
      'visibility': '#5856D6',        // Purple background
      'circle': '#00C7BE',            // Teal background
      // About icons
      'tag': '#FF9500',               // Orange background
      // Chevron icons
      'chevron_right': '#8E8E93',     // Gray background
    };
    return backgroundColorMap[iconName] || '#007AFF';
  };

  const handleActionPress = (action: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    console.log(`Action pressed: ${action}`);
  };

  return (
    <View style={styles.container}>
      <DynamicHeader 
        title="Help"
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
        {/* Getting Started */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Getting Started</Text>
          <View style={styles.cardGroup}>
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => handleActionPress('quick-start')}
              activeOpacity={0.7}
            >
              <View style={styles.settingItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor('info') }]}>
                  <MaterialIcon name="info" size={20} color="#FFFFFF" />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Quick Start Guide</Text>
                  <Text style={styles.settingSubtitle}>Learn the basics of Bird Chat</Text>
                </View>
              </View>
              <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor('chevron_right') }]}>
                <MaterialIcon name="chevron_right" size={20} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
            
            <View style={styles.separator} />
            
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => handleActionPress('tutorials')}
              activeOpacity={0.7}
            >
              <View style={styles.settingItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor('play_circle') }]}>
                  <MaterialIcon name="play_circle" size={20} color="#FFFFFF" />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Video Tutorials</Text>
                  <Text style={styles.settingSubtitle}>Step-by-step walkthroughs</Text>
                </View>
              </View>
              <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor('chevron_right') }]}>
                <MaterialIcon name="chevron_right" size={20} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
            
            <View style={styles.separator} />
            
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => handleActionPress('features')}
              activeOpacity={0.7}
            >
              <View style={styles.settingItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor('star') }]}>
                  <MaterialIcon name="star" size={20} color="#FFFFFF" />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>New Features</Text>
                  <Text style={styles.settingSubtitle}>Discover what's new</Text>
                </View>
              </View>
              <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor('chevron_right') }]}>
                <MaterialIcon name="chevron_right" size={20} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Common Issues */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Common Issues</Text>
          <View style={styles.cardGroup}>
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => handleActionPress('connection-issues')}
              activeOpacity={0.7}
            >
              <View style={styles.settingItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor('settings') }]}>
                  <MaterialIcon name="settings" size={20} color="#FFFFFF" />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Connection Problems</Text>
                  <Text style={styles.settingSubtitle}>Troubleshoot network issues</Text>
                </View>
              </View>
              <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor('chevron_right') }]}>
                <MaterialIcon name="chevron_right" size={20} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
            
            <View style={styles.separator} />
            
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => handleActionPress('message-issues')}
              activeOpacity={0.7}
            >
              <View style={styles.settingItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor('error') }]}>
                  <MaterialIcon name="error" size={20} color="#FFFFFF" />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Messages Not Sending</Text>
                  <Text style={styles.settingSubtitle}>Fix delivery problems</Text>
                </View>
              </View>
              <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor('chevron_right') }]}>
                <MaterialIcon name="chevron_right" size={20} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
            
            <View style={styles.separator} />
            
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => handleActionPress('notification-issues')}
              activeOpacity={0.7}
            >
              <View style={styles.settingItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor('notifications') }]}>
                  <MaterialIcon name="notifications" size={20} color="#FFFFFF" />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Notification Problems</Text>
                  <Text style={styles.settingSubtitle}>Not receiving alerts</Text>
                </View>
              </View>
              <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor('chevron_right') }]}>
                <MaterialIcon name="chevron_right" size={20} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
            
            <View style={styles.separator} />
            
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => handleActionPress('performance-issues')}
              activeOpacity={0.7}
            >
              <View style={styles.settingItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor('schedule') }]}>
                  <MaterialIcon name="schedule" size={20} color="#FFFFFF" />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>App Running Slow</Text>
                  <Text style={styles.settingSubtitle}>Improve performance</Text>
                </View>
              </View>
              <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor('chevron_right') }]}>
                <MaterialIcon name="chevron_right" size={20} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Account & Security */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account & Security</Text>
          <View style={styles.cardGroup}>
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => handleActionPress('account-recovery')}
              activeOpacity={0.7}
            >
              <View style={styles.settingItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor('lock') }]}>
                  <MaterialIcon name="lock" size={20} color="#FFFFFF" />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Account Recovery</Text>
                  <Text style={styles.settingSubtitle}>Regain access to your account</Text>
                </View>
              </View>
              <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor('chevron_right') }]}>
                <MaterialIcon name="chevron_right" size={20} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
            
            <View style={styles.separator} />
            
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => handleActionPress('security-tips')}
              activeOpacity={0.7}
            >
              <View style={styles.settingItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor('lock') }]}>
                  <MaterialIcon name="lock" size={20} color="#FFFFFF" />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Security Tips</Text>
                  <Text style={styles.settingSubtitle}>Keep your account safe</Text>
                </View>
              </View>
              <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor('chevron_right') }]}>
                <MaterialIcon name="chevron_right" size={20} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
            
            <View style={styles.separator} />
            
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => handleActionPress('blocked-contacts')}
              activeOpacity={0.7}
            >
              <View style={styles.settingItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: '#FF453A' }]}>
                  <MaterialIcon name="block" size={20} color="#FFFFFF" />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Managing Blocked Users</Text>
                  <Text style={styles.settingSubtitle}>Block and unblock contacts</Text>
                </View>
              </View>
              <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor('chevron_right') }]}>
                <MaterialIcon name="chevron_right" size={20} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.cardGroup}>
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => handleActionPress('faq')}
              activeOpacity={0.7}
            >
              <View style={styles.settingItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor('help') }]}>
                  <MaterialIcon name="help" size={20} color="#FFFFFF" />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>FAQ</Text>
                  <Text style={styles.settingSubtitle}>Frequently asked questions</Text>
                </View>
              </View>
              <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor('chevron_right') }]}>
                <MaterialIcon name="chevron_right" size={20} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
            
            <View style={styles.separator} />
            
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => handleActionPress('contact-support')}
              activeOpacity={0.7}
            >
              <View style={styles.settingItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor('chat') }]}>
                  <MaterialIcon name="chat" size={20} color="#FFFFFF" />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Contact Support</Text>
                  <Text style={styles.settingSubtitle}>Get help from our team</Text>
                </View>
              </View>
              <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor('chevron_right') }]}>
                <MaterialIcon name="chevron_right" size={20} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
            
            <View style={styles.separator} />
            
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => handleActionPress('bug-report')}
              activeOpacity={0.7}
            >
              <View style={styles.settingItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor('error') }]}>
                  <MaterialIcon name="error" size={20} color="#FFFFFF" />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Report a Bug</Text>
                  <Text style={styles.settingSubtitle}>Help us improve the app</Text>
                </View>
              </View>
              <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor('chevron_right') }]}>
                <MaterialIcon name="chevron_right" size={20} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
            
            <View style={styles.separator} />
            
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => handleActionPress('feedback')}
              activeOpacity={0.7}
            >
              <View style={styles.settingItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor('chat') }]}>
                  <MaterialIcon name="chat" size={20} color="#FFFFFF" />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Send Feedback</Text>
                  <Text style={styles.settingSubtitle}>Share your thoughts</Text>
                </View>
              </View>
              <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor('chevron_right') }]}>
                <MaterialIcon name="chevron_right" size={20} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Legal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>
          <View style={styles.cardGroup}>
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => handleActionPress('terms')}
              activeOpacity={0.7}
            >
              <View style={styles.settingItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor('check') }]}>
                  <MaterialIcon name="check" size={20} color="#FFFFFF" />
                </View>
                <Text style={styles.settingTitle}>Terms of Service</Text>
              </View>
              <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor('chevron_right') }]}>
                <MaterialIcon name="chevron_right" size={20} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
            
            <View style={styles.separator} />
            
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => handleActionPress('privacy-policy')}
              activeOpacity={0.7}
            >
              <View style={styles.settingItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor('visibility') }]}>
                  <MaterialIcon name="visibility" size={20} color="#FFFFFF" />
                </View>
                <Text style={styles.settingTitle}>Privacy Policy</Text>
              </View>
              <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor('chevron_right') }]}>
                <MaterialIcon name="chevron_right" size={20} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
            
            <View style={styles.separator} />
            
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => handleActionPress('licenses')}
              activeOpacity={0.7}
            >
              <View style={styles.settingItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor('circle') }]}>
                  <MaterialIcon name="circle" size={20} color="#FFFFFF" />
                </View>
                <Text style={styles.settingTitle}>Open Source Licenses</Text>
              </View>
              <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor('chevron_right') }]}>
                <MaterialIcon name="chevron_right" size={20} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.cardGroup}>
            <View style={styles.settingItem}>
              <View style={styles.settingItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor('tag') }]}>
                  <MaterialIcon name="tag" size={20} color="#FFFFFF" />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Version</Text>
                  <Text style={styles.settingSubtitle}>Bird Chat v1.0.0 (Build 2025.1)</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.separator} />
            
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => handleActionPress('whats-new')}
              activeOpacity={0.7}
            >
              <View style={styles.settingItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor('star') }]}>
                  <MaterialIcon name="star" size={20} color="#FFFFFF" />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>What's New</Text>
                  <Text style={styles.settingSubtitle}>Latest updates and features</Text>
                </View>
              </View>
              <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor('chevron_right') }]}>
                <MaterialIcon name="chevron_right" size={20} color="#FFFFFF" />
              </View>
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
    paddingBottom: tokens.spacing.xl,
    paddingTop: 135, // Space for header + optimal top spacing
  },
  section: {
    marginBottom: tokens.spacing.l,
  },
  sectionTitle: {
    ...tokens.typography.caption,
    color: tokens.colors.onSurface60,
    fontWeight: '600',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: tokens.spacing.s,
    marginLeft: tokens.spacing.s,
  },
  cardGroup: {
    backgroundColor: tokens.colors.surface1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: tokens.spacing.m,
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
    marginLeft: 52, // Align with text after icon
  },
});
