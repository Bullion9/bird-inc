import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as Haptics from 'expo-haptics';

import { tokens } from '../theme/tokens';
import { SettingsStackParamList } from '../navigation/types';
import { DynamicHeader, MaterialIcon } from '../components';

type ChatsSettingsNavigationProp = StackNavigationProp<SettingsStackParamList, 'ChatsSettings'>;

export const ChatsSettingsScreen: React.FC = () => {
  const navigation = useNavigation<ChatsSettingsNavigationProp>();
  const [scrollOffset, setScrollOffset] = useState(0);

  // Settings state
  const [readReceipts, setReadReceipts] = useState(true);
  const [lastSeen, setLastSeen] = useState(true);
  const [onlineStatus, setOnlineStatus] = useState(true);
  const [enterToSend, setEnterToSend] = useState(false);
  const [soundEffects, setSoundEffects] = useState(true);
  const [messagePreview, setMessagePreview] = useState(true);
  const [groupNotifications, setGroupNotifications] = useState(true);
  const [archiveChats, setArchiveChats] = useState(false);

  // Icon color mapping for iOS-style vibrant icons
  const getIconColor = (iconName: string): string => {
    const colorMap: Record<string, string> = {
      // Privacy icons - blue theme
      'done_all': '#007AFF',
      'schedule': '#FF9500',
      'radio_button_checked': '#34C759',
      // Message icons - communication theme
      'send': '#007AFF',
      'volume_up': '#34C759',
      'preview': '#FF9500',
      // Management icons - action theme  
      'backup': '#5856D6',
      'file_download': '#00C7BE',
      'archive': '#FF9500',
      // Appearance icons - design theme
      'palette': '#FF2D92',
      'wallpaper': '#5856D6',
      'format_size': '#5856D6',
      // Advanced icons - warning theme
      'clear_all': '#FF9500',
      'delete': '#FF453A',
    };
    return colorMap[iconName] || '#007AFF';
  };

  const getIconBackgroundColor = (iconName: string): string => {
    // iOS Settings-style solid background colors
    const backgroundColorMap: Record<string, string> = {
      // Privacy icons - blue theme
      'done_all': '#007AFF',
      'schedule': '#FF9500',
      'radio_button_checked': '#34C759',
      // Message icons - communication theme
      'send': '#007AFF',
      'volume_up': '#34C759',
      'preview': '#FF9500',
      // Management icons - action theme  
      'backup': '#5856D6',
      'file_download': '#00C7BE',
      'archive': '#FF9500',
      // Appearance icons - design theme
      'palette': '#FF2D92',
      'wallpaper': '#5856D6',
      'format_size': '#5856D6',
      // Advanced icons - warning theme
      'clear_all': '#FF9500',
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
    // Handle different actions
    console.log(`Action pressed: ${action}`);
  };

  return (
    <View style={styles.container}>
      <DynamicHeader 
        title="Chats"
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
        {/* Privacy Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy</Text>
          <View style={styles.cardGroup}>
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
            
            <View style={styles.separator} />
            
            <View style={styles.settingItem}>
              <View style={styles.settingItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor('schedule') }]}>
                  <MaterialIcon name="schedule" size={18} color="#FFFFFF" />
                </View>
                <Text style={styles.settingTitle}>Last Seen</Text>
              </View>
              <Switch
                value={lastSeen}
                onValueChange={handleSwitchChange(setLastSeen, lastSeen)}
                trackColor={{ false: tokens.colors.surface3, true: tokens.colors.primary }}
                thumbColor={tokens.colors.onSurface}
              />
            </View>
            
            <View style={styles.separator} />
            
            <View style={styles.settingItem}>
              <View style={styles.settingItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor('radio_button_checked') }]}>
                  <MaterialIcon name="radio_button_checked" size={18} color="#FFFFFF" />
                </View>
                <Text style={styles.settingTitle}>Online Status</Text>
              </View>
              <Switch
                value={onlineStatus}
                onValueChange={handleSwitchChange(setOnlineStatus, onlineStatus)}
                trackColor={{ false: tokens.colors.surface3, true: tokens.colors.primary }}
                thumbColor={tokens.colors.onSurface}
              />
            </View>
          </View>
        </View>

        {/* Message Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Messages</Text>
          <View style={styles.cardGroup}>
            <View style={styles.settingItem}>
              <View style={styles.settingItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor('send') }]}>
                  <MaterialIcon name="send" size={18} color="#FFFFFF" />
                </View>
                <Text style={styles.settingTitle}>Enter to Send</Text>
              </View>
              <Switch
                value={enterToSend}
                onValueChange={handleSwitchChange(setEnterToSend, enterToSend)}
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
                <Text style={styles.settingTitle}>Sound Effects</Text>
              </View>
              <Switch
                value={soundEffects}
                onValueChange={handleSwitchChange(setSoundEffects, soundEffects)}
                trackColor={{ false: tokens.colors.surface3, true: tokens.colors.primary }}
                thumbColor={tokens.colors.onSurface}
              />
            </View>
            
            <View style={styles.separator} />
            
            <View style={styles.settingItem}>
              <View style={styles.settingItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor('preview') }]}>
                  <MaterialIcon name="preview" size={18} color="#FFFFFF" />
                </View>
                <Text style={styles.settingTitle}>Message Preview</Text>
              </View>
              <Switch
                value={messagePreview}
                onValueChange={handleSwitchChange(setMessagePreview, messagePreview)}
                trackColor={{ false: tokens.colors.surface3, true: tokens.colors.primary }}
                thumbColor={tokens.colors.onSurface}
              />
            </View>
          </View>
        </View>

        {/* Chat Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chat Management</Text>
          <View style={styles.cardGroup}>
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => handleActionPress('backup')}
              activeOpacity={0.7}
            >
              <View style={styles.settingItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor('backup') }]}>
                  <MaterialIcon name="backup" size={18} color="#FFFFFF" />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Backup Chats</Text>
                  <Text style={styles.settingSubtitle}>Last backup: 2 days ago</Text>
                </View>
              </View>
              <MaterialIcon name="chevron_right" size={20} color={tokens.colors.onSurface60} />
            </TouchableOpacity>
            
            <View style={styles.separator} />
            
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => handleActionPress('export')}
              activeOpacity={0.7}
            >
              <View style={styles.settingItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor('file_download') }]}>
                  <MaterialIcon name="file_download" size={18} color="#FFFFFF" />
                </View>
                <Text style={styles.settingTitle}>Export Chat History</Text>
              </View>
              <MaterialIcon name="chevron_right" size={20} color={tokens.colors.onSurface60} />
            </TouchableOpacity>
            
            <View style={styles.separator} />
            
            <View style={styles.settingItem}>
              <View style={styles.settingItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor('archive') }]}>
                  <MaterialIcon name="archive" size={18} color="#FFFFFF" />
                </View>
                <Text style={styles.settingTitle}>Auto-Archive Chats</Text>
              </View>
              <Switch
                value={archiveChats}
                onValueChange={handleSwitchChange(setArchiveChats, archiveChats)}
                trackColor={{ false: tokens.colors.surface3, true: tokens.colors.primary }}
                thumbColor={tokens.colors.onSurface}
              />
            </View>
          </View>
        </View>

        {/* Appearance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          <View style={styles.cardGroup}>
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => handleActionPress('theme')}
              activeOpacity={0.7}
            >
              <View style={styles.settingItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor('palette') }]}>
                  <MaterialIcon name="palette" size={18} color="#FFFFFF" />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Chat Theme</Text>
                  <Text style={styles.settingSubtitle}>Dark</Text>
                </View>
              </View>
              <MaterialIcon name="chevron_right" size={20} color={tokens.colors.onSurface60} />
            </TouchableOpacity>
            
            <View style={styles.separator} />
            
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => handleActionPress('wallpaper')}
              activeOpacity={0.7}
            >
              <View style={styles.settingItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor('wallpaper') }]}>
                  <MaterialIcon name="wallpaper" size={18} color="#FFFFFF" />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Chat Wallpaper</Text>
                  <Text style={styles.settingSubtitle}>Default</Text>
                </View>
              </View>
              <MaterialIcon name="chevron_right" size={20} color={tokens.colors.onSurface60} />
            </TouchableOpacity>
            
            <View style={styles.separator} />
            
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => handleActionPress('font-size')}
              activeOpacity={0.7}
            >
              <View style={styles.settingItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor('format_size') }]}>
                  <MaterialIcon name="format_size" size={18} color="#FFFFFF" />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Font Size</Text>
                  <Text style={styles.settingSubtitle}>Medium</Text>
                </View>
              </View>
              <MaterialIcon name="chevron_right" size={20} color={tokens.colors.onSurface60} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Advanced Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Advanced</Text>
          <View style={styles.cardGroup}>
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => handleActionPress('clear-cache')}
              activeOpacity={0.7}
            >
              <View style={styles.settingItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor('clear_all') }]}>
                  <MaterialIcon name="clear_all" size={18} color="#FFFFFF" />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Clear Chat Cache</Text>
                  <Text style={styles.settingSubtitle}>Free up storage space</Text>
                </View>
              </View>
              <MaterialIcon name="chevron_right" size={20} color={tokens.colors.onSurface60} />
            </TouchableOpacity>
            
            <View style={styles.separator} />
            
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => handleActionPress('delete-all')}
              activeOpacity={0.7}
            >
              <View style={styles.settingItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor('delete') }]}>
                  <MaterialIcon name="delete" size={18} color="#FFFFFF" />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={[styles.settingTitle, { color: tokens.colors.error }]}>Delete All Chats</Text>
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
