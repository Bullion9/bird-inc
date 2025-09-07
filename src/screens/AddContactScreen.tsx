import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcon } from '../components/MaterialIcon';
import { DynamicHeader } from '../components/DynamicHeader';
import { tokens } from '../theme/tokens';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';

interface ContactFormData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  company: string;
  notes: string;
}

export function AddContactScreen() {
  const navigation = useNavigation();
  const [contactData, setContactData] = useState<ContactFormData>({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    company: '',
    notes: '',
  });
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const updateField = (field: keyof ContactFormData, value: string) => {
    setContactData(prev => ({ ...prev, [field]: value }));
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Sorry, we need camera roll permissions to select a photo.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Sorry, we need camera permissions to take a photo.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      'Add Photo',
      'Choose how you want to add a photo',
      [
        { text: 'Camera', onPress: takePhoto },
        { text: 'Photo Library', onPress: pickImage },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleSave = () => {
    if (!contactData.firstName.trim() && !contactData.lastName.trim()) {
      Alert.alert('Error', 'Please enter at least a first or last name.');
      return;
    }

    if (!contactData.phoneNumber.trim()) {
      Alert.alert('Error', 'Please enter a phone number.');
      return;
    }

    // Here you would typically save to your contacts database
    Alert.alert(
      'Contact Saved',
      `${contactData.firstName} ${contactData.lastName}`.trim() + ' has been added to your contacts.',
      [
        {
          text: 'OK',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const isFormValid = () => {
    return (contactData.firstName.trim() || contactData.lastName.trim()) && 
           contactData.phoneNumber.trim();
  };

  const renderFormField = (
    label: string,
    field: keyof ContactFormData,
    placeholder: string,
    keyboardType: any = 'default',
    multiline: boolean = false
  ) => (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.textInput, multiline && styles.multilineInput]}
        value={contactData[field]}
        onChangeText={(value) => updateField(field, value)}
        placeholder={placeholder}
        placeholderTextColor={tokens.colors.onSurface38}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <DynamicHeader 
        title="New Contact"
        showBackButton={true}
        onBackPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          navigation.goBack();
        }}
        rightIcons={[
          {
            icon: 'check',
            onPress: handleSave,
          },
        ]}
      />

      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Photo Section */}
          <View style={styles.photoSection}>
            <TouchableOpacity 
              style={styles.photoContainer}
              onPress={showImageOptions}
              activeOpacity={0.7}
            >
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.profileImage} />
              ) : (
                <View style={styles.placeholderPhoto}>
                  <MaterialIcon name="camera_alt" size={32} color={tokens.colors.onSurface38} />
                </View>
              )}
              <View style={styles.photoOverlay}>
                <MaterialIcon name="camera_alt" size={16} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
            <Text style={styles.photoHint}>Add Photo</Text>
          </View>

          {/* Form Fields */}
          <View style={styles.formSection}>
            {renderFormField('First Name', 'firstName', 'Enter first name')}
            {renderFormField('Last Name', 'lastName', 'Enter last name')}
            {renderFormField('Phone', 'phoneNumber', 'Enter phone number', 'phone-pad')}
            {renderFormField('Email', 'email', 'Enter email address', 'email-address')}
            {renderFormField('Company', 'company', 'Enter company name')}
            {renderFormField('Notes', 'notes', 'Add notes about this contact', 'default', true)}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionSection}>
            <TouchableOpacity
              style={[styles.saveButton, !isFormValid() && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={!isFormValid()}
              activeOpacity={0.8}
            >
              <MaterialIcon 
                name="person_add" 
                size={20} 
                color={isFormValid() ? "#FFFFFF" : tokens.colors.onSurface38} 
              />
              <Text style={[styles.saveButtonText, !isFormValid() && styles.saveButtonTextDisabled]}>
                Save Contact
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                navigation.goBack();
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

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
  scrollContent: {
    paddingTop: 100, // Space for header
    paddingHorizontal: tokens.spacing.m,
    paddingBottom: tokens.spacing.xl,
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: tokens.spacing.xl,
  },
  photoContainer: {
    position: 'relative',
    marginBottom: tokens.spacing.s,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  placeholderPhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: tokens.colors.surface1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: tokens.colors.separator,
    borderStyle: 'dashed',
  },
  photoOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: tokens.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: tokens.colors.bg,
  },
  photoHint: {
    ...tokens.typography.body,
    color: tokens.colors.onSurface60,
    textAlign: 'center',
  },
  formSection: {
    marginBottom: tokens.spacing.xl,
  },
  fieldContainer: {
    marginBottom: tokens.spacing.l,
  },
  fieldLabel: {
    ...tokens.typography.body,
    color: tokens.colors.onSurface,
    marginBottom: tokens.spacing.xs,
    fontWeight: '600',
  },
  textInput: {
    ...tokens.typography.body,
    color: tokens.colors.onSurface,
    backgroundColor: tokens.colors.surface1,
    borderRadius: tokens.radius.m,
    paddingHorizontal: tokens.spacing.m,
    paddingVertical: tokens.spacing.s,
    borderWidth: 1,
    borderColor: tokens.colors.separator,
    minHeight: 48,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: tokens.spacing.s,
  },
  actionSection: {
    gap: tokens.spacing.m,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.colors.primary,
    borderRadius: tokens.radius.m,
    paddingVertical: tokens.spacing.m,
    paddingHorizontal: tokens.spacing.l,
    gap: tokens.spacing.s,
  },
  saveButtonDisabled: {
    backgroundColor: tokens.colors.surface1,
  },
  saveButtonText: {
    ...tokens.typography.headline,
    color: "#FFFFFF",
    fontWeight: '600',
  },
  saveButtonTextDisabled: {
    color: tokens.colors.onSurface38,
  },
  cancelButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: tokens.radius.m,
    paddingVertical: tokens.spacing.m,
    paddingHorizontal: tokens.spacing.l,
    borderWidth: 1,
    borderColor: tokens.colors.separator,
  },
  cancelButtonText: {
    ...tokens.typography.headline,
    color: tokens.colors.onSurface60,
    fontWeight: '500',
  },
});
