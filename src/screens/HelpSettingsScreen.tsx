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
                <View style={styles.iconContainer}>
                  <MaterialIcon name="info" size={20} color={tokens.colors.primary} />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Quick Start Guide</Text>
                  <Text style={styles.settingSubtitle}>Learn the basics of Bird Chat</Text>
                </View>
              </View>
              <MaterialIcon name="chevron_right" size={20} color={tokens.colors.onSurface60} />
            </TouchableOpacity>
            
            <View style={styles.separator} />
            
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => handleActionPress('tutorials')}
              activeOpacity={0.7}
            >
              <View style={styles.settingItemLeft}>
                <View style={styles.iconContainer}>
                  <MaterialIcon name="play_circle" size={20} color={tokens.colors.primary} />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Video Tutorials</Text>
                  <Text style={styles.settingSubtitle}>Step-by-step walkthroughs</Text>
                </View>
              </View>
              <MaterialIcon name="chevron_right" size={20} color={tokens.colors.onSurface60} />
            </TouchableOpacity>
            
            <View style={styles.separator} />
            
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => handleActionPress('features')}
              activeOpacity={0.7}
            >
              <View style={styles.settingItemLeft}>
                <View style={styles.iconContainer}>
                  <MaterialIcon name="star" size={20} color={tokens.colors.primary} />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>New Features</Text>
                  <Text style={styles.settingSubtitle}>Discover what's new</Text>
                </View>
              </View>
              <MaterialIcon name="chevron_right" size={20} color={tokens.colors.onSurface60} />
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
                <View style={styles.iconContainer}>
                  <MaterialIcon name="settings" size={20} color={tokens.colors.primary} />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Connection Problems</Text>
                  <Text style={styles.settingSubtitle}>Troubleshoot network issues</Text>
                </View>
              </View>
              <MaterialIcon name="chevron_right" size={20} color={tokens.colors.onSurface60} />
            </TouchableOpacity>
            
            <View style={styles.separator} />
            
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => handleActionPress('message-issues')}
              activeOpacity={0.7}
            >
              <View style={styles.settingItemLeft}>
                <View style={styles.iconContainer}>
                  <MaterialIcon name="error" size={20} color={tokens.colors.primary} />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Messages Not Sending</Text>
                  <Text style={styles.settingSubtitle}>Fix delivery problems</Text>
                </View>
              </View>
              <MaterialIcon name="chevron_right" size={20} color={tokens.colors.onSurface60} />
            </TouchableOpacity>
            
            <View style={styles.separator} />
            
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => handleActionPress('notification-issues')}
              activeOpacity={0.7}
            >
              <View style={styles.settingItemLeft}>
                <View style={styles.iconContainer}>
                  <MaterialIcon name="notifications" size={20} color={tokens.colors.primary} />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Notification Problems</Text>
                  <Text style={styles.settingSubtitle}>Not receiving alerts</Text>
                </View>
              </View>
              <MaterialIcon name="chevron_right" size={20} color={tokens.colors.onSurface60} />
            </TouchableOpacity>
            
            <View style={styles.separator} />
            
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => handleActionPress('performance-issues')}
              activeOpacity={0.7}
            >
              <View style={styles.settingItemLeft}>
                <View style={styles.iconContainer}>
                  <MaterialIcon name="schedule" size={20} color={tokens.colors.primary} />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>App Running Slow</Text>
                  <Text style={styles.settingSubtitle}>Improve performance</Text>
                </View>
              </View>
              <MaterialIcon name="chevron_right" size={20} color={tokens.colors.onSurface60} />
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
                <View style={styles.iconContainer}>
                  <MaterialIcon name="lock" size={20} color={tokens.colors.primary} />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Account Recovery</Text>
                  <Text style={styles.settingSubtitle}>Regain access to your account</Text>
                </View>
              </View>
              <MaterialIcon name="chevron_right" size={20} color={tokens.colors.onSurface60} />
            </TouchableOpacity>
            
            <View style={styles.separator} />
            
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => handleActionPress('security-tips')}
              activeOpacity={0.7}
            >
              <View style={styles.settingItemLeft}>
                <View style={styles.iconContainer}>
                  <MaterialIcon name="lock" size={20} color={tokens.colors.primary} />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Security Tips</Text>
                  <Text style={styles.settingSubtitle}>Keep your account safe</Text>
                </View>
              </View>
              <MaterialIcon name="chevron_right" size={20} color={tokens.colors.onSurface60} />
            </TouchableOpacity>
            
            <View style={styles.separator} />
            
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => handleActionPress('blocked-contacts')}
              activeOpacity={0.7}
            >
              <View style={styles.settingItemLeft}>
                <View style={styles.iconContainer}>
                  <Text style={{ fontSize: 12, color: tokens.colors.primary }}>🚫</Text>
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Managing Blocked Users</Text>
                  <Text style={styles.settingSubtitle}>Block and unblock contacts</Text>
                </View>
              </View>
              <MaterialIcon name="chevron_right" size={20} color={tokens.colors.onSurface60} />
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
                <View style={styles.iconContainer}>
                  <MaterialIcon name="help" size={20} color={tokens.colors.primary} />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>FAQ</Text>
                  <Text style={styles.settingSubtitle}>Frequently asked questions</Text>
                </View>
              </View>
              <MaterialIcon name="chevron_right" size={20} color={tokens.colors.onSurface60} />
            </TouchableOpacity>
            
            <View style={styles.separator} />
            
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => handleActionPress('contact-support')}
              activeOpacity={0.7}
            >
              <View style={styles.settingItemLeft}>
                <View style={styles.iconContainer}>
                  <MaterialIcon name="chat" size={20} color={tokens.colors.primary} />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Contact Support</Text>
                  <Text style={styles.settingSubtitle}>Get help from our team</Text>
                </View>
              </View>
              <MaterialIcon name="chevron_right" size={20} color={tokens.colors.onSurface60} />
            </TouchableOpacity>
            
            <View style={styles.separator} />
            
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => handleActionPress('bug-report')}
              activeOpacity={0.7}
            >
              <View style={styles.settingItemLeft}>
                <View style={styles.iconContainer}>
                  <MaterialIcon name="error" size={20} color={tokens.colors.primary} />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Report a Bug</Text>
                  <Text style={styles.settingSubtitle}>Help us improve the app</Text>
                </View>
              </View>
              <MaterialIcon name="chevron_right" size={20} color={tokens.colors.onSurface60} />
            </TouchableOpacity>
            
            <View style={styles.separator} />
            
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => handleActionPress('feedback')}
              activeOpacity={0.7}
            >
              <View style={styles.settingItemLeft}>
                <View style={styles.iconContainer}>
                  <MaterialIcon name="chat" size={20} color={tokens.colors.primary} />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Send Feedback</Text>
                  <Text style={styles.settingSubtitle}>Share your thoughts</Text>
                </View>
              </View>
              <MaterialIcon name="chevron_right" size={20} color={tokens.colors.onSurface60} />
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
                <View style={styles.iconContainer}>
                  <MaterialIcon name="check" size={20} color={tokens.colors.primary} />
                </View>
                <Text style={styles.settingTitle}>Terms of Service</Text>
              </View>
              <MaterialIcon name="chevron_right" size={20} color={tokens.colors.onSurface60} />
            </TouchableOpacity>
            
            <View style={styles.separator} />
            
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => handleActionPress('privacy-policy')}
              activeOpacity={0.7}
            >
              <View style={styles.settingItemLeft}>
                <View style={styles.iconContainer}>
                  <MaterialIcon name="visibility" size={20} color={tokens.colors.primary} />
                </View>
                <Text style={styles.settingTitle}>Privacy Policy</Text>
              </View>
              <MaterialIcon name="chevron_right" size={20} color={tokens.colors.onSurface60} />
            </TouchableOpacity>
            
            <View style={styles.separator} />
            
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => handleActionPress('licenses')}
              activeOpacity={0.7}
            >
              <View style={styles.settingItemLeft}>
                <View style={styles.iconContainer}>
                  <MaterialIcon name="circle" size={20} color={tokens.colors.primary} />
                </View>
                <Text style={styles.settingTitle}>Open Source Licenses</Text>
              </View>
              <MaterialIcon name="chevron_right" size={20} color={tokens.colors.onSurface60} />
            </TouchableOpacity>
          </View>
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.cardGroup}>
            <View style={styles.settingItem}>
              <View style={styles.settingItemLeft}>
                <View style={styles.iconContainer}>
                  <MaterialIcon name="tag" size={20} color={tokens.colors.primary} />
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
                <View style={styles.iconContainer}>
                  <MaterialIcon name="star" size={20} color={tokens.colors.primary} />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>What's New</Text>
                  <Text style={styles.settingSubtitle}>Latest updates and features</Text>
                </View>
              </View>
              <MaterialIcon name="chevron_right" size={20} color={tokens.colors.onSurface60} />
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
