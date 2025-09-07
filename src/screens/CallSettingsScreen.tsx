import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { Text } from 'react-native-paper';
import { MotiView } from 'moti';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as Haptics from 'expo-haptics';

import { tokens } from '../theme/tokens';
import { CallsStackParamList } from '../navigation/types';
import { DynamicHeader, MaterialIcon } from '../components';

type CallSettingsNavigationProp = StackNavigationProp<CallsStackParamList, 'CallSettings'>;

interface SettingItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: string;
  type: 'toggle' | 'navigation' | 'action';
  value?: boolean;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
}

export const CallSettingsScreen: React.FC = () => {
  const navigation = useNavigation<CallSettingsNavigationProp>();
  const [scrollOffset, setScrollOffset] = useState(0);
  
  // Settings state
  const [settings, setSettings] = useState({
    silenceUnknownCallers: true,
    showCallHistory: true,
    vibrationOnRing: true,
    callWaiting: true,
    callerIdBlocking: false,
    autoRejectCalls: false,
    recordCalls: false,
    callForwarding: false,
    disappearingMessages: false,
  });

  const updateSetting = (key: string, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const settingsData: SettingItem[] = [
    // Call Management
    {
      id: 'silence_unknown',
      title: 'Silence Unknown Callers',
      subtitle: 'Silence calls from numbers not in your contacts',
      icon: 'phone-off',
      type: 'toggle',
      value: settings.silenceUnknownCallers,
      onToggle: (value) => updateSetting('silenceUnknownCallers', value),
    },
    {
      id: 'show_history',
      title: 'Show Call History',
      subtitle: 'Display recent calls in the calls tab',
      icon: 'history',
      type: 'toggle',
      value: settings.showCallHistory,
      onToggle: (value) => updateSetting('showCallHistory', value),
    },
    {
      id: 'auto_reject',
      title: 'Auto-Reject Calls',
      subtitle: 'Automatically reject calls from blocked numbers',
      icon: 'block',
      type: 'toggle',
      value: settings.autoRejectCalls,
      onToggle: (value) => updateSetting('autoRejectCalls', value),
    },
    
    // Sound & Vibration
    {
      id: 'vibration',
      title: 'Vibration on Ring',
      subtitle: 'Vibrate when receiving calls',
      icon: 'phone',
      type: 'toggle',
      value: settings.vibrationOnRing,
      onToggle: (value) => updateSetting('vibrationOnRing', value),
    },
    {
      id: 'ringtone',
      title: 'Ringtone',
      subtitle: 'Default',
      icon: 'music_note',
      type: 'navigation',
      onPress: () => {
        Alert.alert('Ringtone', 'Choose your ringtone');
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      },
    },
    
    // Advanced Features
    {
      id: 'call_waiting',
      title: 'Call Waiting',
      subtitle: 'Get notified of incoming calls during a call',
      icon: 'call',
      type: 'toggle',
      value: settings.callWaiting,
      onToggle: (value) => updateSetting('callWaiting', value),
    },
    {
      id: 'caller_id',
      title: 'Block Caller ID',
      subtitle: 'Hide your number when making calls',
      icon: 'visibility_off',
      type: 'toggle',
      value: settings.callerIdBlocking,
      onToggle: (value) => updateSetting('callerIdBlocking', value),
    },
    {
      id: 'call_forwarding',
      title: 'Call Forwarding',
      subtitle: 'Forward calls to another number',
      icon: 'forward',
      type: 'toggle',
      value: settings.callForwarding,
      onToggle: (value) => updateSetting('callForwarding', value),
    },
    
    // Privacy & Security
    {
      id: 'record_calls',
      title: 'Call Recording',
      subtitle: 'Enable call recording (where legal)',
      icon: 'mic',
      type: 'toggle',
      value: settings.recordCalls,
      onToggle: (value) => updateSetting('recordCalls', value),
    },
    {
      id: 'disappearing_messages',
      title: 'Disappearing Messages',
      subtitle: 'Auto-delete messages after calls',
      icon: 'auto_delete',
      type: 'toggle',
      value: settings.disappearingMessages,
      onToggle: (value) => updateSetting('disappearingMessages', value),
    },
    {
      id: 'blocked_numbers',
      title: 'Blocked Numbers',
      subtitle: 'Manage blocked contacts',
      icon: 'block',
      type: 'navigation',
      onPress: () => {
        Alert.alert('Blocked Numbers', 'Manage your blocked contacts');
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      },
    },
    
    // Data & Storage
    {
      id: 'call_quality',
      title: 'Call Quality',
      subtitle: 'Optimize for connection or quality',
      icon: 'settings',
      type: 'navigation',
      onPress: () => {
        Alert.alert('Call Quality', 'Choose call quality preferences');
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      },
    },
    {
      id: 'data_usage',
      title: 'Data Usage',
      subtitle: 'View call data usage statistics',
      icon: 'chart-line',
      type: 'navigation',
      onPress: () => {
        Alert.alert('Data Usage', 'View your call data usage');
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      },
    },
  ];

  const getIconBackgroundColor = (iconName: string): string => {
    // Call-specific styling with vibrant circular backgrounds and call-themed colors
    const iconBackgrounds: { [key: string]: string } = {
      'phone-off': '#FF3B30',          // Strong iOS Red (for silence unknown)
      'history': '#007AFF',            // Strong iOS Blue  
      'block': '#FF3B30',              // Strong iOS Red
      'phone': '#FF9500',              // Strong iOS Orange (for vibration)
      'music_note': '#34C759',         // Strong iOS Green
      'call': '#30D158',               // Strong iOS Green variant (for call waiting)
      'visibility_off': '#8E8E93',     // iOS Gray
      'forward': '#007AFF',            // Strong iOS Blue (for call forwarding)
      'mic': '#FF3B30',                // Strong iOS Red
      'auto_delete': '#5856D6',        // Strong iOS Purple (for disappearing messages)
      'settings': '#5856D6',           // Strong iOS Purple (for call quality)
      'chart-line': '#34C759',         // Strong iOS Green (for data usage)
    };
    return iconBackgrounds[iconName] || 'rgba(255, 255, 255, 0.3)';
  };

  const renderSettingItem = (item: SettingItem, index: number) => (
    <MotiView
      key={item.id}
      from={{ opacity: 0, translateX: -20 }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{ type: 'timing', duration: 300, delay: index * 50 }}
    >
      <TouchableOpacity
        style={styles.settingRow}
        onPress={item.onPress}
        activeOpacity={item.type === 'toggle' ? 1 : 0.7}
        disabled={item.type === 'toggle'}
      >
        <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor(item.icon) }]}>
          <MaterialIcon name={item.icon} size={20} color="#FFFFFF" />
        </View>
        
        <View style={styles.settingContent}>
          <Text style={styles.settingTitle}>{item.title}</Text>
          {item.subtitle && (
            <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
          )}
        </View>
        
        <View style={styles.settingAction}>
          {item.type === 'toggle' && (
            <Switch
              value={item.value}
              onValueChange={item.onToggle}
              trackColor={{ false: 'rgba(255, 255, 255, 0.1)', true: tokens.colors.primary }}
              thumbColor={item.value ? '#FFFFFF' : '#FFFFFF'}
              ios_backgroundColor="rgba(255, 255, 255, 0.1)"
            />
          )}
          {item.type === 'navigation' && (
            <MaterialIcon name="chevron_right" size={20} color={tokens.colors.onSurface38} />
          )}
        </View>
      </TouchableOpacity>
      {index < settingsData.length - 1 && <View style={styles.separator} />}
    </MotiView>
  );

  const settingSections = [
    {
      title: 'Call Management',
      items: settingsData.slice(0, 3),
    },
    {
      title: 'Sound & Notifications',
      items: settingsData.slice(3, 5),
    },
    {
      title: 'Advanced Features',
      items: settingsData.slice(5, 8),
    },
    {
      title: 'Privacy & Security',
      items: settingsData.slice(8, 11),
    },
    {
      title: 'Data & Quality',
      items: settingsData.slice(11, 13),
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <DynamicHeader
        title="Call Settings"
        scrollY={scrollOffset}
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
        titleSize={18}
        rightIcons={[
          {
            icon: 'restore',
            onPress: () => {
              Alert.alert(
                'Reset Settings',
                'Reset all call settings to default values?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Reset',
                    style: 'destructive',
                    onPress: () => {
                      setSettings({
                        silenceUnknownCallers: true,
                        showCallHistory: true,
                        vibrationOnRing: true,
                        callWaiting: true,
                        callerIdBlocking: false,
                        autoRejectCalls: false,
                        recordCalls: false,
                        callForwarding: false,
                        disappearingMessages: false,
                      });
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                    }
                  },
                ]
              );
            }
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
        {settingSections.map((section, sectionIndex) => (
          <MotiView
            key={section.title}
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 300, delay: sectionIndex * 100 }}
            style={styles.section}
          >
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionContent}>
              {section.items.map((item, index) => renderSettingItem(item, index))}
            </View>
          </MotiView>
        ))}
        
        {/* Additional Info */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', duration: 300, delay: 600 }}
          style={styles.footer}
        >
          <Text style={styles.footerText}>
            Some settings may require carrier support and may affect your bill.
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
  section: {
    marginBottom: tokens.spacing.l,
  },
  sectionTitle: {
    ...tokens.typography.h3,
    color: tokens.colors.onSurface,
    marginBottom: tokens.spacing.s,
    fontWeight: '600',
  },
  sectionContent: {
    backgroundColor: tokens.colors.surface1,
    borderRadius: tokens.radius.m,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: tokens.spacing.m,
    paddingHorizontal: tokens.spacing.m,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18, // Perfect circle
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: tokens.spacing.m,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    ...tokens.typography.body,
    color: tokens.colors.onSurface,
    fontWeight: '500',
  },
  settingSubtitle: {
    ...tokens.typography.caption,
    color: tokens.colors.onSurface60,
    marginTop: 2,
  },
  settingAction: {
    marginLeft: tokens.spacing.s,
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginLeft: 48, // Align with content
  },
  footer: {
    marginTop: tokens.spacing.l,
    paddingHorizontal: tokens.spacing.s,
  },
  footerText: {
    ...tokens.typography.caption,
    color: tokens.colors.onSurface38,
    textAlign: 'center',
    lineHeight: 16,
  },
});
