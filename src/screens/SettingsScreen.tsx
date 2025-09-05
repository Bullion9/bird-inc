import React, { useRef, useCallback } from 'react';
import { View, StyleSheet, ScrollView, NativeScrollEvent, NativeSyntheticEvent, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';

import { tokens } from '../theme/tokens';
import { SettingsStackParamList } from '../navigation/types';
import { MaterialIcon, DynamicHeader } from '../components';

type SettingsNavigationProp = StackNavigationProp<SettingsStackParamList, 'Settings'>;

interface SettingsItem {
  id: string;
  title: string;
  icon: string;
  onPress: () => void;
}

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<SettingsNavigationProp>();
  const scrollY = useRef(0);
  const [scrollPosition, setScrollPosition] = React.useState(0);

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    scrollY.current = currentScrollY;
    setScrollPosition(currentScrollY);
  }, []);

  const handleNavigation = (screen: 'EditProfile' | 'StorageAndData' | 'ChatsSettings' | 'NotificationSettings' | 'PrivacySettings' | 'HelpSettings') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate(screen);
  };

  const settingsGroups = [
    {
      id: 'account',
      items: [
        {
          id: 'account',
          title: 'Account',
          icon: 'account_circle',
          onPress: () => handleNavigation('EditProfile'),
        },
      ]
    },
    {
      id: 'preferences',
      items: [
        {
          id: 'chats',
          title: 'Chats',
          icon: 'chat_bubble',
          onPress: () => handleNavigation('ChatsSettings'),
        },
        {
          id: 'notifications',
          title: 'Notifications',
          icon: 'notifications',
          onPress: () => handleNavigation('NotificationSettings'),
        },
        {
          id: 'storage',
          title: 'Storage & Data',
          icon: 'storage',
          onPress: () => handleNavigation('StorageAndData'),
        },
      ]
    },
    {
      id: 'security',
      items: [
        {
          id: 'privacy',
          title: 'Privacy',
          icon: 'lock',
          onPress: () => handleNavigation('PrivacySettings'),
        },
      ]
    },
    {
      id: 'support',
      items: [
        {
          id: 'help',
          title: 'Help',
          icon: 'help',
          onPress: () => handleNavigation('HelpSettings'),
        },
      ]
    }
  ];

  return (
    <View style={styles.container}>
      <DynamicHeader 
        title="Settings"
        showBackButton={false}
        scrollY={scrollPosition}
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Large title at the top */}
        <MotiView
          animate={{
            opacity: scrollPosition < 40 ? 1 : Math.max(0, (60 - scrollPosition) / 20),
            translateY: scrollPosition < 40 ? 0 : Math.min(scrollPosition * 0.3, 20),
          }}
          transition={{
            type: 'timing',
            duration: 200,
          }}
        >
          <Text style={styles.largeTitle}>Settings</Text>
        </MotiView>
        
        {settingsGroups.map((group) => (
          <View key={group.id} style={styles.settingsGroup}>
            <View style={styles.iosCard}>
              {group.items.map((item, index) => (
                <React.Fragment key={item.id}>
                  <TouchableOpacity
                    style={styles.iosCardItem}
                    onPress={item.onPress}
                    activeOpacity={0.7}
                  >
                    <View style={styles.iconContainer}>
                      <MaterialIcon 
                        name={item.icon} 
                        size={24} 
                        color={tokens.colors.primary} 
                      />
                    </View>
                    <Text style={styles.iosCardText}>{item.title}</Text>
                    <MaterialIcon 
                      name="chevron_right" 
                      size={20} 
                      color={tokens.colors.onSurface60} 
                    />
                  </TouchableOpacity>
                  {index < group.items.length - 1 && <View style={styles.iosCardSeparator} />}
                </React.Fragment>
              ))}
            </View>
          </View>
        ))}
        
        {/* App Info Section - iOS Style */}
        <View style={styles.settingsGroup}>
          <View style={styles.iosCard}>
            <View style={styles.iosCardItem}>
              <View style={styles.iconContainer}>
                <MaterialIcon 
                  name="tag" 
                  size={24} 
                  color={tokens.colors.primary} 
                />
              </View>
              <View style={{ flex: 1, marginLeft: tokens.spacing.m }}>
                <Text style={[styles.iosCardText, { marginLeft: 0, marginBottom: 2 }]}>Version</Text>
                <Text style={[styles.iosCardText, { marginLeft: 0, color: tokens.colors.onSurface60, fontSize: 12, fontWeight: '400' }]}>
                  Bird Chat v1.0.0
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.appCopyrightContainer}>
            <Text style={styles.appCopyright}>© 2025 Bird Inc.</Text>
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
    paddingTop: 120, // Space for the large title under the header
  },
  largeTitle: {
    ...tokens.typography.h1,
    fontSize: 12,
    fontWeight: '400', // Changed from '700' to '400' (unbold)
    color: tokens.colors.onSurface,
    marginBottom: tokens.spacing.l,
    marginTop: 10, // Changed from -20 to 10 (bring text down)
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
  // iOS-style settings cards
  settingsGroup: {
    marginBottom: tokens.spacing.m,
  },
  iosCard: {
    backgroundColor: tokens.colors.surface1,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  iosCardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    minHeight: 48,
  },
  iosCardText: {
    ...tokens.typography.body,
    color: tokens.colors.onSurface,
    marginLeft: tokens.spacing.m,
    flex: 1,
    fontWeight: '500',
  },
  iosCardSeparator: {
    height: 0.5,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginLeft: 56, // Align with text
  },
  appCopyrightContainer: {
    alignItems: 'center',
    paddingVertical: tokens.spacing.m,
    marginTop: tokens.spacing.s,
  },
});
