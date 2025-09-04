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

  const ArrowIcon = () => (
    <Text style={styles.arrowIcon}>›</Text>
  );

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
            
            <View style={styles.separator} />
            
            <View style={styles.settingItem}>
              <View style={styles.settingItemLeft}>
                <View style={styles.iconContainer}>
                  <MaterialIcon name="timer" size={20} color={tokens.colors.primary} />
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
                <View style={styles.iconContainer}>
                  <MaterialIcon name="circle" size={20} color={tokens.colors.success} />
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
                <View style={styles.iconContainer}>
                  <MaterialIcon name="keyboard" size={20} color={tokens.colors.primary} />
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
                <View style={styles.iconContainer}>
                  <MaterialIcon name="notifications" size={20} color={tokens.colors.primary} />
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
                <View style={styles.iconContainer}>
                  <MaterialIcon name="visibility" size={20} color={tokens.colors.primary} />
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
                <View style={styles.iconContainer}>
                  <MaterialIcon name="storage" size={20} color={tokens.colors.primary} />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Backup Chats</Text>
                  <Text style={styles.settingSubtitle}>Last backup: 2 days ago</Text>
                </View>
              </View>
              <ArrowIcon />
            </TouchableOpacity>
            
            <View style={styles.separator} />
            
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => handleActionPress('export')}
              activeOpacity={0.7}
            >
              <View style={styles.settingItemLeft}>
                <View style={styles.iconContainer}>
                  <MaterialIcon name="download" size={20} color={tokens.colors.primary} />
                </View>
                <Text style={styles.settingTitle}>Export Chat History</Text>
              </View>
              <ArrowIcon />
            </TouchableOpacity>
            
            <View style={styles.separator} />
            
            <View style={styles.settingItem}>
              <View style={styles.settingItemLeft}>
                <View style={styles.iconContainer}>
                  <MaterialIcon name="folder" size={20} color={tokens.colors.primary} />
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
                <View style={styles.iconContainer}>
                  <MaterialIcon name="image" size={20} color={tokens.colors.primary} />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Chat Theme</Text>
                  <Text style={styles.settingSubtitle}>Dark</Text>
                </View>
              </View>
              <ArrowIcon />
            </TouchableOpacity>
            
            <View style={styles.separator} />
            
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => handleActionPress('wallpaper')}
              activeOpacity={0.7}
            >
              <View style={styles.settingItemLeft}>
                <View style={styles.iconContainer}>
                  <MaterialIcon name="image" size={20} color={tokens.colors.primary} />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Chat Wallpaper</Text>
                  <Text style={styles.settingSubtitle}>Default</Text>
                </View>
              </View>
              <ArrowIcon />
            </TouchableOpacity>
            
            <View style={styles.separator} />
            
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => handleActionPress('font-size')}
              activeOpacity={0.7}
            >
              <View style={styles.settingItemLeft}>
                <View style={styles.iconContainer}>
                  <MaterialIcon name="add" size={20} color={tokens.colors.primary} />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Font Size</Text>
                  <Text style={styles.settingSubtitle}>Medium</Text>
                </View>
              </View>
              <ArrowIcon />
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
                <View style={styles.iconContainer}>
                  <MaterialIcon name="phone" size={20} color={tokens.colors.secondary} />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Clear Chat Cache</Text>
                  <Text style={styles.settingSubtitle}>Free up storage space</Text>
                </View>
              </View>
              <ArrowIcon />
            </TouchableOpacity>
            
            <View style={styles.separator} />
            
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => handleActionPress('delete-all')}
              activeOpacity={0.7}
            >
              <View style={styles.settingItemLeft}>
                <View style={styles.iconContainer}>
                  <MaterialIcon name="delete" size={20} color={tokens.colors.error} />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={[styles.settingTitle, { color: tokens.colors.error }]}>Delete All Chats</Text>
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
