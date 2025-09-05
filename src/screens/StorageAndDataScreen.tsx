import React, { useState, useRef, useCallback } from 'react';
import { View, StyleSheet, ScrollView, NativeScrollEvent, NativeSyntheticEvent, TouchableOpacity } from 'react-native';
import { Text, Switch, ProgressBar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';

import { tokens } from '../theme/tokens';
import { SettingsStackParamList } from '../navigation/types';
import { MaterialIcon, DynamicHeader } from '../components';

type StorageAndDataNavigationProp = StackNavigationProp<SettingsStackParamList, 'StorageAndData'>;

interface StorageItem {
  label: string;
  size: string;
  percentage: number;
  color: string;
}

export const StorageAndDataScreen: React.FC = () => {
  const navigation = useNavigation<StorageAndDataNavigationProp>();
  const scrollY = useRef(0);
  const [scrollPosition, setScrollPosition] = React.useState(0);
  
  const [settings, setSettings] = useState({
    autoDownloadPhotos: true,
    autoDownloadVideos: false,
    autoDownloadFiles: false,
    compressImages: true,
    saveToGallery: true,
  });

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    scrollY.current = currentScrollY;
    setScrollPosition(currentScrollY);
  }, []);

  const storageBreakdown: StorageItem[] = [
    { label: 'Photos', size: '2.4 GB', percentage: 0.6, color: tokens.colors.primary },
    { label: 'Videos', size: '1.1 GB', percentage: 0.275, color: '#4CAF50' },
    { label: 'Voice Messages', size: '256 MB', percentage: 0.064, color: '#FF9800' },
    { label: 'Files', size: '189 MB', percentage: 0.047, color: '#F44336' },
    { label: 'Other', size: '56 MB', percentage: 0.014, color: tokens.colors.onSurface60 },
  ];

  const totalStorage = '4.0 GB';

  const handleToggle = (setting: keyof typeof settings) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSettings(prev => ({ ...prev, [setting]: !prev[setting] }));
  };

  const handleClearCache = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // Clear cache logic here
  };

  const handleManageStorage = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Navigate to detailed storage management
  };

  return (
    <View style={styles.container}>
      <DynamicHeader 
        title="Storage & Data"
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
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
          <Text style={styles.largeTitle}>Storage & Data</Text>
        </MotiView>
        
        {/* Storage Overview - iOS Style */}
        <View style={styles.iosCard}>
          <View style={styles.iosCardItem}>
            <MaterialIcon name="storage" size={24} color={tokens.colors.primary} />
            <Text style={styles.iosCardText}>Storage Usage</Text>
          </View>
          
          <View style={styles.iosCardSeparator} />
          
          <View style={styles.iosCardItem}>
            <View style={styles.storageOverview}>
              <Text style={styles.totalStorage}>
                {totalStorage} <Text style={styles.storageLabel}>used</Text>
              </Text>
              
              <View style={styles.storageBreakdown}>
                {storageBreakdown.map((item, index) => (
                  <View key={index} style={styles.storageItem}>
                    <View style={styles.storageItemHeader}>
                      <View style={styles.storageItemLabel}>
                        <View style={[styles.colorIndicator, { backgroundColor: item.color }]} />
                        <Text style={styles.storageItemName}>{item.label}</Text>
                      </View>
                      <Text style={styles.storageItemSize}>{item.size}</Text>
                    </View>
                    <ProgressBar
                      progress={item.percentage}
                      color={item.color}
                      style={styles.progressBar}
                    />
                  </View>
                ))}
              </View>
              
              <TouchableOpacity onPress={handleManageStorage} style={styles.manageButton}>
                <View style={styles.manageButtonContent}>
                  <Text style={styles.manageButtonText}>Manage Storage</Text>
                  <MaterialIcon name="chevron_right" size={20} color={tokens.colors.primary} />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Auto-Download Settings - iOS Style */}
        <View style={styles.iosCard}>
          <View style={styles.iosCardItem}>
            <MaterialIcon name="download" size={24} color={tokens.colors.primary} />
            <Text style={styles.iosCardText}>Auto-Download</Text>
          </View>
          
          <View style={styles.iosCardSeparator} />
          
          <View style={styles.iosCardItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Photos</Text>
              <Text style={styles.settingDescription}>
                Automatically download photos in chats
              </Text>
            </View>
            <Switch
              value={settings.autoDownloadPhotos}
              onValueChange={() => handleToggle('autoDownloadPhotos')}
              thumbColor={settings.autoDownloadPhotos ? tokens.colors.primary : tokens.colors.onSurface60}
              trackColor={{ 
                false: tokens.colors.surface3, 
                true: `${tokens.colors.primary}40` 
              }}
            />
          </View>
          
          <View style={styles.iosCardSeparator} />
          
          <View style={styles.iosCardItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Videos</Text>
              <Text style={styles.settingDescription}>
                Automatically download videos in chats
              </Text>
            </View>
            <Switch
              value={settings.autoDownloadVideos}
              onValueChange={() => handleToggle('autoDownloadVideos')}
              thumbColor={settings.autoDownloadVideos ? tokens.colors.primary : tokens.colors.onSurface60}
              trackColor={{ 
                false: tokens.colors.surface3, 
                true: `${tokens.colors.primary}40` 
              }}
            />
          </View>
          
          <View style={styles.iosCardSeparator} />
          
          <View style={styles.iosCardItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Files</Text>
              <Text style={styles.settingDescription}>
                Automatically download files and documents
              </Text>
            </View>
            <Switch
              value={settings.autoDownloadFiles}
              onValueChange={() => handleToggle('autoDownloadFiles')}
              thumbColor={settings.autoDownloadFiles ? tokens.colors.primary : tokens.colors.onSurface60}
              trackColor={{ 
                false: tokens.colors.surface3, 
                true: `${tokens.colors.primary}40` 
              }}
            />
          </View>
        </View>

        {/* Media Settings - iOS Style */}
        <View style={styles.iosCard}>
          <View style={styles.iosCardItem}>
            <MaterialIcon name="photo" size={24} color={tokens.colors.primary} />
            <Text style={styles.iosCardText}>Media Settings</Text>
          </View>
          
          <View style={styles.iosCardSeparator} />
          
          <View style={styles.iosCardItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Compress Images</Text>
              <Text style={styles.settingDescription}>
                Reduce image file sizes to save storage
              </Text>
            </View>
            <Switch
              value={settings.compressImages}
              onValueChange={() => handleToggle('compressImages')}
              thumbColor={settings.compressImages ? tokens.colors.primary : tokens.colors.onSurface60}
              trackColor={{ 
                false: tokens.colors.surface3, 
                true: `${tokens.colors.primary}40` 
              }}
            />
          </View>
          
          <View style={styles.iosCardSeparator} />
          
          <View style={styles.iosCardItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Save to Gallery</Text>
              <Text style={styles.settingDescription}>
                Save received photos and videos to device gallery
              </Text>
            </View>
            <Switch
              value={settings.saveToGallery}
              onValueChange={() => handleToggle('saveToGallery')}
              thumbColor={settings.saveToGallery ? tokens.colors.primary : tokens.colors.onSurface60}
              trackColor={{ 
                false: tokens.colors.surface3, 
                true: `${tokens.colors.primary}40` 
              }}
            />
          </View>
        </View>

        {/* Cache Management - iOS Style */}
        <TouchableOpacity onPress={handleClearCache}>
          <View style={styles.iosCard}>
            <View style={styles.iosCardItem}>
              <MaterialIcon name="cleaning_services" size={24} color={tokens.colors.primary} />
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Clear Cache</Text>
                <Text style={styles.settingDescription}>
                  Free up space by clearing temporary files
                </Text>
              </View>
              <Text style={styles.cacheSize}>124 MB</Text>
            </View>
          </View>
        </TouchableOpacity>
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
    fontSize: 12, // Reduced from 36 to 28
    fontWeight: '400', // Changed from '700' to '400' (unbold)
    color: tokens.colors.onSurface,
    marginBottom: tokens.spacing.l,
    marginTop: 10, // Changed from -20 to 10 (bring text down)
  },
  sectionCard: {
    marginBottom: tokens.spacing.m,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: tokens.spacing.m,
    gap: tokens.spacing.s,
  },
  sectionTitle: {
    ...tokens.typography.body,
    color: tokens.colors.onSurface,
    fontWeight: '600',
  },
  storageOverview: {
    gap: tokens.spacing.m,
    flex: 1,
  },
  totalStorage: {
    ...tokens.typography.h2,
    color: tokens.colors.onSurface,
    fontWeight: '400',
    textAlign: 'center',
  },
  storageLabel: {
    ...tokens.typography.body,
    color: tokens.colors.onSurface60,
    fontWeight: '400',
  },
  storageBreakdown: {
    gap: tokens.spacing.s,
  },
  storageItem: {
    gap: tokens.spacing.xs,
  },
  storageItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  storageItemLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.s,
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  storageItemName: {
    ...tokens.typography.caption,
    color: tokens.colors.onSurface,
  },
  storageItemSize: {
    ...tokens.typography.caption,
    color: tokens.colors.onSurface60,
    fontWeight: '600',
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    backgroundColor: tokens.colors.surface3,
  },
  manageButton: {
    marginTop: tokens.spacing.s,
  },
  manageButtonContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  manageButtonText: {
    ...tokens.typography.body,
    color: tokens.colors.primary,
    fontWeight: '600',
  },
  settingsList: {
    gap: tokens.spacing.m,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: tokens.spacing.m,
  },
  settingInfo: {
    flex: 1,
    gap: tokens.spacing.xs,
  },
  settingLabel: {
    ...tokens.typography.body,
    color: tokens.colors.onSurface,
    fontWeight: '500',
  },
  settingDescription: {
    ...tokens.typography.caption,
    color: tokens.colors.onSurface60,
  },
  clearCacheContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clearCacheInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: tokens.spacing.s,
  },
  clearCacheText: {
    flex: 1,
    gap: tokens.spacing.xs,
  },
  clearCacheTitle: {
    ...tokens.typography.body,
    color: tokens.colors.onSurface,
    fontWeight: '500',
  },
  clearCacheDescription: {
    ...tokens.typography.caption,
    color: tokens.colors.onSurface60,
  },
  cacheSize: {
    ...tokens.typography.body,
    color: tokens.colors.onSurface60,
    fontWeight: '600',
  },
  // iOS-style cards
  iosCard: {
    backgroundColor: tokens.colors.surface1,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
    marginBottom: tokens.spacing.m,
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
    fontWeight: '600',
  },
  iosCardSeparator: {
    height: 0.5,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginLeft: 56, // Align with text
  },
});
