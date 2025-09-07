import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Surface, Button } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as Haptics from 'expo-haptics';

import { tokens } from '../theme/tokens';
import { RootStackParamList } from '../navigation/types';
import { DynamicHeader, AnimatedFloatingLabel } from '../components';

type ContactBioEditNavigationProp = StackNavigationProp<RootStackParamList, 'ContactBioEdit'>;
type ContactBioEditRouteProp = RouteProp<RootStackParamList, 'ContactBioEdit'>;

export const ContactBioEditScreen: React.FC = () => {
  const navigation = useNavigation<ContactBioEditNavigationProp>();
  const route = useRoute<ContactBioEditRouteProp>();
  
  const { contactName, initialBio, onBioChange } = route.params;
  
  const [bio, setBio] = useState(initialBio || '');
  const [isDirty, setIsDirty] = useState(false);
  const [scrollOffset, setScrollOffset] = useState(0);

  useEffect(() => {
    setIsDirty(bio !== (initialBio || ''));
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
      Alert.alert(
        'Discard Changes?',
        'You have unsaved changes. Are you sure you want to discard them?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => navigation.goBack() }
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  const handleClear = () => {
    Alert.alert(
      'Clear Bio',
      `Remove bio for ${contactName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive', 
          onPress: () => {
            setBio('');
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <DynamicHeader 
        title={`${contactName}'s Bio`}
        showBackButton={true}
        onBackPress={handleCancel}
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
            <Text style={styles.instructionTitle}>Contact Bio</Text>
            <Text style={styles.instructionText}>
              Add a personal note or bio for {contactName}. This will help you remember details about them and is only visible to you.
            </Text>
          </View>

          <View style={styles.inputContainer}>
            <AnimatedFloatingLabel
              label={`Bio for ${contactName}`}
              value={bio}
              onChangeText={setBio}
              multiline={true}
              maxLength={200}
              style={styles.bioInput}
            />
            
            <View style={styles.characterCountContainer}>
              <Text style={styles.characterCount}>
                {bio.length}/200
              </Text>
            </View>
          </View>

          {/* Bio suggestions */}
          <View style={styles.suggestionsContainer}>
            <Text style={styles.suggestionsTitle}>Quick Notes</Text>
            {contactBioSuggestions.map((suggestion, index) => (
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

          {/* Clear Bio Button */}
          {bio.length > 0 && (
            <View style={styles.actionContainer}>
              <Button
                mode="outlined"
                onPress={handleClear}
                style={styles.clearButton}
                labelStyle={styles.clearButtonLabel}
                buttonColor="transparent"
                textColor={tokens.colors.error}
              >
                Clear Bio
              </Button>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const contactBioSuggestions = [
  "Work colleague",
  "Friend from school",
  "Family friend",
  "Neighbor",
  "Met at event",
  "Business contact",
  "Gym buddy",
  "Travel companion",
  "Online friend",
  "Photography enthusiast",
  "Tech professional",
  "Creative artist"
];

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
    marginBottom: tokens.spacing.l,
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
  actionContainer: {
    alignItems: 'center',
    paddingTop: tokens.spacing.m,
  },
  clearButton: {
    borderColor: tokens.colors.error,
    borderRadius: tokens.radius.m,
    minWidth: 120,
  },
  clearButtonLabel: {
    ...tokens.typography.body,
    fontWeight: '600',
  },
});
