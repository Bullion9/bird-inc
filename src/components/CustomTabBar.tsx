import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { tokens } from '../theme/tokens';
import { MaterialIcon } from './MaterialIcon';

const iconMap: { [key: string]: string } = {
  ChatsStack: 'viber',
  CallsStack: 'phone', 
  StoriesStack: 'camera', // Camera for stories
  SettingsStack: 'settings',
};

const labelMap: { [key: string]: string } = {
  ChatsStack: 'Chats',
  CallsStack: 'Calls',
  StoriesStack: 'Stories', 
  SettingsStack: 'Settings',
};

export const CustomTabBar: React.FC<BottomTabBarProps> = ({ 
  state, 
  descriptors, 
  navigation 
}) => {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <View style={styles.divider} />
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const iconName = iconMap[route.name];
          const label = labelMap[route.name];

          return (
            <TouchableOpacity
              key={route.key}
              activeOpacity={0.6} // iOS standard opacity
              onPress={onPress}
              style={styles.tabItem}
            >
              <View style={styles.tabContent}>
                {/* Icon */}
                <MaterialIcon
                  name={iconName}
                  size={32} // Increased from 28 to 32
                  color={isFocused ? tokens.colors.primary : tokens.colors.onSurface38}
                  active={isFocused}
                />
                
                {/* Label */}
                <Text style={[
                  styles.label,
                  { color: isFocused ? tokens.colors.primary : tokens.colors.onSurface38 }
                ]}>
                  {label}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: tokens.colors.cardBackground, // iOS tab bar background
    paddingBottom: 0, // Remove extra padding for iOS style
  },
  divider: {
    height: 0.33, // iOS separator thickness
    backgroundColor: tokens.colors.separator, // iOS separator color
  },
  tabBar: {
    flexDirection: 'row',
    height: 83, // iOS tab bar height (49px + safe area)
    alignItems: 'center',
    paddingTop: tokens.spacing.s, // iOS spacing
    paddingBottom: tokens.spacing.m, // iOS spacing
    paddingHorizontal: 0,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6, // iOS tab item padding
    minHeight: 49, // iOS minimum tab height
  },
  tabContent: {
    alignItems: 'center',
    position: 'relative',
    height: '100%',
    justifyContent: 'center', // Center content for iOS style
    gap: 2, // iOS gap between icon and label
  },
  indicator: {
    display: 'none', // Remove custom indicator for clean iOS look
  },
  label: {
    ...tokens.typography.caption2, // iOS Caption 2 style
    color: 'inherit', // Will be overridden by parent color
    marginTop: 1, // Tight iOS spacing
    marginBottom: 0,
  },
});
