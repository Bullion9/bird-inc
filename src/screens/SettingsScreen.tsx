import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as Haptics from 'expo-haptics';

import { tokens } from '../theme/tokens';
import { SettingsStackParamList } from '../navigation/types';
import { BirdCard, MaterialIcon, DynamicHeader } from '../components';

type SettingsNavigationProp = StackNavigationProp<SettingsStackParamList, 'Settings'>;

interface SettingsItem {
  id: string;
  title: string;
  icon: string;
  onPress: () => void;
}

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<SettingsNavigationProp>();

  const handleNavigation = (screen: 'EditProfile' | 'StorageAndData') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate(screen);
  };

  const settingsItems: SettingsItem[] = [
    {
      id: 'account',
      title: 'Account',
      icon: 'account_circle',
      onPress: () => handleNavigation('EditProfile'),
    },
    {
      id: 'chats',
      title: 'Chats',
      icon: 'chat_bubble',
      onPress: () => {
        // Navigate to chat settings - placeholder for now
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      },
    },
    {
      id: 'privacy',
      title: 'Privacy',
      icon: 'lock',
      onPress: () => {
        // Navigate to privacy settings - placeholder for now
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      },
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: 'notifications',
      onPress: () => {
        // Navigate to notifications settings - placeholder for now
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      },
    },
    {
      id: 'storage',
      title: 'Storage & Data',
      icon: 'storage',
      onPress: () => handleNavigation('StorageAndData'),
    },
    {
      id: 'help',
      title: 'Help',
      icon: 'help',
      onPress: () => {
        // Navigate to help - placeholder for now
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      },
    },
  ];

  return (
    <View style={styles.container}>
      <DynamicHeader 
        title="Settings"
        showBackButton={false}
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {settingsItems.map((item) => (
          <BirdCard
            key={item.id}
            onPress={item.onPress}
            rightContent={
              <MaterialIcon 
                name="chevron_right" 
                size={24} 
                color={tokens.colors.onSurface60} 
              />
            }
            style={styles.settingsCard}
          >
            <View style={styles.settingsRow}>
              <View style={styles.iconContainer}>
                <MaterialIcon 
                  name={item.icon} 
                  size={24} 
                  color={tokens.colors.primary} 
                />
              </View>
              <Text style={styles.settingsTitle}>{item.title}</Text>
            </View>
          </BirdCard>
        ))}
        
        {/* App Info Section */}
        <View style={styles.appInfoSection}>
          <Text style={styles.appVersion}>Bird Chat v1.0.0</Text>
          <Text style={styles.appCopyright}>© 2025 Bird Inc.</Text>
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
  },
  settingsCard: {
    marginVertical: tokens.spacing.xs,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    marginRight: tokens.spacing.m,
    width: 24,
    alignItems: 'center',
  },
  settingsTitle: {
    ...tokens.typography.body,
    color: tokens.colors.onSurface,
    fontWeight: '500',
    flex: 1,
  },
  appInfoSection: {
    marginTop: tokens.spacing.xl,
    alignItems: 'center',
    paddingVertical: tokens.spacing.l,
  },
  appVersion: {
    ...tokens.typography.caption,
    color: tokens.colors.onSurface60,
    marginBottom: tokens.spacing.xs,
  },
  appCopyright: {
    ...tokens.typography.caption,
    color: tokens.colors.onSurface38,
    fontSize: 12,
  },
});
