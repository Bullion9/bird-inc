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
import { SettingsStackParamList } from '../navigation/types';
import { DynamicHeader, MaterialIcon } from '../components';

type AccountNavigationProp = StackNavigationProp<SettingsStackParamList, 'Account'>;

interface AccountItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: string;
  type: 'navigation' | 'toggle' | 'info' | 'danger';
  value?: boolean;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
  showBadge?: boolean;
  badgeColor?: string;
}

export const AccountScreen: React.FC = () => {
  const navigation = useNavigation<AccountNavigationProp>();
  const [scrollOffset, setScrollOffset] = useState(0);
  
  // Account security state
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false,
    passkeyEnabled: true,
    loginAlerts: true,
    deviceManagement: true,
  });

  const updateSecuritySetting = (key: string, value: boolean) => {
    setSecuritySettings(prev => ({ ...prev, [key]: value }));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleDeleteAccount = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data, messages, and contacts will be permanently deleted. Are you sure you want to continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Final Confirmation',
              'Type "DELETE" to confirm account deletion',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Confirm Delete',
                  style: 'destructive',
                  onPress: () => {
                    // Handle account deletion
                    console.log('Account deletion confirmed');
                  }
                }
              ]
            );
          }
        }
      ]
    );
  };

  const handleExportData = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      'Export Account Data',
      'We will prepare a download of your account data including messages, contacts, and settings. This may take a few minutes.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start Export',
          onPress: () => {
            console.log('Starting data export...');
            Alert.alert('Export Started', 'You will receive a notification when your data is ready for download.');
          }
        }
      ]
    );
  };

  const accountSections = [
    {
      title: 'Security & Authentication',
      items: [
        {
          id: 'two_factor',
          title: 'Two-Factor Authentication',
          subtitle: securitySettings.twoFactorEnabled ? 'Enabled via SMS' : 'Add an extra layer of security',
          icon: 'shield-check',
          type: 'toggle',
          value: securitySettings.twoFactorEnabled,
          onToggle: (value: boolean) => {
            if (value) {
              Alert.alert(
                'Enable 2FA',
                'We will send a verification code to your phone number to set up two-factor authentication.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Continue',
                    onPress: () => {
                      updateSecuritySetting('twoFactorEnabled', value);
                      Alert.alert('2FA Enabled', 'Two-factor authentication has been enabled for your account.');
                    }
                  }
                ]
              );
            } else {
              updateSecuritySetting('twoFactorEnabled', value);
            }
          },
          showBadge: !securitySettings.twoFactorEnabled,
          badgeColor: '#FF9500',
        } as AccountItem,
        {
          id: 'passkey',
          title: 'Passkey',
          subtitle: securitySettings.passkeyEnabled ? 'Face ID / Touch ID enabled' : 'Use biometrics to sign in',
          icon: 'fingerprint',
          type: 'toggle',
          value: securitySettings.passkeyEnabled,
          onToggle: (value: boolean) => updateSecuritySetting('passkeyEnabled', value),
        } as AccountItem,
        {
          id: 'login_alerts',
          title: 'Login Alerts',
          subtitle: 'Get notified of new device sign-ins',
          icon: 'security',
          type: 'toggle',
          value: securitySettings.loginAlerts,
          onToggle: (value: boolean) => updateSecuritySetting('loginAlerts', value),
        } as AccountItem,
      ]
    },
    {
      title: 'Contact Information',
      items: [
        {
          id: 'email',
          title: 'Email Address',
          subtitle: 'john.doe@example.com',
          icon: 'email',
          type: 'navigation',
          onPress: () => {
            Alert.alert(
              'Update Email',
              'Enter your new email address:',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Update', onPress: () => console.log('Update email') }
              ]
            );
          },
        } as AccountItem,
        {
          id: 'phone',
          title: 'Phone Number',
          subtitle: '+1 234 567 8900',
          icon: 'phone',
          type: 'navigation',
          onPress: () => navigation.navigate('PhoneNumberView', { phoneNumber: '+1 234 567 8900' }),
        } as AccountItem,
      ]
    },
    {
      title: 'Account Management',
      items: [
        {
          id: 'devices',
          title: 'Active Devices',
          subtitle: '3 devices • Manage sign-ins',
          icon: 'devices',
          type: 'navigation',
          onPress: () => {
            Alert.alert('Active Devices', 'iPhone 15 Pro (this device)\niPad Air (last active: 2 hours ago)\nMacBook Pro (last active: yesterday)');
          },
        } as AccountItem,
        {
          id: 'sessions',
          title: 'Active Sessions',
          subtitle: 'View and manage your sessions',
          icon: 'history',
          type: 'navigation',
          onPress: () => {
            Alert.alert('Active Sessions', 'Current session: iPhone\nWeb session: Chrome on MacBook\nExpires in 30 days');
          },
        } as AccountItem,
        {
          id: 'export_data',
          title: 'Request Account Info',
          subtitle: 'Download a copy of your data',
          icon: 'download',
          type: 'navigation',
          onPress: handleExportData,
        } as AccountItem,
      ]
    },
    {
      title: 'Danger Zone',
      items: [
        {
          id: 'delete_account',
          title: 'Delete Account',
          subtitle: 'Permanently delete your account and all data',
          icon: 'delete',
          type: 'danger',
          onPress: handleDeleteAccount,
        } as AccountItem,
      ]
    },
  ];

  const getIconBackgroundColor = (type: string): string => {
    switch (type) {
      case 'danger':
        return '#FF3B30';
      case 'toggle':
        return tokens.colors.primary;
      case 'navigation':
        return '#34C759';
      case 'info':
        return '#8E8E93';
      default:
        return tokens.colors.primary;
    }
  };

  const renderAccountItem = (item: AccountItem, index: number) => (
    <MotiView
      key={item.id}
      from={{ opacity: 0, translateX: -20 }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{ type: 'timing', duration: 300, delay: index * 50 }}
    >
      <TouchableOpacity
        style={styles.accountRow}
        onPress={item.onPress}
        activeOpacity={item.type === 'toggle' ? 1 : 0.7}
        disabled={item.type === 'toggle'}
      >
        <View style={styles.accountItemLeft}>
          <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor(item.type) }]}>
            <MaterialIcon name={item.icon} size={20} color="#FFFFFF" />
          </View>
          
          <View style={styles.accountContent}>
            <View style={styles.titleRow}>
              <Text style={[styles.accountTitle, item.type === 'danger' && styles.dangerText]}>
                {item.title}
              </Text>
              {item.showBadge && (
                <View style={[styles.badge, { backgroundColor: item.badgeColor }]}>
                  <Text style={styles.badgeText}>!</Text>
                </View>
              )}
            </View>
            {item.subtitle && (
              <Text style={styles.accountSubtitle}>{item.subtitle}</Text>
            )}
          </View>
        </View>
        
        <View style={styles.accountAction}>
          {item.type === 'toggle' && (
            <Switch
              value={item.value}
              onValueChange={item.onToggle}
              trackColor={{ false: 'rgba(255, 255, 255, 0.1)', true: tokens.colors.primary }}
              thumbColor={item.value ? '#FFFFFF' : '#FFFFFF'}
              ios_backgroundColor="rgba(255, 255, 255, 0.1)"
            />
          )}
          {(item.type === 'navigation' || item.type === 'danger') && (
            <MaterialIcon name="chevron_right" size={20} color={tokens.colors.onSurface38} />
          )}
        </View>
      </TouchableOpacity>
      {index < accountSections.flatMap(s => s.items).length - 1 && <View style={styles.separator} />}
    </MotiView>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <DynamicHeader
        title="Account"
        scrollY={scrollOffset}
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
        titleSize={18}
        rightIcons={[
          {
            icon: 'security',
            onPress: () => {
              Alert.alert(
                'Account Security',
                'Your account security score: 85%\n\n✅ Passkey enabled\n⚠️ 2FA recommended\n✅ Strong password\n✅ Login alerts active'
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
        {accountSections.map((section, sectionIndex) => (
          <MotiView
            key={section.title}
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 300, delay: sectionIndex * 100 }}
            style={styles.section}
          >
            <Text style={[styles.sectionTitle, section.title === 'Danger Zone' && styles.dangerSectionTitle]}>
              {section.title}
            </Text>
            <View style={[styles.sectionContent, section.title === 'Danger Zone' && styles.dangerSection]}>
              {section.items.map((item, index) => renderAccountItem(item, index))}
            </View>
          </MotiView>
        ))}
        
        {/* Account Info Footer */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', duration: 300, delay: 600 }}
          style={styles.footer}
        >
          <Text style={styles.footerText}>
            Account created: January 15, 2024{'\n'}
            Last login: Today at 9:30 AM{'\n'}
            Account ID: USR_12345
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
  dangerSectionTitle: {
    color: '#FF3B30',
  },
  sectionContent: {
    backgroundColor: tokens.colors.surface1,
    borderRadius: tokens.radius.m,
    overflow: 'hidden',
  },
  dangerSection: {
    borderColor: '#FF3B30',
    borderWidth: 1,
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: tokens.spacing.m,
    paddingHorizontal: tokens.spacing.m,
  },
  accountItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: tokens.spacing.m,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  accountContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accountTitle: {
    ...tokens.typography.body,
    color: tokens.colors.onSurface,
    fontWeight: '500',
  },
  dangerText: {
    color: '#FF3B30',
  },
  badge: {
    marginLeft: tokens.spacing.xs,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  accountSubtitle: {
    ...tokens.typography.caption,
    color: tokens.colors.onSurface60,
    marginTop: 2,
  },
  accountAction: {
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
