import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { MotiView } from 'moti';
import { tokens } from '../theme/tokens';
import { Avatar } from './Avatar';

interface BirdCardProps {
  children?: React.ReactNode;
  onPress?: () => void;
  avatar?: {
    source?: string;
    name: string;
    isOnline?: boolean;
  };
  title?: string;
  subtitle?: string;
  rightContent?: React.ReactNode;
  style?: any;
}

export const BirdCard: React.FC<BirdCardProps> = ({
  children,
  onPress,
  avatar,
  title,
  subtitle,
  rightContent,
  style,
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const CardComponent = onPress ? TouchableOpacity : View;

  const cardContent = (
    <View style={styles.content}>
      {avatar && (
        <View style={styles.avatarContainer}>
          <Avatar
            size={48}
            source={avatar.source}
            name={avatar.name}
            isOnline={avatar.isOnline}
          />
        </View>
      )}
      
      <View style={styles.textContainer}>
        {title && (
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        )}
        {subtitle && (
          <Text style={styles.subtitle} numberOfLines={2}>
            {subtitle}
          </Text>
        )}
        {children}
      </View>
      
      {rightContent && (
        <View style={styles.rightContainer}>
          {rightContent}
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <MotiView
        from={{ opacity: 0, scale: 0.95 }}
        animate={{ 
          opacity: 1, 
          scale: isPressed ? 0.97 : 1 
        }}
        transition={{ type: 'timing', duration: 100 }}
        style={style}
      >
        <TouchableOpacity
          onPress={onPress}
          onPressIn={() => setIsPressed(true)}
          onPressOut={() => setIsPressed(false)}
          style={styles.card}
          activeOpacity={1}
        >
          {cardContent}
        </TouchableOpacity>
      </MotiView>
    );
  }

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'timing', duration: 200 }}
      style={[styles.card, style]}
    >
      {cardContent}
    </MotiView>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: tokens.colors.surface2,
    borderRadius: tokens.radius.m,
    padding: tokens.spacing.m,
    marginVertical: tokens.spacing.s,
    minHeight: 64,
    ...tokens.elevation.medium, // Use medium elevation with full shadow properties
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: tokens.spacing.m,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    ...tokens.typography.body,
    color: tokens.colors.onSurface,
    fontWeight: '600',
    marginBottom: 2,
  },
  subtitle: {
    ...tokens.typography.caption,
    color: tokens.colors.onSurface60,
  },
  rightContainer: {
    marginLeft: tokens.spacing.s,
  },
});
