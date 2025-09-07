import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as Haptics from 'expo-haptics';

import { tokens } from '../theme/tokens';
import { SettingsStackParamList } from '../navigation/types';
import { DynamicHeader, MaterialIcon } from '../components';

type NotificationSettingsNavigationProp = StackNavigationProp<SettingsStackParamList, 'NotificationSettings'>;

export const NotificationSettingsScreen: React.FC = () => {
  const navigation = useNavigation<NotificationSettingsNavigationProp>();
  const [scrollOffset, setScrollOffset] = useState(0);

  // Notification settings state
  const [showNotifications, setShowNotifications] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [showPreviews, setShowPreviews] = useState(true);
  const [messageNotifications, setMessageNotifications] = useState(true);
  const [groupNotifications, setGroupNotifications] = useState(true);
  const [callNotifications, setCallNotifications] = useState(true);
  const [reactionNotifications, setReactionNotifications] = useState(true);
  const [mentionNotifications, setMentionNotifications] = useState(true);
  const [quietHours, setQuietHours] = useState(false);
  const [weekendQuiet, setWeekendQuiet] = useState(false);

  // Function to get icon background color based on icon type
  const getIconColor = (iconName: string): string => {
    const colorMap: { [key: string]: string } = {
      // Notification States
      'notifications_active': '#FF9500', // Orange
      'volume_up': '#34C759', // Green
      'vibration': '#FF2D92', // Pink
      'lightbulb': '#FFCC00', // Yellow
      
      // Message Types
      'message': '#34C759', // Green
      'group': '#FF9500', // Orange
      'phone': '#007AFF', // Blue
      'favorite': '#FF453A', // Red
      'alternate_email': '#5856D6', // Purple
      
      // Settings
      'schedule': '#8E8E93', // Gray
      'notifications': '#FF9500', // Orange
      'weekend': '#00C7BE', // Teal
    };
    
    return colorMap[iconName] || tokens.colors.primary;
  };

  const getIconBackgroundColor = (iconName: string): string => {
    // iOS Settings-style solid background colors
    const backgroundColorMap: { [key: string]: string } = {
      // Notification States
      'notifications_active': '#FF9500', // Orange
      'volume_up': '#34C759', // Green
      'vibration': '#FF2D92', // Pink
      'lightbulb': '#FFCC00', // Yellow
      
      // Message Types
      'message': '#34C759', // Green
      'group': '#FF9500', // Orange
      'phone': '#007AFF', // Blue
      'favorite': '#FF453A', // Red
      'alternate_email': '#5856D6', // Purple
      
      // Customization
      'music_note': '#34C759', // Green
      'ring_volume': '#007AFF', // Blue
      
      // Settings
      'schedule': '#8E8E93', // Gray
      'notifications': '#FF9500', // Orange
      'weekend': '#00C7BE', // Teal
      
      // Advanced
      'history': '#5856D6', // Purple
      'security': '#FF453A', // Red
      'restore': '#FF9500', // Orange
      'chevron_right': '#8E8E93', // Gray
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
        title="Notifications"
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
        {/* General Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>General</Text>
          <View style={styles.cardGroup}>
            <View style={styles.settingItem}>
              <View style={styles.settingItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor('notifications_active') }]}>
                  <MaterialIcon name="notifications_active" size={18} color="#FFFFFF" />
                </View>
                <Text style={styles.settingTitle}>Show Notifications</Text>
              </View>
              <Switch
                value={showNotifications}
                onValueChange={handleSwitchChange(setShowNotifications, showNotifications)}
                trackColor={{ false: tokens.colors.surface3, true: tokens.colors.primary }}
                thumbColor={tokens.colors.onSurface}
              />
            </View>
            
            <View style={styles.separator} />
            
            <View style={styles.settingItem}>
              <View style={styles.settingItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor('volume_up') }]}>
                  <MaterialIcon name="volume_up" size={18} color="#FFFFFF" />
                </View>
                <Text style={styles.settingTitle}>Sound</Text>
              </View>
              <Switch
                value={soundEnabled}
                onValueChange={handleSwitchChange(setSoundEnabled, soundEnabled)}
                trackColor={{ false: tokens.colors.surface3, true: tokens.colors.primary }}
                thumbColor={tokens.colors.onSurface}
              />
            </View>
            
            <View style={styles.separator} />
            
                        <View style={styles.settingItem}>
              <View style={styles.settingItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor('vibration') }]}>
                  <MaterialIcon name="vibration" size={18} color="#FFFFFF" />
                </View>
                <Text style={styles.settingTitle}>Vibration</Text>
              </View>
              <Switch
                value={vibrationEnabled}
                onValueChange={handleSwitchChange(setVibrationEnabled, vibrationEnabled)}
                trackColor={{ false: tokens.colors.surface3, true: tokens.colors.primary }}
                thumbColor={tokens.colors.onSurface}
              />
            </View>
            
            <View style={styles.separator} />
            
            <View style={styles.settingItem}>
              <View style={styles.settingItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor('lightbulb') }]}>
                  <MaterialIcon name="preview" size={18} color="#FFFFFF" />
                </View>
                <Text style={styles.settingTitle}>Show Previews</Text>
              </View>
              <Switch
                value={showPreviews}
                onValueChange={handleSwitchChange(setShowPreviews, showPreviews)}
                trackColor={{ false: tokens.colors.surface3, true: tokens.colors.primary }}
                thumbColor={tokens.colors.onSurface}
              />
            </View>
          </View>
        </View>

        {/* Group Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Groups</Text>
          <View style={styles.cardGroup}>
            <View style={styles.settingItem}>
              <View style={styles.settingItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor('message') }]}>
                  <MaterialIcon name="message" size={20} color="#FFFFFF" />
                </View>
                <Text style={styles.settingTitle}>Group Notifications</Text>
              </View>
              <Switch
                value={groupNotifications}
                onValueChange={handleSwitchChange(setGroupNotifications, groupNotifications)}
                trackColor={{ false: tokens.colors.surface3, true: tokens.colors.primary }}
                thumbColor={tokens.colors.onSurface}
              />
            </View>
          </View>
        </View>

        {/* Message Types */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Message Types</Text>
          <View style={styles.cardGroup}>
            <View style={styles.settingItem}>
              <View style={styles.settingItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor('message') }]}>
                  <MaterialIcon name="message" size={20} color="#FFFFFF" />
                </View>
                <Text style={styles.settingTitle}>Messages</Text>
              </View>
              <Switch
                value={messageNotifications}
                onValueChange={handleSwitchChange(setMessageNotifications, messageNotifications)}
                trackColor={{ false: tokens.colors.surface3, true: tokens.colors.primary }}
                thumbColor={tokens.colors.onSurface}
              />
            </View>
            
            <View style={styles.separator} />
            
            <View style={styles.settingItem}>
              <View style={styles.settingItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor('group') }]}>
                  <MaterialIcon name="group" size={20} color="#FFFFFF" />
                </View>
                <Text style={styles.settingTitle}>Group Messages</Text>
              </View>
              <Switch
                value={groupNotifications}
                onValueChange={handleSwitchChange(setGroupNotifications, groupNotifications)}
                trackColor={{ false: tokens.colors.surface3, true: tokens.colors.primary }}
                thumbColor={tokens.colors.onSurface}
              />
            </View>
            
            <View style={styles.separator} />
            
            <View style={styles.settingItem}>
              <View style={styles.settingItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor('phone') }]}>
                  <MaterialIcon name="phone" size={20} color="#FFFFFF" />
                </View>
                <Text style={styles.settingTitle}>Calls</Text>
              </View>
              <Switch
                value={callNotifications}
                onValueChange={handleSwitchChange(setCallNotifications, callNotifications)}
                trackColor={{ false: tokens.colors.surface3, true: tokens.colors.primary }}
                thumbColor={tokens.colors.onSurface}
              />
            </View>
            
            <View style={styles.separator} />
            
            <View style={styles.settingItem}>
              <View style={styles.settingItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor('favorite') }]}>
                  <MaterialIcon name="favorite" size={20} color="#FFFFFF" />
                </View>
                <Text style={styles.settingTitle}>Reactions</Text>
              </View>
              <Switch
                value={reactionNotifications}
                onValueChange={handleSwitchChange(setReactionNotifications, reactionNotifications)}
                trackColor={{ false: tokens.colors.surface3, true: tokens.colors.primary }}
                thumbColor={tokens.colors.onSurface}
              />
            </View>
            
            <View style={styles.separator} />
            
            <View style={styles.settingItem}>
              <View style={styles.settingItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor('alternate_email') }]}>
                  <MaterialIcon name="alternate_email" size={20} color="#FFFFFF" />
                </View>
                <Text style={styles.settingTitle}>Mentions</Text>
              </View>
              <Switch
                value={mentionNotifications}
                onValueChange={handleSwitchChange(setMentionNotifications, mentionNotifications)}
                trackColor={{ false: tokens.colors.surface3, true: tokens.colors.primary }}
                thumbColor={tokens.colors.onSurface}
              />
            </View>
          </View>
        </View>

        {/* Customization */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customization</Text>
          <View style={styles.cardGroup}>
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => handleActionPress('notification-sound')}
              activeOpacity={0.7}
            >
              <View style={styles.settingItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor('music_note') }]}>
                  <MaterialIcon name="music_note" size={20} color="#FFFFFF" />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Notification Sound</Text>
                  <Text style={styles.settingSubtitle}>Default</Text>
                </View>
              </View>
              <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor('chevron_right') }]}>
                <MaterialIcon name="chevron_right" size={20} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
            
            <View style={styles.separator} />
            
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => handleActionPress('ringtone')}
              activeOpacity={0.7}
            >
              <View style={styles.settingItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor('ring_volume') }]}>
                  <MaterialIcon name="ring_volume" size={20} color="#FFFFFF" />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Ringtone</Text>
                  <Text style={styles.settingSubtitle}>Default</Text>
                </View>
              </View>
              <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor('chevron_right') }]}>
                <MaterialIcon name="chevron_right" size={20} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
            
            <View style={styles.separator} />
            
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => handleActionPress('led-color')}
              activeOpacity={0.7}
            >
              <View style={styles.settingItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor('lightbulb') }]}>
                  <MaterialIcon name="lightbulb" size={20} color="#FFFFFF" />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>LED Color</Text>
                  <Text style={styles.settingSubtitle}>Blue</Text>
                </View>
              </View>
              <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor('chevron_right') }]}>
                <MaterialIcon name="chevron_right" size={20} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Do Not Disturb */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Do Not Disturb</Text>
          <View style={styles.cardGroup}>
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => handleActionPress('quiet-hours')}
              activeOpacity={0.7}
            >
              <View style={styles.settingItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor('schedule') }]}>
                  <MaterialIcon name="schedule" size={20} color="#FFFFFF" />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Quiet Hours</Text>
                  <Text style={styles.settingSubtitle}>10:00 PM - 7:00 AM</Text>
                </View>
              </View>
              <Switch
                value={quietHours}
                onValueChange={handleSwitchChange(setQuietHours, quietHours)}
                trackColor={{ false: tokens.colors.surface3, true: tokens.colors.primary }}
                thumbColor={tokens.colors.onSurface}
              />
            </TouchableOpacity>
            
            <View style={styles.separator} />
            
            <View style={styles.settingItem}>
              <View style={styles.settingItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor('weekend') }]}>
                  <MaterialIcon name="weekend" size={20} color="#FFFFFF" />
                </View>
                <Text style={styles.settingTitle}>Weekend Quiet Mode</Text>
              </View>
              <Switch
                value={weekendQuiet}
                onValueChange={handleSwitchChange(setWeekendQuiet, weekendQuiet)}
                trackColor={{ false: tokens.colors.surface3, true: tokens.colors.primary }}
                thumbColor={tokens.colors.onSurface}
              />
            </View>
          </View>
        </View>

        {/* Advanced */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Advanced</Text>
          <View style={styles.cardGroup}>
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => handleActionPress('notification-history')}
              activeOpacity={0.7}
            >
              <View style={styles.settingItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor('history') }]}>
                  <MaterialIcon name="history" size={20} color="#FFFFFF" />
                </View>
                <Text style={styles.settingTitle}>Notification History</Text>
              </View>
              <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor('chevron_right') }]}>
                <MaterialIcon name="chevron_right" size={20} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
            
            <View style={styles.separator} />
            
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => handleActionPress('app-permissions')}
              activeOpacity={0.7}
            >
              <View style={styles.settingItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor('security') }]}>
                  <MaterialIcon name="security" size={20} color="#FFFFFF" />
                </View>
                <Text style={styles.settingTitle}>App Permissions</Text>
              </View>
              <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor('chevron_right') }]}>
                <MaterialIcon name="chevron_right" size={20} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
            
            <View style={styles.separator} />
            
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => handleActionPress('reset-notifications')}
              activeOpacity={0.7}
            >
              <View style={styles.settingItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor('restore') }]}>
                  <MaterialIcon name="restore" size={20} color="#FFFFFF" />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Reset to Defaults</Text>
                  <Text style={styles.settingSubtitle}>Restore original settings</Text>
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
