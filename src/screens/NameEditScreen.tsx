import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Surface, Button } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as Haptics from 'expo-haptics';

import { tokens } from '../theme/tokens';
import { SettingsStackParamList } from '../navigation/types';
import { DynamicHeader, AnimatedFloatingLabel } from '../components';

type NameEditNavigationProp = StackNavigationProp<SettingsStackParamList, 'NameEdit'>;
type NameEditRouteProp = RouteProp<SettingsStackParamList, 'NameEdit'>;

export const NameEditScreen: React.FC = () => {
  const navigation = useNavigation<NameEditNavigationProp>();
  const route = useRoute<NameEditRouteProp>();
  
  const { initialName, onNameChange } = route.params;
  
  const [name, setName] = useState(initialName);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    setIsDirty(name !== initialName && name.trim().length > 0);
  }, [name, initialName]);

  const handleSave = () => {
    if (!isDirty || name.trim().length === 0) {
      navigation.goBack();
      return;
    }
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onNameChange(name.trim());
    navigation.goBack();
  };

  const handleCancel = () => {
    if (isDirty) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <DynamicHeader 
        title="Name"
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
            <Text style={styles.instructionTitle}>Your name</Text>
            <Text style={styles.instructionText}>
              This name will be visible to your contacts in Bird.
            </Text>
          </View>

          <View style={styles.inputContainer}>
            <AnimatedFloatingLabel
              label="Name"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              maxLength={50}
            />
            
            <View style={styles.characterCountContainer}>
              <Text style={styles.characterCount}>
                {name.length}/50
              </Text>
            </View>
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              • Use your real name so people can recognize you
            </Text>
            <Text style={styles.infoText}>
              • You can change your name anytime
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
  characterCountContainer: {
    alignItems: 'flex-end',
    marginTop: tokens.spacing.xs,
  },
  characterCount: {
    ...tokens.typography.caption,
    color: tokens.colors.onSurface60,
    fontSize: 12,
  },
  infoContainer: {
    gap: tokens.spacing.s,
  },
  infoText: {
    ...tokens.typography.caption,
    color: tokens.colors.onSurface60,
    lineHeight: 18,
  },
  saveHeaderButton: {
    ...tokens.typography.body,
    fontWeight: '600',
  },
});
