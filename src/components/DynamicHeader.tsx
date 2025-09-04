import React from 'react';
import { View, StyleSheet, StatusBar, Platform } from 'react-native';
import { Appbar, Text } from 'react-native-paper';
import { MotiView } from 'moti';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { tokens } from '../theme/tokens';

interface DynamicHeaderProps {
  title: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightIcons?: Array<{
    icon: string;
    onPress: () => void;
  }>;
  scrollOffset?: number;
}

export const DynamicHeader: React.FC<DynamicHeaderProps> = ({
  title,
  showBackButton = false,
  onBackPress,
  rightIcons = [],
  scrollOffset = 0,
}) => {
  const insets = useSafeAreaInsets();
  const showShadow = scrollOffset > 20;
  const headerOpacity = Math.min(1, scrollOffset / 100); // Fade in as user scrolls
  const titleScale = Math.max(0.9, 1 - scrollOffset / 500); // Slightly shrink title on scroll
  const backgroundOpacity = Math.min(0.95, 0.4 + scrollOffset / 200); // Background becomes more opaque

  return (
    <MotiView
      style={[
        styles.container,
        { paddingTop: insets.top },
      ]}
      animate={{
        shadowOpacity: showShadow ? 0.15 : 0,
        backgroundColor: `${tokens.colors.surface1}${Math.round(backgroundOpacity * 255).toString(16).padStart(2, '0')}`,
      }}
      transition={{
        type: 'timing',
        duration: 300,
      }}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      
      <MotiView 
        style={styles.header}
        animate={{
          opacity: Math.max(0.7, 1 - scrollOffset / 300),
        }}
        transition={{
          type: 'timing',
          duration: 200,
        }}
      >
        {showBackButton && (
          <MotiView
            from={{ opacity: 0, translateX: -20 }}
            animate={{ 
              opacity: 1, 
              translateX: 0,
              scale: titleScale,
            }}
            transition={{ type: 'timing', duration: 200 }}
          >
            <Appbar.BackAction
              iconColor={tokens.colors.onSurface}
              onPress={onBackPress}
            />
          </MotiView>
        )}
        
        <MotiView
          style={styles.titleContainer}
          from={{ opacity: 0, translateX: -20 }}
          animate={{ 
            opacity: 1, 
            translateX: 0,
            scale: titleScale,
          }}
          transition={{ type: 'timing', duration: 200, delay: 50 }}
        >
          <Text style={styles.title}>{title}</Text>
        </MotiView>
        
        <View style={styles.rightContainer}>
          {rightIcons.map((icon, index) => (
            <MotiView
              key={index}
              from={{ opacity: 0, translateX: 20, scale: 0.8 }}
              animate={{ 
                opacity: Math.max(0.6, 1 - scrollOffset / 400), 
                translateX: 0,
                scale: showShadow ? 0.95 : 1,
              }}
              transition={{ 
                type: 'timing', 
                duration: 250, 
                delay: 100 + (index * 50) 
              }}
            >
              <Appbar.Action
                icon={icon.icon}
                iconColor={tokens.colors.onSurface60}
                onPress={icon.onPress}
              />
            </MotiView>
          ))}
        </View>
      </MotiView>
      
      <MotiView 
        style={styles.border}
        animate={{
          opacity: showShadow ? 1 : 0.3,
          height: showShadow ? 2 : 1,
        }}
        transition={{
          type: 'timing',
          duration: 200,
        }}
      />
    </MotiView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: tokens.colors.surface1 + '66', // 40% opacity for blur effect
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.surface3,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 96,
    paddingHorizontal: tokens.spacing.s,
  },
  titleContainer: {
    flex: 1,
    marginLeft: tokens.spacing.s,
  },
  title: {
    ...tokens.typography.h2,
    color: tokens.colors.onSurface,
  },
  rightContainer: {
    flexDirection: 'row',
  },
  border: {
    height: 1,
    backgroundColor: tokens.colors.surface3,
  },
});
