import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, Surface, Button } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as Haptics from 'expo-haptics';

import { tokens } from '../theme/tokens';
import { SettingsStackParamList } from '../navigation/types';
import { MaterialIcon, DynamicHeader, Avatar, AnimatedFloatingLabel } from '../components';

type EditProfileNavigationProp = StackNavigationProp<SettingsStackParamList, 'EditProfile'>;

export const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation<EditProfileNavigationProp>();
  
  const [profile, setProfile] = useState({
    name: 'John Doe',
    username: 'johndoe',
    bio: 'Available for chat',
    phoneNumber: '+1 (555) 123-4567',
    avatar: 'https://i.pravatar.cc/150?img=7',
  });

  const [initialProfile] = useState(profile);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    const hasChanges = JSON.stringify(profile) !== JSON.stringify(initialProfile);
    setIsDirty(hasChanges);
  }, [profile, initialProfile]);

  const handleSave = () => {
    if (!isDirty) return;
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // Save profile logic here
    navigation.goBack();
  };

  const handleAvatarPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Open image picker logic here
  };

  const handleNamePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('NameEdit', {
      initialName: profile.name,
      onNameChange: (newName: string) => {
        updateProfile('name', newName);
      },
    });
  };

  const handleUsernamePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('UsernameEdit', {
      initialUsername: profile.username,
      onUsernameChange: (newUsername: string) => {
        updateProfile('username', newUsername);
      },
    });
  };

  const handleBioPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('BioEdit', {
      initialBio: profile.bio,
      onBioChange: (newBio: string) => {
        updateProfile('bio', newBio);
      },
    });
  };

  const handlePhonePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('PhoneNumberView', {
      phoneNumber: profile.phoneNumber,
    });
  };

  const updateProfile = (field: keyof typeof profile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  return (
    <View style={styles.container}>
      <DynamicHeader 
        title="Edit profile"
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar Section */}
        <TouchableOpacity onPress={handleAvatarPress} style={styles.avatarContainer}>
          <Avatar
            source={profile.avatar}
            name={profile.name}
            size={96}
          />
          <View style={styles.cameraOverlay}>
            <MaterialIcon name="photo_camera" size={20} color="#FFFFFF" />
          </View>
          <Text style={styles.avatarLabel}>Tap to change photo</Text>
        </TouchableOpacity>

        {/* Profile Fields */}
        <View style={styles.fieldsContainer}>
          {/* Name Field - Navigates to Name Edit */}
          <TouchableOpacity onPress={handleNamePress} style={styles.fieldTouchable}>
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Name</Text>
              <Text style={[styles.fieldValue, !profile.name && styles.fieldPlaceholder]}>
                {profile.name || 'Add your name...'}
              </Text>
              <MaterialIcon name="chevron_right" size={20} color={tokens.colors.onSurface60} />
            </View>
          </TouchableOpacity>

          {/* Username Field - Navigates to Username Edit */}
          <TouchableOpacity onPress={handleUsernamePress} style={styles.fieldTouchable}>
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Username</Text>
              <Text style={[styles.fieldValue, !profile.username && styles.fieldPlaceholder]}>
                {profile.username ? `@${profile.username}` : 'Add a username...'}
              </Text>
              <MaterialIcon name="chevron_right" size={20} color={tokens.colors.onSurface60} />
            </View>
          </TouchableOpacity>

          {/* Bio Field - Navigates to Bio Edit */}
          <TouchableOpacity onPress={handleBioPress} style={styles.fieldTouchable}>
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Bio</Text>
              <Text style={[styles.fieldValue, !profile.bio && styles.fieldPlaceholder]} numberOfLines={2}>
                {profile.bio || 'Add a bio...'}
              </Text>
              <MaterialIcon name="chevron_right" size={20} color={tokens.colors.onSurface60} />
            </View>
          </TouchableOpacity>

          {/* Phone Number - Read Only, navigates to view */}
          <TouchableOpacity onPress={handlePhonePress} style={styles.fieldTouchable}>
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Phone Number</Text>
              <Text style={styles.fieldValue}>
                {profile.phoneNumber}
              </Text>
              <MaterialIcon name="chevron_right" size={20} color={tokens.colors.onSurface60} />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Sticky Save Button */}
      <View style={styles.stickyFooter}>
        <Button
          mode="contained"
          onPress={handleSave}
          disabled={!isDirty}
          style={[styles.saveButton, !isDirty && styles.saveButtonDisabled]}
          contentStyle={styles.saveButtonContent}
          labelStyle={styles.saveButtonLabel}
          buttonColor={isDirty ? tokens.colors.primary : tokens.colors.surface3}
        >
          Save Changes
        </Button>
      </View>
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
  content: {
    padding: tokens.spacing.m,
    paddingBottom: 100, // Space for sticky footer
  },
  avatarContainer: {
    alignItems: 'center',
    marginVertical: tokens.spacing.xl,
    position: 'relative',
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: tokens.spacing.l,
    right: '50%',
    transform: [{ translateX: 32 }], // Half of avatar width (96/2) + overlay position
    backgroundColor: tokens.colors.primary,
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: tokens.colors.bg,
  },
  avatarLabel: {
    ...tokens.typography.caption,
    color: tokens.colors.onSurface60,
    marginTop: tokens.spacing.s,
  },
  fieldsContainer: {
    gap: tokens.spacing.m,
  },
  fieldTouchable: {
    borderRadius: tokens.radius.s,
    borderWidth: 1,
    borderColor: tokens.colors.surface3,
    padding: tokens.spacing.m,
    backgroundColor: 'transparent',
  },
  fieldContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 40,
  },
  fieldLabel: {
    ...tokens.typography.caption,
    color: tokens.colors.onSurface60,
    fontSize: 12,
    position: 'absolute',
    top: -tokens.spacing.s,
    left: 0,
  },
  fieldValue: {
    ...tokens.typography.body,
    color: tokens.colors.onSurface,
    flex: 1,
    marginTop: tokens.spacing.xs,
    marginRight: tokens.spacing.s,
  },
  fieldPlaceholder: {
    color: tokens.colors.onSurface38,
  },
  stickyFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: tokens.colors.bg,
    borderTopWidth: 1,
    borderTopColor: tokens.colors.surface2,
    paddingHorizontal: tokens.spacing.m,
    paddingVertical: tokens.spacing.m,
    paddingBottom: tokens.spacing.l,
  },
  saveButton: {
    borderRadius: tokens.radius.m,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonContent: {
    paddingVertical: tokens.spacing.xs,
  },
  saveButtonLabel: {
    ...tokens.typography.body,
    fontWeight: '600',
  },
});
