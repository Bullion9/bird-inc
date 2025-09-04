import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, SegmentedButtons } from 'react-native-paper';
import { MotiView } from 'moti';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { tokens } from '../theme/tokens';
import { RootStackParamList } from '../navigation/types';

type AuthDecisionNavigationProp = StackNavigationProp<RootStackParamList, 'AuthDecision'>;

export const AuthDecisionScreen: React.FC = () => {
  const navigation = useNavigation<AuthDecisionNavigationProp>();
  const [mode, setMode] = useState<'login' | 'register'>('login');

  const handleContinue = () => {
    navigation.navigate('PhoneAuth');
  };

  return (
    <View style={styles.container}>
      <MotiView
        from={{ opacity: 0, translateY: -30 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 400 }}
        style={styles.headerContainer}
      >
        <Text style={styles.emoji}>🐦</Text>
        <Text style={styles.title}>Welcome to bird</Text>
        <Text style={styles.subtitle}>
          Connect with friends and family through secure messaging
        </Text>
      </MotiView>

      <MotiView
        from={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'timing', duration: 400, delay: 200 }}
        style={styles.formContainer}
      >
        <SegmentedButtons
          value={mode}
          onValueChange={(value) => setMode(value as 'login' | 'register')}
          buttons={[
            { value: 'login', label: 'Sign In' },
            { value: 'register', label: 'Sign Up' },
          ]}
          style={styles.segmentedButtons}
          theme={{
            colors: {
              primary: tokens.colors.primary,
              surfaceVariant: tokens.colors.surface2,
              onSurfaceVariant: tokens.colors.onSurface60,
            },
          }}
        />

        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            {mode === 'login' 
              ? 'Welcome back! Sign in to continue your conversations.'
              : 'Join bird to start secure conversations with friends and family.'
            }
          </Text>
        </View>
      </MotiView>

      <MotiView
        from={{ opacity: 0, translateY: 30 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 400, delay: 400 }}
        style={styles.buttonContainer}
      >
        <Button
          mode="contained"
          onPress={handleContinue}
          buttonColor={tokens.colors.primary}
          style={styles.continueButton}
          contentStyle={styles.buttonContent}
        >
          Continue with Phone
        </Button>
        
        <Text style={styles.termsText}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
      </MotiView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.bg,
    paddingHorizontal: tokens.spacing.xl,
    justifyContent: 'space-between',
    paddingTop: 80,
    paddingBottom: tokens.spacing.xl,
  },
  headerContainer: {
    alignItems: 'center',
  },
  emoji: {
    fontSize: 64,
    marginBottom: tokens.spacing.m,
  },
  title: {
    ...tokens.typography.h1,
    color: tokens.colors.onSurface,
    textAlign: 'center',
    marginBottom: tokens.spacing.s,
  },
  subtitle: {
    ...tokens.typography.body,
    color: tokens.colors.onSurface60,
    textAlign: 'center',
    lineHeight: 22,
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    marginVertical: tokens.spacing.xl,
  },
  segmentedButtons: {
    marginBottom: tokens.spacing.xl,
  },
  infoContainer: {
    backgroundColor: tokens.colors.surface2,
    padding: tokens.spacing.l,
    borderRadius: tokens.radius.m,
    marginBottom: tokens.spacing.xl,
  },
  infoText: {
    ...tokens.typography.body,
    color: tokens.colors.onSurface60,
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonContainer: {
    alignItems: 'center',
  },
  continueButton: {
    width: '100%',
    borderRadius: tokens.radius.m,
    marginBottom: tokens.spacing.m,
  },
  buttonContent: {
    paddingVertical: tokens.spacing.s,
  },
  termsText: {
    ...tokens.typography.caption,
    color: tokens.colors.onSurface38,
    textAlign: 'center',
    lineHeight: 18,
  },
});
