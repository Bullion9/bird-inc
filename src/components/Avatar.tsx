import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Text } from 'react-native-paper';
import { MotiView } from 'moti';
import { tokens } from '../theme/tokens';

interface AvatarProps {
  size: 40 | 48 | 56 | 96 | 120;
  source?: string;
  name: string;
  isOnline?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({
  size,
  source,
  name,
  isOnline = false,
}) => {
  const getInitials = (fullName: string) => {
    return fullName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const avatarStyle = {
    width: size,
    height: size,
    borderRadius: tokens.radius.xl,
  };

  const badgeSize = Math.floor(size * 0.25);
  const badgePosition = size * 0.75 - badgeSize / 2;

  return (
    <View style={[styles.container, avatarStyle]}>
      {source ? (
        <Image
          source={{ uri: source }}
          style={[styles.image, avatarStyle]}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.fallback, avatarStyle]}>
          <Text
            style={[
              styles.initials,
              { fontSize: size * 0.4 }
            ]}
          >
            {getInitials(name)}
          </Text>
        </View>
      )}
      
      {isOnline && (
        <MotiView
          style={[
            styles.onlineBadge,
            {
              width: badgeSize,
              height: badgeSize,
              borderRadius: badgeSize / 2,
              right: -2,
              bottom: -2,
            },
          ]}
          from={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: 'spring',
            damping: 15,
            stiffness: 150,
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  image: {
    backgroundColor: tokens.colors.surface3,
  },
  fallback: {
    backgroundColor: tokens.colors.surface3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    color: tokens.colors.onSurface,
    fontWeight: '600',
  },
  onlineBadge: {
    position: 'absolute',
    backgroundColor: tokens.colors.secondary,
    borderWidth: 2,
    borderColor: tokens.colors.surface1,
  },
});
