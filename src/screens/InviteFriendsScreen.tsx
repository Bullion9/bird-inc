import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput, Share } from 'react-native';
import { Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as Haptics from 'expo-haptics';

import { tokens } from '../theme/tokens';
import { SettingsStackParamList } from '../navigation/types';
import { DynamicHeader, MaterialIcon } from '../components';

type InviteFriendsNavigationProp = StackNavigationProp<SettingsStackParamList, 'InviteFriends'>;

export const InviteFriendsScreen: React.FC = () => {
  const navigation = useNavigation<InviteFriendsNavigationProp>();
  const [scrollOffset, setScrollOffset] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const shareInviteLink = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    try {
      await Share.share({
        message: 'Join me on Bird Chat! Download the app and let\'s stay connected: https://birdchat.com/download',
        title: 'Join Bird Chat'
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const shareViaMethod = (method: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    console.log(`Share via ${method}`);
  };

  const handleContactAccess = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // This would normally request contacts permission
    console.log('Contact access requested - would show contacts');
  };

  return (
    <View style={styles.container}>
      <DynamicHeader 
        title="Invite Friends"
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
        {/* Invite Link */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Share Invite Link</Text>
          <View style={styles.cardGroup}>
            <TouchableOpacity 
              style={styles.inviteButton}
              onPress={shareInviteLink}
              activeOpacity={0.7}
            >
              <MaterialIcon name="share" size={24} color="#FFFFFF" />
              <Text style={styles.inviteButtonText}>Share Bird Chat</Text>
            </TouchableOpacity>
            
            <View style={styles.inviteLinkContainer}>
              <Text style={styles.inviteLinkLabel}>Your invite link:</Text>
              <Text style={styles.inviteLink}>https://birdchat.com/invite/johndoe</Text>
            </View>
          </View>
        </View>

        {/* Share Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Share via</Text>
          <View style={styles.cardGroup}>
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => shareViaMethod('messages')}
              activeOpacity={0.7}
            >
              <View style={styles.settingItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: '#34C759' }]}>
                  <MaterialIcon name="message-text" size={20} color="#FFFFFF" />
                </View>
                <Text style={styles.settingTitle}>Messages</Text>
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
              onPress={() => shareViaMethod('email')}
              activeOpacity={0.7}
            >
              <View style={styles.settingItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: '#007AFF' }]}>
                  <MaterialIcon name="email" size={20} color="#FFFFFF" />
                </View>
                <Text style={styles.settingTitle}>Email</Text>
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
              onPress={() => shareViaMethod('whatsapp')}
              activeOpacity={0.7}
            >
              <View style={styles.settingItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: '#25D366' }]}>
                  <MaterialIcon name="whatsapp" size={20} color="#FFFFFF" />
                </View>
                <Text style={styles.settingTitle}>WhatsApp</Text>
              </View>
              <MaterialIcon 
                name="chevron_right" 
                size={20} 
                color={tokens.colors.onSurface60} 
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* From Contacts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>From Your Contacts</Text>
          <View style={styles.cardGroup}>
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={handleContactAccess}
              activeOpacity={0.7}
            >
              <View style={styles.settingItemLeft}>
                <View style={styles.iconContainer}>
                  <MaterialIcon name="account-multiple" size={20} color="#FFFFFF" />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Find Friends</Text>
                  <Text style={styles.settingSubtitle}>See who from your contacts is on Bird Chat</Text>
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

        {/* Referral Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Referrals</Text>
          <View style={styles.cardGroup}>
            <View style={styles.statItem}>
              <View style={styles.statContent}>
                <Text style={styles.statNumber}>12</Text>
                <Text style={styles.statLabel}>Friends Invited</Text>
              </View>
            </View>
            
            <View style={styles.statSeparator} />
            
            <View style={styles.statItem}>
              <View style={styles.statContent}>
                <Text style={styles.statNumber}>8</Text>
                <Text style={styles.statLabel}>Friends Joined</Text>
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
    paddingTop: 100,
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
  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.colors.primary,
    paddingVertical: tokens.spacing.l,
    paddingHorizontal: tokens.spacing.m,
    margin: tokens.spacing.m,
    borderRadius: tokens.radius.m,
    gap: tokens.spacing.s,
  },
  inviteButtonText: {
    ...tokens.typography.body,
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  inviteLinkContainer: {
    paddingHorizontal: tokens.spacing.m,
    paddingBottom: tokens.spacing.m,
  },
  inviteLinkLabel: {
    ...tokens.typography.caption,
    color: tokens.colors.onSurface60,
    fontSize: 12,
    marginBottom: tokens.spacing.xs,
  },
  inviteLink: {
    ...tokens.typography.body,
    color: tokens.colors.primary,
    fontSize: 14,
    fontFamily: 'monospace',
  },
  settingItem: {
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
    marginLeft: 52,
  },
  statSeparator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: tokens.colors.surface3,
    marginHorizontal: tokens.spacing.m,
  },
  socialIcon: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statItem: {
    paddingVertical: tokens.spacing.l,
    paddingHorizontal: tokens.spacing.m,
    alignItems: 'center',
  },
  statContent: {
    alignItems: 'center',
    gap: tokens.spacing.xs,
  },
  statNumber: {
    ...tokens.typography.h1,
    color: tokens.colors.primary,
    fontSize: 32,
    fontWeight: '700',
  },
  statLabel: {
    ...tokens.typography.caption,
    color: tokens.colors.onSurface60,
    fontSize: 12,
  },
});
