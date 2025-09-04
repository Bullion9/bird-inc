import React, { useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { MotiView } from 'moti';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { tokens } from '../theme/tokens';
import { RootStackParamList } from '../navigation/types';

type OnboardingNavigationProp = StackNavigationProp<RootStackParamList, 'Onboarding'>;

const { width } = Dimensions.get('window');

const slides = [
  {
    emoji: '💬',
    title: 'Chat Securely',
    subtitle: 'End-to-end encrypted messages that only you and your friends can read.',
  },
  {
    emoji: '📞',
    title: 'Crystal Clear Calls',
    subtitle: 'High-quality voice and video calls with friends around the world.',
  },
  {
    emoji: '📖',
    title: 'Share Stories',
    subtitle: 'Express yourself with disappearing stories that capture your moments.',
  },
];

export const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation<OnboardingNavigationProp>();
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      navigation.replace('AuthDecision');
    }
  };

  const handleSkip = () => {
    navigation.replace('AuthDecision');
  };

  const slide = slides[currentSlide];

  return (
    <View style={styles.container}>
      <MotiView
        key={currentSlide}
        from={{ opacity: 0, translateX: 50 }}
        animate={{ opacity: 1, translateX: 0 }}
        transition={{ type: 'timing', duration: 300 }}
        style={styles.slideContainer}
      >
        <Text style={styles.emoji}>{slide.emoji}</Text>
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.subtitle}>{slide.subtitle}</Text>
      </MotiView>

      <View style={styles.indicators}>
        {slides.map((_, index) => (
          <MotiView
            key={index}
            style={styles.indicator}
            animate={{
              backgroundColor: index === currentSlide 
                ? tokens.colors.primary 
                : tokens.colors.surface3,
              scale: index === currentSlide ? 1.2 : 1,
            }}
            transition={{ type: 'timing', duration: 200 }}
          />
        ))}
      </View>

      <View style={styles.buttonContainer}>
        <Button
          mode="text"
          onPress={handleSkip}
          textColor={tokens.colors.onSurface60}
        >
          Skip
        </Button>
        
        <Button
          mode="contained"
          onPress={handleNext}
          buttonColor={tokens.colors.primary}
          style={styles.nextButton}
        >
          {currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.bg,
    paddingHorizontal: tokens.spacing.xl,
    justifyContent: 'center',
  },
  slideContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: tokens.spacing.l,
  },
  emoji: {
    fontSize: 80,
    marginBottom: tokens.spacing.xl,
  },
  title: {
    ...tokens.typography.h1,
    color: tokens.colors.onSurface,
    textAlign: 'center',
    marginBottom: tokens.spacing.m,
  },
  subtitle: {
    ...tokens.typography.body,
    color: tokens.colors.onSurface60,
    textAlign: 'center',
    lineHeight: 24,
  },
  indicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: tokens.spacing.xl,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: tokens.spacing.xl,
  },
  nextButton: {
    paddingHorizontal: tokens.spacing.l,
  },
});
