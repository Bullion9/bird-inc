import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { MotiView } from 'moti';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { tokens } from '../theme/tokens';
import { RootStackParamList } from '../navigation/types';

type SplashNavigationProp = StackNavigationProp<RootStackParamList, 'Splash'>;

export const SplashScreen: React.FC = () => {
  const navigation = useNavigation<SplashNavigationProp>();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Onboarding');
    }, 1500); // Auto-close after 1.5s as specified

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <MotiView
        from={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: 'spring',
          damping: 15,
          stiffness: 150,
        }}
        style={styles.logoContainer}
      >
        <Text style={styles.logo}>🐦</Text>
        <Text style={styles.title}>bird</Text>
      </MotiView>
      
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{
          type: 'timing',
          duration: 800,
          delay: 500,
        }}
        style={styles.subtitleContainer}
      >
        <Text style={styles.subtitle}>Secure messaging reimagined</Text>
      </MotiView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.bg,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing.xl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: tokens.spacing.xl,
  },
  logo: {
    fontSize: 64,
    marginBottom: tokens.spacing.m,
  },
  title: {
    ...tokens.typography.h1,
    color: tokens.colors.primary,
    fontSize: 36,
    fontWeight: '700',
  },
  subtitleContainer: {
    position: 'absolute',
    bottom: 120,
  },
  subtitle: {
    ...tokens.typography.body,
    color: tokens.colors.onSurface60,
    textAlign: 'center',
  },
});
