import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { MotiView } from 'moti';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { tokens } from '../theme/tokens';
import { RootStackParamList } from '../navigation/types';
import { DynamicHeader, AnimatedFloatingLabel } from '../components';

type PhoneAuthNavigationProp = StackNavigationProp<RootStackParamList, 'PhoneAuth'>;

export const PhoneAuthScreen: React.FC = () => {
  const navigation = useNavigation<PhoneAuthNavigationProp>();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+1');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async () => {
    if (!phoneNumber) return;
    
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setStep('otp');
    }, 1500);
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length < 6) return;
    
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      navigation.replace('ProfileCreate');
    }, 1500);
  };

  const handleBack = () => {
    if (step === 'otp') {
      setStep('phone');
    } else {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <DynamicHeader
        title={step === 'phone' ? 'Enter Phone Number' : 'Verify Code'}
        showBackButton
        onBackPress={handleBack}
      />

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        {step === 'phone' ? (
          <MotiView
            from={{ opacity: 0, translateX: -20 }}
            animate={{ opacity: 1, translateX: 0 }}
            transition={{ type: 'timing', duration: 300 }}
          >
            <Text style={styles.description}>
              We'll send you a verification code to confirm your phone number
            </Text>

            <View style={styles.phoneContainer}>
              <View style={styles.countryCodeContainer}>
                <AnimatedFloatingLabel
                  label="Country"
                  value={countryCode}
                  onChangeText={setCountryCode}
                  keyboardType="phone-pad"
                />
              </View>
              
              <View style={styles.phoneNumberContainer}>
                <AnimatedFloatingLabel
                  label="Phone Number"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            <Button
              mode="contained"
              onPress={handleSendOTP}
              loading={loading}
              disabled={!phoneNumber || loading}
              buttonColor={tokens.colors.primary}
              style={styles.button}
              contentStyle={styles.buttonContent}
            >
              Send Verification Code
            </Button>
          </MotiView>
        ) : (
          <MotiView
            from={{ opacity: 0, translateX: 20 }}
            animate={{ opacity: 1, translateX: 0 }}
            transition={{ type: 'timing', duration: 300 }}
          >
            <Text style={styles.description}>
              Enter the 6-digit code sent to {countryCode} {phoneNumber}
            </Text>

            <AnimatedFloatingLabel
              label="Verification Code"
              value={otp}
              onChangeText={setOtp}
              keyboardType="numeric"
              autoCapitalize="none"
            />

            <Button
              mode="contained"
              onPress={handleVerifyOTP}
              loading={loading}
              disabled={otp.length < 6 || loading}
              buttonColor={tokens.colors.primary}
              style={styles.button}
              contentStyle={styles.buttonContent}
            >
              Verify & Continue
            </Button>

            <Button
              mode="text"
              onPress={() => setStep('phone')}
              textColor={tokens.colors.onSurface60}
              style={styles.resendButton}
            >
              Didn't receive code? Resend
            </Button>
          </MotiView>
        )}
      </ScrollView>
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
    paddingTop: tokens.spacing.l,
  },
  description: {
    ...tokens.typography.body,
    color: tokens.colors.onSurface60,
    textAlign: 'center',
    marginBottom: tokens.spacing.xl,
    lineHeight: 22,
  },
  phoneContainer: {
    flexDirection: 'row',
    marginBottom: tokens.spacing.xl,
  },
  countryCodeContainer: {
    width: 100,
    marginRight: tokens.spacing.m,
  },
  phoneNumberContainer: {
    flex: 1,
  },
  button: {
    borderRadius: tokens.radius.m,
    marginBottom: tokens.spacing.m,
  },
  buttonContent: {
    paddingVertical: tokens.spacing.s,
  },
  resendButton: {
    marginTop: tokens.spacing.m,
  },
});
