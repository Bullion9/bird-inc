import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';

import { tokens } from '../theme/tokens';
import { SettingsStackParamList } from '../navigation/types';
import { DynamicHeader, MaterialIcon, BirdCard } from '../components';

type PhoneNumberViewNavigationProp = StackNavigationProp<SettingsStackParamList, 'PhoneNumberView'>;
type PhoneNumberViewRouteProp = RouteProp<SettingsStackParamList, 'PhoneNumberView'>;

export const PhoneNumberViewScreen: React.FC = () => {
  const navigation = useNavigation<PhoneNumberViewNavigationProp>();
  const route = useRoute<PhoneNumberViewRouteProp>();
  
  const { phoneNumber } = route.params;
  const [scrollOffset, setScrollOffset] = useState(0);

  // iOS-style icon background colors
  const getIconBackgroundColor = (iconName: string): string => {
    const iconBackgrounds: { [key: string]: string } = {
      phone: '#34C759',           // Green for phone
      lock: '#8E8E93',            // Gray for lock/security
      check_circle: '#34C759',    // Green for success/verified
      notifications: '#FF9500',   // Orange for notifications
    };
    return iconBackgrounds[iconName] || '#007AFF';
  };

  const handleChangeNumber = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // This would typically navigate to a verification flow
    // For now, just show haptic feedback
  };

  return (
    <View style={styles.container}>
      <DynamicHeader 
        title="Phone number"
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
        <View style={styles.instructionContainer}>
          <Text style={styles.instructionTitle}>Your phone number</Text>
          <Text style={styles.instructionText}>
            This is the phone number associated with your Bird account.
          </Text>
        </View>

        {/* Current Phone Number */}
        <BirdCard style={styles.phoneCard}>
          <View style={styles.phoneContainer}>
            <View style={[styles.phoneIconContainer, { backgroundColor: getIconBackgroundColor('phone') }]}>
              <MaterialIcon name="phone" size={24} color="#FFFFFF" />
            </View>
            <View style={styles.phoneDetails}>
              <Text style={styles.phoneLabel}>Current number</Text>
              <Text style={styles.phoneNumber}>{phoneNumber}</Text>
            </View>
            <View style={[styles.lockIconContainer, { backgroundColor: getIconBackgroundColor('lock') }]}>
              <MaterialIcon name="lock" size={20} color="#FFFFFF" />
            </View>
          </View>
        </BirdCard>

        {/* Information Section */}
        <View style={styles.infoSection}>
          <View style={styles.infoItem}>
            <View style={[styles.infoIconContainer, { backgroundColor: getIconBackgroundColor('check_circle') }]}>
              <MaterialIcon name="check_circle" size={20} color="#FFFFFF" />
            </View>
            <Text style={styles.infoText}>Verified and secure</Text>
          </View>
          
          <View style={styles.infoItem}>
            <View style={[styles.infoIconContainer, { backgroundColor: getIconBackgroundColor('notifications') }]}>
              <MaterialIcon name="notifications" size={20} color="#FFFFFF" />
            </View>
            <Text style={styles.infoText}>Used for notifications and security</Text>
          </View>
          
          <View style={styles.infoItem}>
            <View style={[styles.infoIconContainer, { backgroundColor: getIconBackgroundColor('lock') }]}>
              <MaterialIcon name="lock" size={20} color="#FFFFFF" />
            </View>
            <Text style={styles.infoText}>Hidden from other users</Text>
          </View>
        </View>

        {/* Change Number Section */}
        <View style={styles.changeSection}>
          <Text style={styles.changeSectionTitle}>Need to change your number?</Text>
          <Text style={styles.changeSectionText}>
            Changing your phone number will require verification and may affect your account security.
          </Text>
          
          <Button
            mode="outlined"
            onPress={handleChangeNumber}
            style={styles.changeButton}
            contentStyle={styles.changeButtonContent}
            labelStyle={styles.changeButtonLabel}
            buttonColor="transparent"
            textColor={tokens.colors.primary}
          >
            Change Phone Number
          </Button>
        </View>

        {/* Security Note */}
        <View style={styles.securityNote}>
          <View style={styles.securityNoteHeader}>
            <View style={[styles.securityIconContainer, { backgroundColor: getIconBackgroundColor('lock') }]}>
              <MaterialIcon name="lock" size={16} color="#FFFFFF" />
            </View>
            <Text style={styles.securityNoteTitle}>Security Note</Text>
          </View>
          <Text style={styles.securityNoteText}>
            Your phone number is encrypted and securely stored. We never share it with other users or third parties.
          </Text>
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
  phoneCard: {
    marginBottom: tokens.spacing.l,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.m,
  },
  phoneIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  phoneDetails: {
    flex: 1,
    gap: tokens.spacing.xs,
  },
  phoneLabel: {
    ...tokens.typography.caption,
    color: tokens.colors.onSurface60,
  },
  phoneNumber: {
    ...tokens.typography.body,
    color: tokens.colors.onSurface,
    fontWeight: '600',
    fontSize: 12,
  },
  lockIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoSection: {
    gap: tokens.spacing.m,
    marginBottom: tokens.spacing.l,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.s,
  },
  infoIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoText: {
    ...tokens.typography.body,
    color: tokens.colors.onSurface,
    flex: 1,
  },
  changeSection: {
    marginBottom: tokens.spacing.l,
    gap: tokens.spacing.s,
  },
  changeSectionTitle: {
    ...tokens.typography.body,
    color: tokens.colors.onSurface,
    fontWeight: '600',
    marginBottom: tokens.spacing.s,
  },
  changeSectionText: {
    ...tokens.typography.caption,
    color: tokens.colors.onSurface60,
    lineHeight: 18,
    marginBottom: tokens.spacing.m,
  },
  changeButton: {
    borderColor: tokens.colors.primary,
    borderRadius: tokens.radius.m,
  },
  changeButtonContent: {
    paddingVertical: tokens.spacing.xs,
  },
  changeButtonLabel: {
    ...tokens.typography.body,
    fontWeight: '600',
  },
  securityNote: {
    padding: tokens.spacing.m,
    backgroundColor: tokens.colors.surface2,
    borderRadius: tokens.radius.m,
    gap: tokens.spacing.s,
  },
  securityNoteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.s,
  },
  securityIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  securityNoteTitle: {
    ...tokens.typography.caption,
    color: tokens.colors.onSurface60,
    fontWeight: '600',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  securityNoteText: {
    ...tokens.typography.caption,
    color: tokens.colors.onSurface60,
    lineHeight: 16,
  },
});
