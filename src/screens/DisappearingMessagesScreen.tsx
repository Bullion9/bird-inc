import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { Text } from 'react-native-paper';
import { MotiView } from 'moti';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as Haptics from 'expo-haptics';

import { tokens } from '../theme/tokens';
import { SettingsStackParamList } from '../navigation/types';
import { DynamicHeader, MaterialIcon } from '../components';

type DisappearingMessagesNavigationProp = StackNavigationProp<SettingsStackParamList, 'DisappearingMessages'>;

interface TimerOption {
  id: string;
  label: string;
  value: number; // in seconds
  description: string;
}

export const DisappearingMessagesScreen: React.FC = () => {
  const navigation = useNavigation<DisappearingMessagesNavigationProp>();
  const [scrollOffset, setScrollOffset] = useState(0);
  
  // Settings state
  const [isEnabled, setIsEnabled] = useState(false);
  const [selectedTimer, setSelectedTimer] = useState<string>('off');
  const [defaultTimer, setDefaultTimer] = useState<string>('1h');

  const timerOptions: TimerOption[] = [
    { id: 'off', label: 'Off', value: 0, description: 'Messages will not disappear' },
    { id: '5s', label: '5 seconds', value: 5, description: 'Messages disappear after 5 seconds' },
    { id: '30s', label: '30 seconds', value: 30, description: 'Messages disappear after 30 seconds' },
    { id: '1m', label: '1 minute', value: 60, description: 'Messages disappear after 1 minute' },
    { id: '5m', label: '5 minutes', value: 300, description: 'Messages disappear after 5 minutes' },
    { id: '30m', label: '30 minutes', value: 1800, description: 'Messages disappear after 30 minutes' },
    { id: '1h', label: '1 hour', value: 3600, description: 'Messages disappear after 1 hour' },
    { id: '6h', label: '6 hours', value: 21600, description: 'Messages disappear after 6 hours' },
    { id: '24h', label: '24 hours', value: 86400, description: 'Messages disappear after 24 hours' },
    { id: '7d', label: '7 days', value: 604800, description: 'Messages disappear after 7 days' },
  ];

  const handleToggleDisappearing = (value: boolean) => {
    setIsEnabled(value);
    if (value && selectedTimer === 'off') {
      setSelectedTimer(defaultTimer);
    } else if (!value) {
      setSelectedTimer('off');
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSelectTimer = (timerId: string) => {
    setSelectedTimer(timerId);
    if (timerId !== 'off') {
      setIsEnabled(true);
      setDefaultTimer(timerId);
    } else {
      setIsEnabled(false);
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const getIconForTimer = (timerId: string): string => {
    switch (timerId) {
      case 'off': return 'timer_off';
      case '5s':
      case '30s': return 'timer_3';
      case '1m':
      case '5m': return 'timer_10';
      case '30m':
      case '1h': return 'timer';
      case '6h':
      case '24h': return 'schedule';
      case '7d': return 'today';
      default: return 'timer';
    }
  };

  const getIconBackgroundColor = (timerId: string): string => {
    if (timerId === 'off') return '#8E8E93'; // iOS Gray
    if (selectedTimer === timerId) return '#007AFF'; // iOS Blue for selected
    return 'rgba(255, 255, 255, 0.2)'; // Muted for unselected
  };

  const renderTimerOption = (option: TimerOption, index: number) => (
    <MotiView
      key={option.id}
      from={{ opacity: 0, translateX: -20 }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{ type: 'timing', duration: 300, delay: index * 50 }}
    >
      <TouchableOpacity
        style={[
          styles.timerOption,
          selectedTimer === option.id && styles.selectedOption
        ]}
        onPress={() => handleSelectTimer(option.id)}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor(option.id) }]}>
          <MaterialIcon name={getIconForTimer(option.id)} size={20} color="#FFFFFF" />
        </View>
        
        <View style={styles.timerContent}>
          <Text style={[
            styles.timerLabel,
            selectedTimer === option.id && styles.selectedLabel
          ]}>
            {option.label}
          </Text>
          <Text style={styles.timerDescription}>{option.description}</Text>
        </View>
        
        {selectedTimer === option.id && (
          <MaterialIcon name="check" size={20} color={tokens.colors.primary} />
        )}
      </TouchableOpacity>
      {index < timerOptions.length - 1 && <View style={styles.separator} />}
    </MotiView>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <DynamicHeader
        title="Disappearing Messages"
        scrollY={scrollOffset}
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
        titleSize={18}
        rightIcons={[
          {
            icon: 'info',
            onPress: () => {
              Alert.alert(
                'About Disappearing Messages',
                'Disappearing messages are automatically deleted from both your device and the recipient\'s device after the set time period. This helps protect your privacy and saves storage space.\n\nNote: Recipients can still take screenshots or save media before messages disappear.',
                [{ text: 'OK' }]
              );
            }
          }
        ]}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        onScroll={(event) => setScrollOffset(event.nativeEvent.contentOffset.y)}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Toggle */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 300 }}
          style={styles.section}
        >
          <View style={styles.mainToggleCard}>
            <View style={styles.mainToggleContent}>
              <View style={styles.mainToggleLeft}>
                <View style={[styles.iconContainer, { backgroundColor: isEnabled ? '#007AFF' : '#8E8E93' }]}>
                  <MaterialIcon name={isEnabled ? 'auto_delete' : 'timer_off'} size={24} color="#FFFFFF" />
                </View>
                <View style={styles.mainToggleText}>
                  <Text style={styles.mainToggleTitle}>Disappearing Messages</Text>
                  <Text style={styles.mainToggleSubtitle}>
                    {isEnabled ? `${timerOptions.find(t => t.id === selectedTimer)?.label} timer` : 'Disabled'}
                  </Text>
                </View>
              </View>
              <Switch
                value={isEnabled}
                onValueChange={handleToggleDisappearing}
                trackColor={{ false: 'rgba(255, 255, 255, 0.1)', true: tokens.colors.primary }}
                thumbColor="#FFFFFF"
                ios_backgroundColor="rgba(255, 255, 255, 0.1)"
              />
            </View>
          </View>
        </MotiView>

        {/* Timer Options */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 300, delay: 100 }}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>Timer Options</Text>
          <View style={styles.sectionContent}>
            {timerOptions.map((option, index) => renderTimerOption(option, index))}
          </View>
        </MotiView>

        {/* Default Timer */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 300, delay: 200 }}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>Default for New Chats</Text>
          <View style={styles.defaultTimerCard}>
            <View style={styles.defaultTimerContent}>
              <View style={styles.defaultTimerLeft}>
                <View style={[styles.iconContainer, { backgroundColor: '#34C759' }]}>
                  <MaterialIcon name="chat" size={20} color="#FFFFFF" />
                </View>
                <View style={styles.defaultTimerText}>
                  <Text style={styles.defaultTimerTitle}>Default Timer</Text>
                  <Text style={styles.defaultTimerSubtitle}>
                    {timerOptions.find(t => t.id === defaultTimer)?.label}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.changeButton}
                onPress={() => {
                  Alert.alert(
                    'Default Timer',
                    'Select the default timer for new chats',
                    timerOptions.filter(t => t.id !== 'off').map(option => ({
                      text: option.label,
                      onPress: () => {
                        setDefaultTimer(option.id);
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }
                    })).concat([{ text: 'Cancel', onPress: () => {} }])
                  );
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.changeButtonText}>Change</Text>
              </TouchableOpacity>
            </View>
          </View>
        </MotiView>
        
        {/* Warning */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', duration: 300, delay: 400 }}
          style={styles.footer}
        >
          <View style={styles.warningCard}>
            <MaterialIcon name="warning" size={20} color="#FF9500" />
            <Text style={styles.warningText}>
              Recipients can still take screenshots or save media before messages disappear. 
              Disappearing messages don't prevent forwarding or copying text.
            </Text>
          </View>
        </MotiView>
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
  scrollContent: {
    paddingTop: 100, // Space for header
    paddingHorizontal: tokens.spacing.m,
    paddingBottom: tokens.spacing.xl,
  },
  section: {
    marginBottom: tokens.spacing.l,
  },
  sectionTitle: {
    ...tokens.typography.h3,
    color: tokens.colors.onSurface,
    marginBottom: tokens.spacing.s,
    fontWeight: '600',
  },
  sectionContent: {
    backgroundColor: tokens.colors.surface1,
    borderRadius: tokens.radius.m,
    overflow: 'hidden',
  },
  mainToggleCard: {
    backgroundColor: tokens.colors.surface1,
    borderRadius: tokens.radius.m,
    padding: tokens.spacing.m,
  },
  mainToggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mainToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  mainToggleText: {
    marginLeft: tokens.spacing.m,
    flex: 1,
  },
  mainToggleTitle: {
    ...tokens.typography.body,
    color: tokens.colors.onSurface,
    fontWeight: '600',
  },
  mainToggleSubtitle: {
    ...tokens.typography.caption,
    color: tokens.colors.onSurface60,
    marginTop: 2,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  timerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: tokens.spacing.m,
    paddingHorizontal: tokens.spacing.m,
    backgroundColor: 'transparent',
  },
  selectedOption: {
    backgroundColor: 'rgba(0, 122, 255, 0.08)',
  },
  timerContent: {
    flex: 1,
    marginLeft: tokens.spacing.m,
  },
  timerLabel: {
    ...tokens.typography.body,
    color: tokens.colors.onSurface,
    fontWeight: '500',
  },
  selectedLabel: {
    color: tokens.colors.primary,
    fontWeight: '600',
  },
  timerDescription: {
    ...tokens.typography.caption,
    color: tokens.colors.onSurface60,
    marginTop: 2,
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginLeft: 48,
  },
  defaultTimerCard: {
    backgroundColor: tokens.colors.surface1,
    borderRadius: tokens.radius.m,
    padding: tokens.spacing.m,
  },
  defaultTimerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  defaultTimerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  defaultTimerText: {
    marginLeft: tokens.spacing.m,
    flex: 1,
  },
  defaultTimerTitle: {
    ...tokens.typography.body,
    color: tokens.colors.onSurface,
    fontWeight: '500',
  },
  defaultTimerSubtitle: {
    ...tokens.typography.caption,
    color: tokens.colors.onSurface60,
    marginTop: 2,
  },
  changeButton: {
    paddingHorizontal: tokens.spacing.m,
    paddingVertical: tokens.spacing.s,
    backgroundColor: tokens.colors.primary,
    borderRadius: tokens.radius.s,
  },
  changeButtonText: {
    ...tokens.typography.caption,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  footer: {
    marginTop: tokens.spacing.l,
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
    borderRadius: tokens.radius.m,
    padding: tokens.spacing.m,
    borderLeftWidth: 3,
    borderLeftColor: '#FF9500',
  },
  warningText: {
    ...tokens.typography.caption,
    color: tokens.colors.onSurface60,
    marginLeft: tokens.spacing.s,
    flex: 1,
    lineHeight: 18,
  },
});
