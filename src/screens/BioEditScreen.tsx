import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Surface, Button } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as Haptics from 'expo-haptics';

import { tokens } from '../theme/tokens';
import { SettingsStackParamList } from '../navigation/types';
import { DynamicHeader, AnimatedFloatingLabel } from '../components';

type BioEditNavigationProp = StackNavigationProp<SettingsStackParamList, 'BioEdit'>;
type BioEditRouteProp = RouteProp<SettingsStackParamList, 'BioEdit'>;

export const BioEditScreen: React.FC = () => {
  const navigation = useNavigation<BioEditNavigationProp>();
  const route = useRoute<BioEditRouteProp>();
  
  const { initialBio, onBioChange } = route.params;
  
  const [bio, setBio] = useState(initialBio);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    setIsDirty(bio !== initialBio);
  }, [bio, initialBio]);

  const handleSave = () => {
    if (!isDirty) {
      navigation.goBack();
      return;
    }
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onBioChange(bio);
    navigation.goBack();
  };

  const handleCancel = () => {
    if (isDirty) {
      // Could add a confirmation dialog here
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <DynamicHeader 
        title="Bio"
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />
      
      {/* Save button in header area */}
      <View style={styles.headerSaveContainer}>
        <Button
          mode="text"
          onPress={handleSave}
          disabled={!isDirty}
          labelStyle={[
            styles.saveHeaderButton,
            { color: isDirty ? tokens.colors.primary : tokens.colors.onSurface38 }
          ]}
        >
          Save
        </Button>
      </View>
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.instructionContainer}>
            <Text style={styles.instructionTitle}>About you</Text>
            <Text style={styles.instructionText}>
              Write a few words about yourself. This will be visible to your contacts.
            </Text>
          </View>

          <View style={styles.inputContainer}>
            <AnimatedFloatingLabel
              label="Bio"
              value={bio}
              onChangeText={setBio}
              multiline={true}
              maxLength={150}
              style={styles.bioInput}
            />
            
            <View style={styles.characterCountContainer}>
              <Text style={styles.characterCount}>
                {bio.length}/150
              </Text>
            </View>
          </View>

          {/* Bio suggestions */}
          <View style={styles.suggestionsContainer}>
            <Text style={styles.suggestionsTitle}>Suggestions</Text>
            {bioSuggestions.map((suggestion, index) => (
              <Button
                key={index}
                mode="outlined"
                onPress={() => {
                  setBio(suggestion);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                style={styles.suggestionButton}
                labelStyle={styles.suggestionLabel}
                buttonColor="transparent"
                textColor={tokens.colors.onSurface}
              >
                {suggestion}
              </Button>
            ))}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const bioSuggestions = [
  "Available",
  "Busy",
  "At work",
  "Battery about to die",
  "Can't talk, WhatsApp only",
  "In a meeting",
  "At the movies",
  "Only urgent calls",
  "Sleeping",
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.bg,
  },
  headerSaveContainer: {
    position: 'absolute',
    top: tokens.spacing.l,
    right: tokens.spacing.m,
    zIndex: 10,
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
  bioInput: {
    minHeight: 120,
  },
  characterCountContainer: {
    alignItems: 'flex-end',
    marginTop: tokens.spacing.xs,
  },
  characterCount: {
    ...tokens.typography.caption,
    color: tokens.colors.onSurface60,
    fontSize: 12,
  },
  suggestionsContainer: {
    gap: tokens.spacing.s,
  },
  suggestionsTitle: {
    ...tokens.typography.body,
    color: tokens.colors.onSurface,
    fontWeight: '600',
    marginBottom: tokens.spacing.s,
  },
  suggestionButton: {
    borderColor: tokens.colors.surface3,
    borderRadius: tokens.radius.m,
    marginBottom: tokens.spacing.xs,
  },
  suggestionLabel: {
    ...tokens.typography.body,
    textAlign: 'left',
    justifyContent: 'flex-start',
  },
  saveHeaderButton: {
    ...tokens.typography.body,
    fontWeight: '600',
  },
});
