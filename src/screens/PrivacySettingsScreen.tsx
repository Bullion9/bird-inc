import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as Haptics from 'expo-haptics';

import { tokens } from '../theme/tokens';
import { SettingsStackParamList } from '../navigation/types';
import { DynamicHeader, MaterialIcon } from '../components';

type PrivacySettingsNavigationProp = StackNavigationProp<SettingsStackParamList, 'PrivacySettings'>;

export const PrivacySettingsScreen: React.FC = () => {
  const navigation = useNavigation<PrivacySettingsNavigationProp>();
  const [scrollOffset, setScrollOffset] = useState(0);

  // Privacy settings state
  const [readReceipts, setReadReceipts] = useState(true);
  const [lastSeen, setLastSeen] = useState(true);
  const [onlineStatus, setOnlineStatus] = useState(true);
  const [profilePhoto, setProfilePhoto] = useState(true);
  const [status, setStatus] = useState(true);
  const [groups, setGroups] = useState(true);
  const [liveLocation, setLiveLocation] = useState(false);
  const [calls, setCalls] = useState(true);
  const [disappearingMessages, setDisappearingMessages] = useState(false);
  const [screenSecurity, setScreenSecurity] = useState(false);
  const [fingerprintLock, setFingerprintLock] = useState(false);
  const [twoStepVerification, setTwoStepVerification] = useState(false);

  // Icon color mapping for iOS-style vibrant backgrounds
  const getIconColor = (iconName: string): string => {
    const colorMap: Record<string, string> = {
      // Personal info icons - iOS colors
      'schedule': '#FF9500',
      'account_circle': '#007AFF',
      'info': '#34C759',
      'done_all': '#007AFF',
      // Contact permissions - iOS colors
      'group': '#34C759',
      'phone': '#007AFF',
      // Message privacy - iOS colors
      'auto_delete': '#5856D6',
      'location_on': '#FF453A',
      'block': '#FF453A',
      // Security icons - iOS colors
      'screen_lock_portrait': '#FF9500',
      'fingerprint': '#34C759',
      'verified_user': '#007AFF',
      // Advanced icons - iOS colors
      'assessment': '#FF9500',
      'file_download': '#00C7BE',
      'delete': '#FF453A',
    };
    return colorMap[iconName] || '#007AFF';
  };

  const getIconBackgroundColor = (iconName: string): string => {
    // iOS Settings-style solid background colors
    const backgroundColorMap: Record<string, string> = {
      // Personal info icons
      'schedule': '#FF9500',
      'account_circle': '#007AFF',
      'info': '#34C759',
      'done_all': '#007AFF',
      // Contact permissions
      'group': '#34C759',
      'phone': '#007AFF',
      // Message privacy
      'auto_delete': '#5856D6',
      'location_on': '#FF453A',
      'block': '#FF453A',
      // Security icons
      'screen_lock_portrait': '#FF9500',
      'fingerprint': '#34C759',
      'verified_user': '#007AFF',
      // Advanced icons
      'assessment': '#FF9500',
      'file_download': '#00C7BE',
      'delete': '#FF453A',
    };
    return backgroundColorMap[iconName] || '#007AFF';
  };

  const handleSwitchChange = (setter: (value: boolean) => void, currentValue: boolean) => {
    return (value: boolean) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setter(value);
    };
  };

  const handleActionPress = (action: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    console.log(`Action pressed: ${action}`);
  };

  return (
    <View style={styles.container}>
      <DynamicHeader 
        title="Privacy"
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
        {/* Who Can See My Personal Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Who Can See My Personal Info</Text>
          <View style={styles.cardGroup}>
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => handleActionPress('last-seen')}
              activeOpacity={0.7}
            >
              <View style={styles.settingItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor('schedule') }]}>
                  <MaterialIcon name="schedule" size={18} color="#FFFFFF" />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Last Seen</Text>
                  <Text style={styles.settingSubtitle}>Everyone</Text>
                </View>
              </View>
              <MaterialIcon name="chevron_right" size={20} color={tokens.colors.onSurface60} />
            </TouchableOpacity>
            
            <View style={styles.separator} />
            
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => handleActionPress('profile-photo')}
              activeOpacity={0.7}
            >
              <View style={styles.settingItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor('account_circle') }]}>
                  <MaterialIcon name="account_circle" size={18} color="#FFFFFF" />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Profile Photo</Text>
                  <Text style={styles.settingSubtitle}>Everyone</Text>
                </View>
              </View>
              <MaterialIcon name="chevron_right" size={20} color={tokens.colors.onSurface60} />
            </TouchableOpacity>
            
            <View style={styles.separator} />
            
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => handleActionPress('status')}
              activeOpacity={0.7}
            >
              <View style={styles.settingItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor('info') }]}>
                  <MaterialIcon name="info" size={18} color="#FFFFFF" />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Status</Text>
                  <Text style={styles.settingSubtitle}>My Contacts</Text>
                </View>
              </View>
              <MaterialIcon name="chevron_right" size={20} color={tokens.colors.onSurface60} />
            </TouchableOpacity>
            
            <View style={styles.separator} />
            
            <View style={styles.settingItem}>
              <View style={styles.settingItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor('done_all') }]}>
                  <MaterialIcon name="done_all" size={18} color="#FFFFFF" />
                </View>
                <Text style={styles.settingTitle}>Read Receipts</Text>
              </View>
              <Switch
                value={readReceipts}
                onValueChange={handleSwitchChange(setReadReceipts, readReceipts)}
                trackColor={{ false: tokens.colors.surface3, true: tokens.colors.primary }}
                thumbColor={tokens.colors.onSurface}
              />
            </View>
          </View>
        </View>

        {/* Who Can Contact Me */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Who Can Contact Me</Text>
          <View style={styles.cardGroup}>
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => handleActionPress('groups')}
              activeOpacity={0.7}
            >
              <View style={styles.settingItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor('group') }]}>
                  <MaterialIcon name="group" size={18} color="#FFFFFF" />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Groups</Text>
                  <Text style={styles.settingSubtitle}>Everyone</Text>
                </View>
              </View>
              <MaterialIcon name="chevron_right" size={20} color={tokens.colors.onSurface60} />
            </TouchableOpacity>
            
            <View style={styles.separator} />
            
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => handleActionPress('calls')}
              activeOpacity={0.7}
            >
              <View style={styles.settingItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor('phone') }]}>
                  <MaterialIcon name="phone" size={18} color="#FFFFFF" />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Calls</Text>
                  <Text style={styles.settingSubtitle}>Everyone</Text>
                </View>
              </View>
              <MaterialIcon name="chevron_right" size={20} color={tokens.colors.onSurface60} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Message Privacy */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Message Privacy</Text>
          <View style={styles.cardGroup}>
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => handleActionPress('disappearing-messages')}
              activeOpacity={0.7}
            >
              <View style={styles.settingItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor('auto_delete') }]}>
                  <MaterialIcon name="auto_delete" size={20} color="#FFFFFF" />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Disappearing Messages</Text>
                  <Text style={styles.settingSubtitle}>Off</Text>
                </View>
              </View>
              <MaterialIcon name="chevron_right" size={20} color={tokens.colors.onSurface60} />
            </TouchableOpacity>
            
            <View style={styles.separator} />
            
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => handleActionPress('live-location')}
              activeOpacity={0.7}
            >
              <View style={styles.settingItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor('location_on') }]}>
                  <MaterialIcon name="location_on" size={20} color="#FFFFFF" />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Live Location</Text>
                  <Text style={styles.settingSubtitle}>None</Text>
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
                <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor('block') }]}>
                  <MaterialIcon name="block" size={20} color="#FFFFFF" />
                </View>
                <Text style={styles.settingTitle}>Blocked Contacts</Text>
              </View>
              <MaterialIcon name="chevron_right" size={20} color={tokens.colors.onSurface60} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Security */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>
          <View style={styles.cardGroup}>
            <View style={styles.settingItem}>
              <View style={styles.settingItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor('screen_lock_portrait') }]}>
                  <MaterialIcon name="screen_lock_portrait" size={20} color="#FFFFFF" />
                </View>
                <Text style={styles.settingTitle}>Screen Security</Text>
              </View>
              <Switch
                value={screenSecurity}
                onValueChange={handleSwitchChange(setScreenSecurity, screenSecurity)}
                trackColor={{ false: tokens.colors.surface3, true: tokens.colors.primary }}
                thumbColor={tokens.colors.onSurface}
              />
            </View>
            
            <View style={styles.separator} />
            
            <View style={styles.settingItem}>
              <View style={styles.settingItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor('fingerprint') }]}>
                  <MaterialIcon name="fingerprint" size={18} color="#FFFFFF" />
                </View>
                <Text style={styles.settingTitle}>App Lock</Text>
              </View>
              <Switch
                value={fingerprintLock}
                onValueChange={handleSwitchChange(setFingerprintLock, fingerprintLock)}
                trackColor={{ false: tokens.colors.surface3, true: tokens.colors.primary }}
                thumbColor={tokens.colors.onSurface}
              />
            </View>
            
            <View style={styles.separator} />
            
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => handleActionPress('two-step-verification')}
              activeOpacity={0.7}
            >
              <View style={styles.settingItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor('verified_user') }]}>
                  <MaterialIcon name="verified_user" size={20} color="#FFFFFF" />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Two-Step Verification</Text>
                  <Text style={styles.settingSubtitle}>Disabled</Text>
                </View>
              </View>
              <MaterialIcon name="chevron_right" size={20} color={tokens.colors.onSurface60} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Advanced */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Advanced</Text>
          <View style={styles.cardGroup}>
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => handleActionPress('privacy-report')}
              activeOpacity={0.7}
            >
              <View style={styles.settingItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor('assessment') }]}>
                  <MaterialIcon name="assessment" size={20} color="#FFFFFF" />
                </View>
                <Text style={styles.settingTitle}>Privacy Report</Text>
              </View>
              <MaterialIcon name="chevron_right" size={20} color={tokens.colors.onSurface60} />
            </TouchableOpacity>
            
            <View style={styles.separator} />
            
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => handleActionPress('data-export')}
              activeOpacity={0.7}
            >
              <View style={styles.settingItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor('file_download') }]}>
                  <MaterialIcon name="file_download" size={20} color="#FFFFFF" />
                </View>
                <Text style={styles.settingTitle}>Request Account Info</Text>
              </View>
              <MaterialIcon name="chevron_right" size={20} color={tokens.colors.onSurface60} />
            </TouchableOpacity>
            
            <View style={styles.separator} />
            
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => handleActionPress('delete-account')}
              activeOpacity={0.7}
            >
              <View style={styles.settingItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor('delete') }]}>
                  <MaterialIcon name="delete" size={20} color="#FFFFFF" />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={[styles.settingTitle, { color: tokens.colors.error }]}>Delete My Account</Text>
                  <Text style={styles.settingSubtitle}>This action cannot be undone</Text>
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
