import React from 'react';
import { View, StyleSheet, StatusBar, TouchableOpacity } from 'react-native';
import { Appbar, Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { tokens } from '../theme/tokens';
import { MaterialIcon } from './MaterialIcon';

interface DynamicHeaderProps {
  title: string;
  subtitle?: string; // Add subtitle support for contact info
  staticContent?: React.ReactNode; // Add static content when not scrolled
  showBackButton?: boolean;
  onBackPress?: () => void;
  onTitlePress?: () => void; // Add title press handler
  rightIcons?: Array<{
    icon: string;
    onPress: () => void;
  }>;
  scrollY?: number;
  titleSize?: number; // Add optional titleSize prop
}

export const DynamicHeader: React.FC<DynamicHeaderProps> = ({
  title,
  subtitle,
  staticContent,
  showBackButton = false,
  onBackPress,
  onTitlePress,
  rightIcons = [],
  scrollY = 0,
  titleSize = 16, // Default title size
}) => {
  const insets = useSafeAreaInsets();
  
  // Improved logic with smoother transitions - more aggressive collapsing
  const showTitle = scrollY > 30; // Reduced from 60 to 30
  const backgroundOpacity = Math.min(scrollY / 60, 0.95); // Reduced from 100 to 60 for faster response
  const titleOpacity = scrollY > 30 ? Math.min((scrollY - 30) / 25, 1) : 0; // Faster title appearance
  
  // Always show some background for the back button area when it's present
  const showBackButtonBackground = showBackButton && backgroundOpacity < 0.3;

  return (
    <MotiView
      style={[
        styles.container,
        { 
          paddingTop: insets.top,
          // Keep consistent header height like ChatsListScreen
        },
      ]}
      animate={{
        backgroundColor: `rgba(0, 0, 0, ${backgroundOpacity})`,
      }}
      transition={{
        type: 'timing',
        duration: 200,
      }}
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <View style={styles.header}>
        {showBackButton && (
          <MotiView 
            style={styles.leftContainer}
            animate={{
              opacity: backgroundOpacity > 0.1 ? 1 : 0.7,
            }}
            transition={{
              type: 'timing',
              duration: 200,
            }}
          >
            <TouchableOpacity
              onPress={onBackPress}
              style={styles.backButton}
            >
              <Text style={styles.iosBackArrow}>‹</Text>
            </TouchableOpacity>
          </MotiView>
        )}
        
        {/* Static content when not scrolled */}
        {staticContent && (
          <MotiView 
            style={styles.staticContentContainer}
            animate={{ 
              opacity: showTitle ? 0 : 1, 
              translateY: showTitle ? -10 : 0 
            }}
            transition={{ 
              type: 'timing', 
              duration: 300,
            }}
          >
            {staticContent}
          </MotiView>
        )}
        
        {showTitle && (
          <MotiView 
            style={styles.titleContainer}
            from={{ opacity: 0, translateY: -10 }}
            animate={{ 
              opacity: titleOpacity, 
              translateY: titleOpacity > 0 ? 0 : -10 
            }}
            transition={{ 
              type: 'timing', 
              duration: 300,
            }}
          >
            <TouchableOpacity 
              onPress={onTitlePress}
              disabled={!onTitlePress}
              style={styles.titleTouchable}
            >
              <Text style={[styles.title, { fontSize: titleSize }]}>{title}</Text>
              {subtitle && (
                <Text style={styles.subtitle}>{subtitle}</Text>
              )}
            </TouchableOpacity>
          </MotiView>
        )}
        
        <MotiView 
          style={styles.rightContainer}
          animate={{
            opacity: backgroundOpacity > 0.1 ? 1 : 0.7,
          }}
          transition={{
            type: 'timing',
            duration: 200,
          }}
        >
          {rightIcons.map((icon, index) => (
            <MaterialIcon
              key={index}
              name={icon.icon}
              size={24}
              color={tokens.colors.primary}
              onPress={icon.onPress}
            />
          ))}
        </MotiView>
      </View>
    </MotiView>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    overflow: 'hidden',
    // Clean iOS style without border
  },
  glassyBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: tokens.colors.cardBackground, // iOS card background
    borderBottomWidth: StyleSheet.hairlineWidth, // More visible separator
    borderBottomColor: tokens.colors.separator, // iOS separator color
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 64, // iOS navigation bar height
    paddingHorizontal: tokens.spacing.m, // iOS standard spacing
    position: 'relative',
    zIndex: 1,
  },
  leftContainer: {
    position: 'absolute',
    left: 16,
    flexDirection: 'row',
  },
  backButton: {
    margin: 0,
    padding: 8,
  },
  iosBackArrow: {
    fontSize: 40,
    fontWeight: '300',
    color: tokens.colors.primary,
    lineHeight: 40,
    textAlign: 'center',
    transform: [{ scaleX: 1.2 }], // Make it wider/longer
  },
  backButtonBackground: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: tokens.radius.m, // iOS corner radius
    marginLeft: -tokens.spacing.s,
    paddingLeft: tokens.spacing.s,
    borderWidth: 0.33, // iOS border thickness
    borderColor: tokens.colors.separator,
  },
  titleContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...tokens.typography.largeTitle, // iOS Large Title style like ChatsListScreen
    color: tokens.colors.onSurface,
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  titleTouchable: {
    paddingVertical: tokens.spacing.s,
    paddingHorizontal: tokens.spacing.m,
    borderRadius: tokens.radius.m,
    alignItems: 'center',
  },
  subtitle: {
    ...tokens.typography.body, // Match ChatsListScreen subtext
    color: tokens.colors.onSurface38, // Match ChatsListScreen subtext color
    marginTop: tokens.spacing.xs, // Match ChatsListScreen spacing
    textAlign: 'center',
  },
  staticContentContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 32, // Moved up from 28 to 32 for better spacing
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: tokens.spacing.m,
    zIndex: 100, // Ensure it's visible above background
  },
  rightContainer: {
    position: 'absolute',
    right: 16,
    flexDirection: 'row',
  },
});
