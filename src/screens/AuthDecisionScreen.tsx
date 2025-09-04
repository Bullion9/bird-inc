import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, SegmentedButtons } from 'react-native-paper';
import { MotiView } from 'moti';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { tokens } from '../theme/tokens';
import { RootStackParamList } from '../navigation/types';
import { DynamicHeader } from '../components';

type AuthDecisionNavigationProp = StackNavigationProp<RootStackParamList, 'AuthDecision'>;

export const AuthDecisionScreen: React.FC = () => {
  const navigation = useNavigation<AuthDecisionNavigationProp>();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const scrollYRef = React.useRef(0);
  const [scrollPosition, setScrollPosition] = React.useState(0);

  const handleScroll = React.useCallback((event: any) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    scrollYRef.current = currentScrollY;
    setScrollPosition(currentScrollY);
  }, []);

  const handleContinue = () => {
    navigation.navigate('PhoneAuth');
  };

  return (
    <View style={styles.container}>
      <DynamicHeader
        title="Welcome to bird"
        showBackButton={false}
        scrollY={scrollPosition}
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
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
          <Text style={styles.largeTitle}>Welcome to bird</Text>
        </MotiView>
        
        <MotiView
          from={{ opacity: 0, translateY: -30 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400 }}
          style={styles.headerContainer}
        >
          <Text style={styles.emoji}>🐦</Text>
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
  contentContainer: {
    paddingHorizontal: tokens.spacing.xl,
    justifyContent: 'space-between',
    paddingTop: 120,
    paddingBottom: tokens.spacing.xl,
    minHeight: '100%',
  },
  largeTitle: {
    ...tokens.typography.h1,
    fontSize: 28,
    fontWeight: '400',
    color: tokens.colors.onSurface,
    marginBottom: tokens.spacing.l,
    textAlign: 'center',
  },
  headerContainer: {
    alignItems: 'center',
  },
  emoji: {
    fontSize: 64,
    marginBottom: tokens.spacing.m,
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
