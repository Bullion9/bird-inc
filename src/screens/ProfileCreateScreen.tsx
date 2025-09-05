import React, { useState, useRef, useCallback } from 'react';
import { View, StyleSheet, ScrollView, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { Text, Button, Avatar as PaperAvatar } from 'react-native-paper';
import { MotiView } from 'moti';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { tokens } from '../theme/tokens';
import { RootStackParamList } from '../navigation/types';
import { DynamicHeader, AnimatedFloatingLabel, BirdCard } from '../components';

type ProfileCreateNavigationProp = StackNavigationProp<RootStackParamList, 'ProfileCreate'>;

export const ProfileCreateScreen: React.FC = () => {
  const navigation = useNavigation<ProfileCreateNavigationProp>();
  const scrollYRef = useRef(0);
  const [scrollPosition, setScrollPosition] = React.useState(0);
  const [name, setName] = useState('');
  const [tag, setTag] = useState('');
  const [avatar, setAvatar] = useState('');
  const [loading, setLoading] = useState(false);

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    scrollYRef.current = currentScrollY;
    setScrollPosition(currentScrollY);
  }, []);

  const handleContinue = async () => {
    if (!name.trim()) return;
    
    setLoading(true);
    // Simulate profile creation
    setTimeout(() => {
      setLoading(false);
      navigation.replace('Home');
    }, 1500);
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <DynamicHeader
        title="Create Profile"
        showBackButton
        onBackPress={handleBack}
        scrollY={scrollPosition}
      />

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
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
          <Text style={styles.largeTitle}>Create Profile</Text>
        </MotiView>
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'timing', duration: 400 }}
          style={styles.avatarSection}
        >
          <View style={styles.avatarContainer}>
            <PaperAvatar.Text
              size={96}
              label={name ? name.substring(0, 2).toUpperCase() : '🐦'}
              style={styles.avatar}
              labelStyle={styles.avatarLabel}
            />
            <Button
              mode="text"
              onPress={() => {/* TODO: Image picker */}}
              textColor={tokens.colors.primary}
              style={styles.avatarButton}
            >
              Choose Photo
            </Button>
          </View>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400, delay: 200 }}
          style={styles.formSection}
        >
          <AnimatedFloatingLabel
            label="Display Name"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />

          <AnimatedFloatingLabel
            label="Username (optional)"
            value={tag}
            onChangeText={setTag}
            autoCapitalize="none"
          />

          <BirdCard style={styles.infoCard}>
            <Text style={styles.infoText}>
              Your display name and username will be visible to other users. 
              You can change these later in settings.
            </Text>
          </BirdCard>
        </MotiView>
      </ScrollView>

      <MotiView
        from={{ opacity: 0, translateY: 30 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 400, delay: 400 }}
        style={styles.buttonContainer}
      >
        <Button
          mode="contained"
          onPress={handleContinue}
          loading={loading}
          disabled={!name.trim() || loading}
          buttonColor={tokens.colors.primary}
          style={styles.continueButton}
          contentStyle={styles.buttonContent}
        >
          Create Profile
        </Button>
      </MotiView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.bg,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: tokens.spacing.xl,
    paddingTop: 120, // Space for the large title under the header
  },
  largeTitle: {
    ...tokens.typography.h1,
    fontSize: 28,
    fontWeight: '600',
    color: tokens.colors.onSurface,
    marginBottom: tokens.spacing.l,
    textAlign: 'center',
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: tokens.spacing.xl,
  },
  avatarContainer: {
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: tokens.colors.surface3,
    marginBottom: tokens.spacing.m,
  },
  avatarLabel: {
    fontSize: 32,
    color: tokens.colors.onSurface,
  },
  avatarButton: {
    marginTop: tokens.spacing.s,
  },
  formSection: {
    marginBottom: tokens.spacing.xl,
  },
  infoCard: {
    marginTop: tokens.spacing.l,
  },
  infoText: {
    ...tokens.typography.body,
    color: tokens.colors.onSurface60,
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonContainer: {
    padding: tokens.spacing.xl,
    paddingTop: 0,
  },
  continueButton: {
    borderRadius: tokens.radius.m,
  },
  buttonContent: {
    paddingVertical: tokens.spacing.s,
  },
});
