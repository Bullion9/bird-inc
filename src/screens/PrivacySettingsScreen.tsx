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

  const ArrowIcon = () => (
    <Text style={styles.arrowIcon}>›</Text>
  );

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
                <View style={styles.iconContainer}>
                  <MaterialIcon name="visibility" size={20} color={tokens.colors.primary} />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Last Seen</Text>
                  <Text style={styles.settingSubtitle}>Everyone</Text>
                </View>
              </View>
              <ArrowIcon />
            </TouchableOpacity>
            
            <View style={styles.separator} />
            
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => handleActionPress('profile-photo')}
              activeOpacity={0.7}
            >
              <View style={styles.settingItemLeft}>
                <View style={styles.iconContainer}>
                  <MaterialIcon name="image" size={20} color={tokens.colors.primary} />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Profile Photo</Text>
                  <Text style={styles.settingSubtitle}>Everyone</Text>
                </View>
              </View>
              <ArrowIcon />
            </TouchableOpacity>
            
            <View style={styles.separator} />
            
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => handleActionPress('status')}
              activeOpacity={0.7}
            >
              <View style={styles.settingItemLeft}>
                <View style={styles.iconContainer}>
                  <MaterialIcon name="circle" size={20} color={tokens.colors.primary} />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Status</Text>
                  <Text style={styles.settingSubtitle}>My Contacts</Text>
                </View>
              </View>
              <ArrowIcon />
            </TouchableOpacity>
            
            <View style={styles.separator} />
            
            <View style={styles.settingItem}>
              <View style={styles.settingItemLeft}>
                <View style={styles.iconContainer}>
                  <MaterialIcon name="check" size={20} color={tokens.colors.primary} />
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
                <View style={styles.iconContainer}>
                  <MaterialIcon name="chat" size={20} color={tokens.colors.primary} />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Groups</Text>
                  <Text style={styles.settingSubtitle}>Everyone</Text>
                </View>
              </View>
              <ArrowIcon />
            </TouchableOpacity>
            
            <View style={styles.separator} />
            
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => handleActionPress('calls')}
              activeOpacity={0.7}
            >
              <View style={styles.settingItemLeft}>
                <View style={styles.iconContainer}>
                  <MaterialIcon name="phone" size={20} color={tokens.colors.primary} />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Calls</Text>
                  <Text style={styles.settingSubtitle}>Everyone</Text>
                </View>
              </View>
              <ArrowIcon />
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
                <View style={styles.iconContainer}>
                  <MaterialIcon name="visibility_off" size={20} color={tokens.colors.primary} />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Disappearing Messages</Text>
                  <Text style={styles.settingSubtitle}>Off</Text>
                </View>
              </View>
              <ArrowIcon />
            </TouchableOpacity>
            
            <View style={styles.separator} />
            
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => handleActionPress('live-location')}
              activeOpacity={0.7}
            >
              <View style={styles.settingItemLeft}>
                <View style={styles.iconContainer}>
                  <MaterialIcon name="circle" size={20} color={tokens.colors.primary} />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Live Location</Text>
                  <Text style={styles.settingSubtitle}>None</Text>
                </View>
              </View>
              <ArrowIcon />
            </TouchableOpacity>
            
            <View style={styles.separator} />
            
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => handleActionPress('blocked-contacts')}
              activeOpacity={0.7}
            >
              <View style={styles.settingItemLeft}>
                <View style={styles.iconContainer}>
                  <MaterialIcon name="block" size={20} color={tokens.colors.error} />
                </View>
                <Text style={styles.settingTitle}>Blocked Contacts</Text>
              </View>
              <ArrowIcon />
            </TouchableOpacity>
          </View>
        </View>

        {/* Security */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>
          <View style={styles.cardGroup}>
            <View style={styles.settingItem}>
              <View style={styles.settingItemLeft}>
                <View style={styles.iconContainer}>
                  <MaterialIcon name="lock" size={20} color={tokens.colors.primary} />
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
                <View style={styles.iconContainer}>
                  <MaterialIcon name="lock" size={20} color={tokens.colors.primary} />
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
                <View style={styles.iconContainer}>
                  <MaterialIcon name="lock" size={20} color={tokens.colors.primary} />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Two-Step Verification</Text>
                  <Text style={styles.settingSubtitle}>Disabled</Text>
                </View>
              </View>
              <ArrowIcon />
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
                <View style={styles.iconContainer}>
                  <MaterialIcon name="visibility" size={20} color={tokens.colors.primary} />
                </View>
                <Text style={styles.settingTitle}>Privacy Report</Text>
              </View>
              <ArrowIcon />
            </TouchableOpacity>
            
            <View style={styles.separator} />
            
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => handleActionPress('data-export')}
              activeOpacity={0.7}
            >
              <View style={styles.settingItemLeft}>
                <View style={styles.iconContainer}>
                  <MaterialIcon name="download" size={20} color={tokens.colors.primary} />
                </View>
                <Text style={styles.settingTitle}>Request Account Info</Text>
              </View>
              <ArrowIcon />
            </TouchableOpacity>
            
            <View style={styles.separator} />
            
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => handleActionPress('delete-account')}
              activeOpacity={0.7}
            >
              <View style={styles.settingItemLeft}>
                <View style={styles.iconContainer}>
                  <MaterialIcon name="delete" size={20} color={tokens.colors.error} />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={[styles.settingTitle, { color: tokens.colors.error }]}>Delete My Account</Text>
                  <Text style={styles.settingSubtitle}>This action cannot be undone</Text>
                </View>
              </View>
              <ArrowIcon />
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
    fontSize: 13,
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
    fontSize: 13,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: tokens.colors.surface3,
    marginLeft: 52, // Align with text after icon
  },
  arrowIcon: {
    fontSize: 20,
    color: tokens.colors.onSurface60,
    fontWeight: '300',
  },
});
