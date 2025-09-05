import React, { useState, useRef, useCallback } from 'react';
import { View, StyleSheet, ScrollView, NativeScrollEvent, NativeSyntheticEvent, TouchableOpacity } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { MotiView } from 'moti';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import CountryPicker, { Country, CountryCode } from 'react-native-country-picker-modal';
import { tokens } from '../theme/tokens';
import { RootStackParamList } from '../navigation/types';
import { DynamicHeader, AnimatedFloatingLabel } from '../components';

type PhoneAuthNavigationProp = StackNavigationProp<RootStackParamList, 'PhoneAuth'>;

export const PhoneAuthScreen: React.FC = () => {
  const navigation = useNavigation<PhoneAuthNavigationProp>();
  const scrollYRef = useRef(0);
  const [scrollPosition, setScrollPosition] = React.useState(0);
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState<CountryCode>('US');
  const [callingCode, setCallingCode] = useState('1');
  const [country, setCountry] = useState<Country | null>(null);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    scrollYRef.current = currentScrollY;
    setScrollPosition(currentScrollY);
  }, []);

  const onSelectCountry = (selectedCountry: Country) => {
    setCountryCode(selectedCountry.cca2);
    setCallingCode(selectedCountry.callingCode[0]);
    setCountry(selectedCountry);
    setShowCountryPicker(false);
  };

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
        scrollY={scrollPosition}
      />

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
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
          <Text style={styles.largeTitle}>
            {step === 'phone' ? 'Enter Phone Number' : 'Verify Code'}
          </Text>
        </MotiView>
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
              <TouchableOpacity 
                style={styles.countryCodeContainer}
                onPress={() => setShowCountryPicker(true)}
              >
                <View style={styles.countryPickerButton}>
                  <CountryPicker
                    countryCode={countryCode}
                    withFilter
                    withFlag
                    withCallingCode
                    withAlphaFilter
                    onSelect={onSelectCountry}
                    visible={showCountryPicker}
                    onClose={() => setShowCountryPicker(false)}
                  />
                  <Text style={styles.callingCodeText} numberOfLines={1} adjustsFontSizeToFit>
                    +{callingCode}
                  </Text>
                  <Text style={styles.dropdownArrow}>▼</Text>
                </View>
              </TouchableOpacity>
              
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
              Enter the 6-digit code sent to +{callingCode} {phoneNumber}
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
    paddingTop: 120, // Space for the large title under the header
  },
  largeTitle: {
    ...tokens.typography.h1,
    fontSize: 28,
    fontWeight: '600',
    color: tokens.colors.onSurface,
    marginBottom: tokens.spacing.l,
    textAlign: 'center',
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
    alignItems: 'flex-start',
  },
  countryCodeContainer: {
    minWidth: 120,
    maxWidth: 150,
    marginRight: tokens.spacing.m,
  },
  countryPickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.surface1,
    borderRadius: tokens.radius.m,
    paddingHorizontal: tokens.spacing.m,
    paddingVertical: tokens.spacing.l,
    borderWidth: 1,
    borderColor: tokens.colors.surface2,
    minHeight: 56,
    flex: 1,
  },
  callingCodeText: {
    ...tokens.typography.body,
    color: tokens.colors.onSurface,
    marginLeft: tokens.spacing.s,
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  dropdownArrow: {
    ...tokens.typography.caption,
    color: tokens.colors.onSurface60,
    fontSize: 14,
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
