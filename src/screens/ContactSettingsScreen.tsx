import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as Haptics from 'expo-haptics';

import { tokens } from '../theme/tokens';
import { SettingsStackParamList } from '../navigation/types';
import { DynamicHeader, MaterialIcon } from '../components';

type ContactSettingsNavigationProp = StackNavigationProp<SettingsStackParamList, 'ContactSettings'>;

export const ContactSettingsScreen: React.FC = () => {
  const navigation = useNavigation<ContactSettingsNavigationProp>();
  const [scrollOffset, setScrollOffset] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry',
    message: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    Alert.alert(
      'Message Sent',
      'Thank you for contacting us! We\'ll get back to you soon.',
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  };

  const handleActionPress = (action: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    switch (action) {
      case 'email':
        console.log('Open email: support@birdchat.com');
        break;
      case 'website':
        console.log('Open website: https://birdchat.com');
        break;
      case 'twitter':
        console.log('Open Twitter: @birdchat');
        break;
      case 'facebook':
        console.log('Open Facebook: /birdchat');
        break;
      default:
        console.log(`Action pressed: ${action}`);
    }
  };

  const subjectOptions = [
    'General Inquiry',
    'Bug Report',
    'Feature Request',
    'Account Issues',
    'Privacy Concerns',
    'Billing Support',
    'Other'
  ];

  return (
    <View style={styles.container}>
      <DynamicHeader 
        title="Contact Us"
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
        scrollY={scrollOffset}
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        onScroll={(event) => {
          setScrollOffset(event.nativeEvent.contentOffset.y);
        }}
        scrollEventThrottle={16}
      >
        {/* Contact Form */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Send us a message</Text>
          <View style={styles.cardGroup}>
            {/* Name Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Name *</Text>
              <TextInput
                style={styles.textInput}
                value={formData.name}
                onChangeText={(value) => handleInputChange('name', value)}
                placeholder="Your full name"
                placeholderTextColor={tokens.colors.onSurface38}
              />
            </View>
            
            <View style={styles.separator} />
            
            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email *</Text>
              <TextInput
                style={styles.textInput}
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                placeholder="your.email@example.com"
                placeholderTextColor={tokens.colors.onSurface38}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            
            <View style={styles.separator} />
            
            {/* Subject Selector */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Subject</Text>
              <View style={styles.subjectContainer}>
                <Text style={styles.subjectText}>{formData.subject}</Text>
                <MaterialIcon 
                  name="chevron-down" 
                  size={20} 
                  color={tokens.colors.onSurface60}
                />
              </View>
            </View>
            
            <View style={styles.separator} />
            
            {/* Message Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Message *</Text>
              <TextInput
                style={[styles.textInput, styles.messageInput]}
                value={formData.message}
                onChangeText={(value) => handleInputChange('message', value)}
                placeholder="Tell us how we can help you..."
                placeholderTextColor={tokens.colors.onSurface38}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
            </View>
          </View>
          
          {/* Submit Button */}
          <TouchableOpacity 
            style={styles.submitButton}
            onPress={handleSubmit}
            activeOpacity={0.7}
          >
            <Text style={styles.submitButtonText}>Send Message</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Contact Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Other ways to reach us</Text>
          <View style={styles.cardGroup}>
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => handleActionPress('email')}
              activeOpacity={0.7}
            >
              <View style={styles.settingItemLeft}>
                <View style={styles.iconContainer}>
                  <MaterialIcon name="email" size={20} color="#FFFFFF" />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Email Support</Text>
                  <Text style={styles.settingSubtitle}>support@birdchat.com</Text>
                </View>
              </View>
              <MaterialIcon 
                name="chevron_right" 
                size={20} 
                color={tokens.colors.onSurface60} 
              />
            </TouchableOpacity>
            
            <View style={styles.separator} />
            
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => handleActionPress('website')}
              activeOpacity={0.7}
            >
              <View style={styles.settingItemLeft}>
                <View style={styles.iconContainer}>
                  <MaterialIcon name="web" size={20} color="#FFFFFF" />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Visit Our Website</Text>
                  <Text style={styles.settingSubtitle}>birdchat.com</Text>
                </View>
              </View>
              <MaterialIcon 
                name="chevron_right" 
                size={20} 
                color={tokens.colors.onSurface60} 
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Social Media */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Follow us</Text>
          <View style={styles.cardGroup}>
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => handleActionPress('twitter')}
              activeOpacity={0.7}
            >
              <View style={styles.settingItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: '#1DA1F2' }]}>
                  <Text style={styles.socialIcon}>𝕏</Text>
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Twitter</Text>
                  <Text style={styles.settingSubtitle}>@birdchat</Text>
                </View>
              </View>
              <MaterialIcon 
                name="chevron_right" 
                size={20} 
                color={tokens.colors.onSurface60} 
              />
            </TouchableOpacity>
            
            <View style={styles.separator} />
            
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => handleActionPress('facebook')}
              activeOpacity={0.7}
            >
              <View style={styles.settingItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: '#1877F2' }]}>
                  <Text style={styles.socialIcon}>f</Text>
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Facebook</Text>
                  <Text style={styles.settingSubtitle}>facebook.com/birdchat</Text>
                </View>
              </View>
              <MaterialIcon 
                name="chevron_right" 
                size={20} 
                color={tokens.colors.onSurface60} 
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Contact Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Business Information</Text>
          <View style={styles.cardGroup}>
            <View style={styles.infoItem}>
              <View style={styles.settingItemLeft}>
                <View style={styles.iconContainer}>
                  <MaterialIcon name="office-building" size={20} color="#FFFFFF" />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Bird Inc.</Text>
                  <Text style={styles.settingSubtitle}>123 Tech Street, San Francisco, CA 94105</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.separator} />
            
            <View style={styles.infoItem}>
              <View style={styles.settingItemLeft}>
                <View style={styles.iconContainer}>
                  <MaterialIcon name="clock-outline" size={20} color="#FFFFFF" />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Support Hours</Text>
                  <Text style={styles.settingSubtitle}>Monday - Friday, 9 AM - 6 PM PST</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
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
  content: {
    padding: tokens.spacing.m,
    paddingTop: 100, // Space for header
    paddingBottom: tokens.spacing.xl,
  },
  section: {
    marginBottom: tokens.spacing.xl,
  },
  sectionTitle: {
    ...tokens.typography.caption,
    color: tokens.colors.onSurface60,
    textTransform: 'uppercase',
    fontWeight: '600',
    fontSize: 12,
    marginBottom: tokens.spacing.m,
    marginLeft: tokens.spacing.xs,
  },
  cardGroup: {
    backgroundColor: tokens.colors.cardBackground,
    borderRadius: tokens.radius.m,
    marginHorizontal: tokens.spacing.xs,
    overflow: 'hidden',
    ...tokens.elevation.small,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: tokens.spacing.m,
    paddingHorizontal: tokens.spacing.m,
    minHeight: 56,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: tokens.spacing.m,
    paddingHorizontal: tokens.spacing.m,
    minHeight: 56,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: tokens.spacing.m,
  },
  iconContainer: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: tokens.colors.primary,
  },
  settingTextContainer: {
    flex: 1,
    gap: tokens.spacing.xs / 2,
  },
  settingTitle: {
    ...tokens.typography.body,
    color: tokens.colors.onSurface,
    fontWeight: '500',
  },
  settingSubtitle: {
    ...tokens.typography.caption,
    color: tokens.colors.onSurface60,
    fontSize: 12,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: tokens.colors.surface3,
    marginLeft: 52, // Align with text after icon
  },
  // Form styles
  inputContainer: {
    paddingVertical: tokens.spacing.m,
    paddingHorizontal: tokens.spacing.m,
  },
  inputLabel: {
    ...tokens.typography.caption,
    color: tokens.colors.onSurface60,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: tokens.spacing.xs,
  },
  textInput: {
    ...tokens.typography.body,
    color: tokens.colors.onSurface,
    fontSize: 16,
    paddingVertical: tokens.spacing.xs,
    paddingHorizontal: 0,
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  messageInput: {
    minHeight: 120,
    maxHeight: 200,
  },
  subjectContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: tokens.spacing.xs,
  },
  subjectText: {
    ...tokens.typography.body,
    color: tokens.colors.onSurface,
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: tokens.colors.primary,
    borderRadius: tokens.radius.m,
    paddingVertical: tokens.spacing.m,
    paddingHorizontal: tokens.spacing.l,
    marginHorizontal: tokens.spacing.xs,
    marginTop: tokens.spacing.m,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  submitButtonText: {
    ...tokens.typography.body,
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  socialIcon: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
