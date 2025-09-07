import React, { useRef, useCallback, useState } from 'react';
import { View, StyleSheet, ScrollView, NativeScrollEvent, NativeSyntheticEvent, TouchableOpacity, TextInput } from 'react-native';
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
  const [searchQuery, setSearchQuery] = useState('');

  // Function to get icon background color based on icon type
  const getIconColor = (iconName: string): string => {
    // iOS Settings-style vibrant colors
    const colorMap: Record<string, string> = {
      // Core settings - vibrant iOS colors
      'account_circle': '#007AFF', // Blue
      'chat_bubble': '#34C759',    // Green
      'notifications': '#FF9500',  // Orange
      'storage': '#8E8E93',        // Gray
      'folder': '#FFCC00',         // Yellow
      'note': '#30D158',           // Green
      'person_add': '#FF2D92',     // Pink
      'emoji_emotions': '#FFCC00', // Yellow
      'lock': '#FF453A',           // Red
      'laptop': '#5856D6',         // Purple
      'help': '#00C7BE',           // Teal
      'headset': '#007AFF',        // Blue
      'tag': '#007AFF',            // Blue
    };
    
    return colorMap[iconName] || '#007AFF';
  };

  const getIconBackgroundColor = (iconName: string): string => {
    // iOS Settings-style background colors (slightly muted versions)
    const backgroundColorMap: Record<string, string> = {
      // Core settings - iOS-style gradients and backgrounds
      'account_circle': '#007AFF', // Blue background
      'chat_bubble': '#34C759',    // Green background
      'notifications': '#FF9500',  // Orange background
      'storage': '#8E8E93',        // Gray background
      'folder': '#FFCC00',         // Yellow background
      'note': '#30D158',           // Green background
      'person_add': '#FF2D92',     // Pink background
      'emoji_emotions': '#FFCC00', // Yellow background
      'lock': '#FF453A',           // Red background
      'laptop': '#5856D6',         // Purple background
      'help': '#00C7BE',           // Teal background
      'headset': '#007AFF',        // Blue background
      'tag': '#007AFF',            // Blue background
    };
    
    return backgroundColorMap[iconName] || '#007AFF';
  };

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    scrollY.current = currentScrollY;
    setScrollPosition(currentScrollY);
  }, []);

  const handleNavigation = (screen: 'EditProfile' | 'StorageAndData' | 'ChatsSettings' | 'NotificationSettings' | 'PrivacySettings' | 'HelpSettings' | 'ContactSettings' | 'InviteFriends' | 'Notes' | 'ManageFolders' | 'StickerMarket' | 'DesktopApp') => {
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
      id: 'organize',
      items: [
        {
          id: 'folders',
          title: 'Manage Folders',
          icon: 'folder',
          onPress: () => handleNavigation('ManageFolders'),
        },
        {
          id: 'notes',
          title: 'Notes',
          icon: 'note',
          onPress: () => handleNavigation('Notes'),
        },
      ]
    },
    {
      id: 'social',
      items: [
        {
          id: 'invite',
          title: 'Invite Friends',
          icon: 'person_add',
          onPress: () => handleNavigation('InviteFriends'),
        },
        {
          id: 'stickers',
          title: 'Sticker Market',
          icon: 'emoji_emotions',
          onPress: () => handleNavigation('StickerMarket'),
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
      id: 'apps',
      items: [
        {
          id: 'desktop',
          title: 'Get Bird for Desktop',
          icon: 'laptop',
          onPress: () => handleNavigation('DesktopApp'),
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
        {
          id: 'contact',
          title: 'Contact Us',
          icon: 'headset',
          onPress: () => handleNavigation('ContactSettings'),
        },
      ]
    }
  ];

  // Filter settings based on search query
  const filteredGroups = settingsGroups.map(group => ({
    ...group,
    items: group.items.filter(item => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(group => group.items.length > 0);

  return (
    <View style={styles.container}>
      <DynamicHeader 
        title="Settings"
        showBackButton={false}
        scrollY={scrollPosition}
        titleSize={20}
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Large title at the top */}
        <View style={styles.titleSection}>
          <Text style={styles.pageTitle}>Settings</Text>
        </View>

        {/* Search Bar - iOS Style */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <MaterialIcon name="search" size={20} color="rgba(142, 142, 147, 1)" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search"
              placeholderTextColor="rgba(142, 142, 147, 1)"
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
              clearButtonMode="while-editing"
            />
          </View>
        </View>

        {/* User Profile Card - iOS Style */}
        <View style={styles.settingsGroup}>
          <View style={styles.iosCard}>
            <TouchableOpacity
              style={styles.profileCardItem}
              onPress={() => handleNavigation('EditProfile')}
              activeOpacity={0.7}
            >
              <View style={styles.profileAvatarContainer}>
                <View style={styles.profileAvatar}>
                  <Text style={styles.profileInitials}>JD</Text>
                </View>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>John Doe</Text>
                <Text style={styles.profileSubtitle}>Edit Profile, Privacy & Status</Text>
              </View>
              <MaterialIcon 
                name="chevron_right" 
                size={20} 
                color="rgba(142, 142, 147, 1)" 
              />
            </TouchableOpacity>
          </View>
        </View>
        
        {filteredGroups.map((group) => (
          <View key={group.id} style={styles.settingsGroup}>
            <View style={styles.iosCard}>
              {group.items.map((item, index) => (
                <React.Fragment key={item.id}>
                  <TouchableOpacity
                    style={styles.iosCardItem}
                    onPress={item.onPress}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor(item.icon) }]}>
                      <MaterialIcon 
                        name={item.icon} 
                        size={18} 
                        color="#FFFFFF" 
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
    paddingTop: 100, // Space for header - same as other screens
  },
  titleSection: {
    paddingHorizontal: tokens.spacing.s,
    paddingTop: tokens.spacing.xl,
    paddingBottom: tokens.spacing.m,
  },
  pageTitle: {
    ...tokens.typography.largeTitle, // iOS Large Title style
    fontSize: 36,
    fontWeight: '700',
    color: tokens.colors.onSurface,
    letterSpacing: -0.5,
    marginTop: tokens.spacing.m,
    marginBottom: 0,
    paddingTop: 0,
    paddingBottom: 0,
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
    marginRight: 12, // iOS standard spacing
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8, // More rounded like iOS Settings
    // backgroundColor will be set dynamically
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
    marginBottom: 35, // iOS standard group spacing
    marginHorizontal: 8, // Reduced side margins for wider cards
  },
  iosCard: {
    backgroundColor: tokens.colors.cardBackground, // iOS card background from tokens
    borderRadius: tokens.radius.m, // iOS corner radius from tokens
    borderWidth: 0,
    ...tokens.elevation.small, // iOS shadow from tokens
    marginHorizontal: 0,
    overflow: 'hidden',
  },
  iosCardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 44, // Standard iOS cell height
    backgroundColor: 'transparent',
  },
  iosCardText: {
    ...tokens.typography.body, // iOS body text style from tokens
    color: '#FFFFFF',
    marginLeft: 12,
    flex: 1,
    fontWeight: '400', // iOS Settings weight
    fontFamily: 'System',
  },
  iosCardSeparator: {
    height: 0.33, // iOS standard separator thickness
    backgroundColor: tokens.colors.separator, // iOS separator color from tokens
    marginLeft: 52, // Align with text, accounting for icon
  },
  // Search Bar Styles
  searchSection: {
    marginHorizontal: 8,
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(118, 118, 128, 0.12)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 7,
    minHeight: 32,
  },
  searchPlaceholder: {
    fontSize: 17,
    color: 'rgba(142, 142, 147, 1)',
    marginLeft: 8,
    fontFamily: 'System',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 6,
    fontFamily: 'System',
    paddingVertical: 0, // Remove default padding
  },
  // Profile Card Styles
  profileCardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    minHeight: 76,
    backgroundColor: 'transparent',
  },
  profileAvatarContainer: {
    marginRight: 12,
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInitials: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'System',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 17,
    fontWeight: '400',
    color: '#FFFFFF',
    marginBottom: 2,
    fontFamily: 'System',
  },
  profileSubtitle: {
    fontSize: 13,
    color: 'rgba(142, 142, 147, 1)',
    fontFamily: 'System',
  },
  appCopyrightContainer: {
    alignItems: 'center',
    paddingVertical: tokens.spacing.m,
    marginTop: tokens.spacing.s,
  },
});
