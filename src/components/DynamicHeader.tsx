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
            style={[
              styles.leftContainer,
              showBackButtonBackground && styles.backButtonBackground
            ]}
            animate={{
              opacity: showBackButtonBackground ? 1 : backgroundOpacity > 0.1 ? 1 : 0.7,
            }}
            transition={{
              type: 'timing',
              duration: 200,
            }}
          >
            <Appbar.BackAction
              iconColor={tokens.colors.onSurface}
              onPress={onBackPress}
              style={styles.backButton}
            />
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
              color="#9C27B0"
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
    // Removed shadow effects to eliminate separator line
  },
  glassyBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // White tint for glassy effect
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)', // Subtle border
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 64,
    paddingHorizontal: 16,
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
  },
  backButtonBackground: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 24,
    marginLeft: -8,
    paddingLeft: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  titleContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '400',
    color: tokens.colors.onSurface,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  titleTouchable: {
    paddingVertical: tokens.spacing.s,
    paddingHorizontal: tokens.spacing.m,
    borderRadius: tokens.radius.m,
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: tokens.colors.onSurface60,
    marginTop: 2,
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
