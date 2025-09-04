import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Surface, Button } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as Haptics from 'expo-haptics';

import { tokens } from '../theme/tokens';
import { SettingsStackParamList } from '../navigation/types';
import { DynamicHeader, AnimatedFloatingLabel } from '../components';

type UsernameEditNavigationProp = StackNavigationProp<SettingsStackParamList, 'UsernameEdit'>;
type UsernameEditRouteProp = RouteProp<SettingsStackParamList, 'UsernameEdit'>;

export const UsernameEditScreen: React.FC = () => {
  const navigation = useNavigation<UsernameEditNavigationProp>();
  const route = useRoute<UsernameEditRouteProp>();
  
  const { initialUsername, onUsernameChange } = route.params;
  
  const [username, setUsername] = useState(initialUsername);
  const [isDirty, setIsDirty] = useState(false);
  const [isValid, setIsValid] = useState(true);
  const [scrollOffset, setScrollOffset] = useState(0);

  useEffect(() => {
    const cleanUsername = username.toLowerCase().replace(/[^a-z0-9_]/g, '');
    const isValidUsername = cleanUsername.length >= 3 && cleanUsername.length <= 30;
    
    setIsDirty(cleanUsername !== initialUsername && cleanUsername.length > 0);
    setIsValid(isValidUsername || cleanUsername.length === 0);
    
    // Auto-clean the username input
    if (username !== cleanUsername) {
      setUsername(cleanUsername);
    }
  }, [username, initialUsername]);

  const handleSave = () => {
    if (!isDirty || !isValid || username.trim().length < 3) {
      navigation.goBack();
      return;
    }
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onUsernameChange(username.trim());
    navigation.goBack();
  };

  const handleCancel = () => {
    if (isDirty) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    navigation.goBack();
  };

  const canSave = isDirty && isValid && username.length >= 3;

  return (
    <View style={styles.container}>
      <DynamicHeader 
        title="Username"
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
        scrollY={scrollOffset}
        rightIcons={[
          {
            icon: 'check',
            onPress: handleSave,
          },
        ]}
      />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          onScroll={(event) => {
            setScrollOffset(event.nativeEvent.contentOffset.y);
          }}
          scrollEventThrottle={16}
        >
          <View style={styles.instructionContainer}>
            <Text style={styles.instructionTitle}>Username</Text>
            <Text style={styles.instructionText}>
              Choose a unique username. Your friends can find you with this username.
            </Text>
          </View>

          <View style={styles.inputContainer}>
            <AnimatedFloatingLabel
              label="Username"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              keyboardType="default"
              error={username.length > 0 && !isValid ? 'Username must be 3-30 characters, letters, numbers and _ only' : undefined}
            />
            
            <View style={styles.characterCountContainer}>
              <Text style={[
                styles.characterCount,
                { color: username.length >= 3 && isValid ? tokens.colors.success : tokens.colors.onSurface60 }
              ]}>
                {username.length}/30
              </Text>
            </View>
            
            {username.length > 0 && (
              <View style={styles.usernamePreview}>
                <Text style={styles.usernamePreviewLabel}>Preview:</Text>
                <Text style={styles.usernamePreviewText}>@{username}</Text>
              </View>
            )}
          </View>

          <View style={styles.rulesContainer}>
            <Text style={styles.rulesTitle}>Username rules:</Text>
            <Text style={[styles.ruleText, { color: username.length >= 3 ? tokens.colors.success : tokens.colors.onSurface60 }]}>
              • At least 3 characters
            </Text>
            <Text style={[styles.ruleText, { color: username.length <= 30 ? tokens.colors.success : tokens.colors.error }]}>
              • Maximum 30 characters
            </Text>
            <Text style={styles.ruleText}>
              • Only letters, numbers, and underscore (_)
            </Text>
            <Text style={styles.ruleText}>
              • No spaces or special characters
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.bg,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: tokens.spacing.m,
    paddingBottom: tokens.spacing.xl,
    paddingTop: 150, // Space for header + generous top spacing for body
  },
  instructionContainer: {
    marginBottom: tokens.spacing.l,
  },
  instructionTitle: {
    ...tokens.typography.h2,
    color: tokens.colors.onSurface,
    marginBottom: tokens.spacing.s,
  },
  instructionText: {
    ...tokens.typography.body,
    color: tokens.colors.onSurface60,
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: tokens.spacing.l,
  },
  characterCountContainer: {
    alignItems: 'flex-end',
    marginTop: tokens.spacing.xs,
  },
  characterCount: {
    ...tokens.typography.caption,
    fontSize: 12,
    fontWeight: '600',
  },
  usernamePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: tokens.spacing.s,
    padding: tokens.spacing.s,
    backgroundColor: tokens.colors.surface2,
    borderRadius: tokens.radius.s,
  },
  usernamePreviewLabel: {
    ...tokens.typography.caption,
    color: tokens.colors.onSurface60,
    marginRight: tokens.spacing.s,
  },
  usernamePreviewText: {
    ...tokens.typography.body,
    color: tokens.colors.primary,
    fontWeight: '600',
  },
  rulesContainer: {
    gap: tokens.spacing.s,
  },
  rulesTitle: {
    ...tokens.typography.body,
    color: tokens.colors.onSurface,
    fontWeight: '600',
    marginBottom: tokens.spacing.s,
  },
  ruleText: {
    ...tokens.typography.caption,
    color: tokens.colors.onSurface60,
    lineHeight: 18,
  },
});
