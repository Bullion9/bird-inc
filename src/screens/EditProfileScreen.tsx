import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { Text, Surface, Button } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';

import { tokens } from '../theme/tokens';
import { SettingsStackParamList } from '../navigation/types';
import { MaterialIcon, DynamicHeader, Avatar, AnimatedFloatingLabel } from '../components';

type EditProfileNavigationProp = StackNavigationProp<SettingsStackParamList, 'EditProfile'>;

export const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation<EditProfileNavigationProp>();
  const scrollY = useRef(0);
  const [scrollPosition, setScrollPosition] = React.useState(0);
  
  const [profile, setProfile] = useState({
    name: 'John Doe',
    username: 'johndoe',
    bio: 'Available for chat',
    phoneNumber: '+1 (555) 123-4567',
    avatar: 'https://i.pravatar.cc/150?img=7',
  });

  const [initialProfile] = useState(profile);
  const [isDirty, setIsDirty] = useState(false);

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    scrollY.current = currentScrollY;
    setScrollPosition(currentScrollY);
  }, []);

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
        scrollY={scrollPosition}
        titleSize={20}
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
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
          <Text style={styles.largeTitle}>Edit profile</Text>
        </MotiView>
        
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

        {/* Profile Fields - iOS Style Cards */}
        <View style={styles.fieldsContainer}>
          {/* Personal Info Card */}
          <View style={styles.iosCard}>
            <TouchableOpacity onPress={handleNamePress} style={styles.iosCardItem}>
              <View style={styles.fieldContent}>
                <Text style={styles.fieldLabel}>Name</Text>
                <Text style={[styles.fieldValue, !profile.name && styles.fieldPlaceholder]}>
                  {profile.name || 'Add your name...'}
                </Text>
              </View>
              <MaterialIcon name="chevron_right" size={20} color={tokens.colors.onSurface60} />
            </TouchableOpacity>
            
            <View style={styles.iosCardSeparator} />
            
            <TouchableOpacity onPress={handleUsernamePress} style={styles.iosCardItem}>
              <View style={styles.fieldContent}>
                <Text style={styles.fieldLabel}>Username</Text>
                <Text style={[styles.fieldValue, !profile.username && styles.fieldPlaceholder]}>
                  {profile.username ? `@${profile.username}` : 'Add a username...'}
                </Text>
              </View>
              <MaterialIcon name="chevron_right" size={20} color={tokens.colors.onSurface60} />
            </TouchableOpacity>
            
            <View style={styles.iosCardSeparator} />
            
            <TouchableOpacity onPress={handleBioPress} style={styles.iosCardItem}>
              <View style={styles.fieldContent}>
                <Text style={styles.fieldLabel}>Bio</Text>
                <Text style={[styles.fieldValue, !profile.bio && styles.fieldPlaceholder]} numberOfLines={2}>
                  {profile.bio || 'Add a bio...'}
                </Text>
              </View>
              <MaterialIcon name="chevron_right" size={20} color={tokens.colors.onSurface60} />
            </TouchableOpacity>
          </View>

          {/* Contact Info Card */}
          <View style={styles.iosCard}>
            <TouchableOpacity onPress={handlePhonePress} style={styles.iosCardItem}>
              <View style={styles.fieldContent}>
                <Text style={styles.fieldLabel}>Phone Number</Text>
                <Text style={styles.fieldValue}>
                  {profile.phoneNumber}
                </Text>
              </View>
              <MaterialIcon name="chevron_right" size={20} color={tokens.colors.onSurface60} />
            </TouchableOpacity>
          </View>
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
    paddingTop: 120, // Space for the large title under the header
  },
  largeTitle: {
    ...tokens.typography.h1,
    fontSize: 28, // Reduced from 36 to 28
    fontWeight: '400', // Changed from '700' to '400' (unbold)
    color: tokens.colors.onSurface,
    marginBottom: tokens.spacing.l,
    marginTop: 10, // Changed from -20 to 10 (bring text down)
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
  // iOS-style cards
  iosCard: {
    backgroundColor: tokens.colors.surface1,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  iosCardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    minHeight: 56, // Slightly taller for form fields
  },
  iosCardSeparator: {
    height: 0.5,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginLeft: 16,
  },
  fieldContent: {
    flex: 1,
    marginRight: tokens.spacing.s,
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
    marginBottom: 2,
  },
  fieldValue: {
    ...tokens.typography.body,
    color: tokens.colors.onSurface,
    fontSize: 16,
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
