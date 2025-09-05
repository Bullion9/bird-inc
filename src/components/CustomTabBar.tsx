import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { MotiView } from 'moti';
import { tokens } from '../theme/tokens';
import { MaterialIcon } from './MaterialIcon';

const iconMap: { [key: string]: string } = {
  ChatsStack: 'message-text',
  CallsStack: 'phone', 
  StoriesStack: 'book-open-variant',
  SettingsStack: 'cog',
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
  return (
    <View style={styles.container}>
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
              activeOpacity={0.7}
              onPress={onPress}
              style={styles.tabItem}
            >
              <View style={styles.tabContent}>
                {/* Top indicator pill */}
                <MotiView
                  style={styles.indicator}
                  animate={{
                    opacity: isFocused ? 1 : 0,
                    scaleX: isFocused ? 1 : 0.5,
                  }}
                  transition={{
                    type: 'timing',
                    duration: 200,
                  }}
                />
                
                {/* Icon */}
                <MaterialIcon
                  name={iconName}
                  size={24}
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
    backgroundColor: tokens.colors.surface1,
  },
  divider: {
    height: 1,
    backgroundColor: tokens.colors.surface3,
  },
  tabBar: {
    flexDirection: 'row',
    height: 80,
    alignItems: 'center',
    paddingVertical: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  tabContent: {
    alignItems: 'center',
    position: 'relative',
    height: '100%',
    justifyContent: 'space-between',
  },
  indicator: {
    position: 'absolute',
    top: 0,
    width: 20,
    height: 3,
    backgroundColor: tokens.colors.primary,
    borderRadius: 1.5,
  },
  label: {
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '400',
    fontFamily: 'System',
    marginTop: 4,
    marginBottom: 0,
  },
});
