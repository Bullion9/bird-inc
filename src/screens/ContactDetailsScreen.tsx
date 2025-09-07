import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  Modal,
  Dimensions,
  Image,
} from 'react-native';
import { Text } from 'react-native-paper';
import { MotiView } from 'moti';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as Haptics from 'expo-haptics';

import { tokens } from '../theme/tokens';
import { CallsStackParamList } from '../navigation/types';
import { DynamicHeader, Avatar, MaterialIcon } from '../components';

type ContactDetailsRouteProp = RouteProp<CallsStackParamList, 'ContactDetails'>;
type ContactDetailsNavigationProp = StackNavigationProp<CallsStackParamList, 'ContactDetails'>;

interface ContactAction {
  id: string;
  title: string;
  icon: string;
  color: string;
  onPress: () => void;
}

export const ContactDetailsScreen: React.FC = () => {
  const navigation = useNavigation<ContactDetailsNavigationProp>();
  const route = useRoute<ContactDetailsRouteProp>();
  const { contactId, contactName, contactAvatar } = route.params;

  const [scrollOffset, setScrollOffset] = useState(0);
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  // iOS-style icon background colors
  const getIconBackgroundColor = (iconName: string): string => {
    const iconBackgrounds: { [key: string]: string } = {
      'phone': '#34C759',           // Green for call
      'videocam': '#007AFF',        // Blue for video call
      'message': '#007AFF',         // Blue for message
      'mail': '#FF9500',            // Orange for email
      'info': '#8E8E93',            // Gray for info
      'block': '#FF453A',           // Red for block
      'delete': '#FF453A',          // Red for delete
      'edit': '#5856D6',            // Purple for edit
      'share': '#32D74B',           // Green for share
    };
    return iconBackgrounds[iconName] || '#8E8E93';
  };

  const handleCall = () => {
    navigation.navigate('CallScreen', {
      contactName,
      contactAvatar: contactAvatar || '',
      isIncoming: false,
      callId: `call-${contactId}`,
      isVideo: false,
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleVideoCall = () => {
    navigation.navigate('VideoCall', {
      contactId,
      contactName,
      contactAvatar,
      isIncoming: false,
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleMessage = () => {
    // Navigate to chat - assuming we can navigate to chats
    Alert.alert('Message', `Send message to ${contactName}`);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleEmail = () => {
    const email = 'contact@example.com'; // Mock email
    Linking.openURL(`mailto:${email}`);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleShare = () => {
    Alert.alert('Share Contact', `Share ${contactName}'s contact information`);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleBlock = () => {
    Alert.alert(
      'Block Contact',
      `Are you sure you want to block ${contactName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Block', 
          style: 'destructive',
          onPress: () => {
            Alert.alert('Blocked', `${contactName} has been blocked`);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          }
        },
      ]
    );
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Contact',
      `Are you sure you want to delete ${contactName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            Alert.alert('Deleted', `${contactName} has been deleted`);
            navigation.goBack();
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          }
        },
      ]
    );
  };

  const primaryActions: ContactAction[] = [
    {
      id: 'call',
      title: 'Call',
      icon: 'phone',
      color: getIconBackgroundColor('phone'),
      onPress: handleCall,
    },
    {
      id: 'video',
      title: 'Video',
      icon: 'videocam',
      color: getIconBackgroundColor('videocam'),
      onPress: handleVideoCall,
    },
    {
      id: 'message',
      title: 'Message',
      icon: 'message',
      color: getIconBackgroundColor('message'),
      onPress: handleMessage,
    },
    {
      id: 'email',
      title: 'Mail',
      icon: 'mail',
      color: getIconBackgroundColor('mail'),
      onPress: handleEmail,
    },
  ];

  const secondaryActions: ContactAction[] = [
    {
      id: 'share',
      title: 'Share Contact',
      icon: 'share',
      color: getIconBackgroundColor('share'),
      onPress: handleShare,
    },
    {
      id: 'block',
      title: 'Block Contact',
      icon: 'block',
      color: getIconBackgroundColor('block'),
      onPress: handleBlock,
    },
    {
      id: 'delete',
      title: 'Delete Contact',
      icon: 'delete',
      color: getIconBackgroundColor('delete'),
      onPress: handleDelete,
    },
  ];

  const renderActionButton = (action: ContactAction, isLarge: boolean = false) => (
    <TouchableOpacity
      key={action.id}
      style={isLarge ? styles.primaryActionButton : styles.secondaryActionButton}
      onPress={action.onPress}
      activeOpacity={0.8}
    >
      <View style={[
        isLarge ? styles.actionIcon : styles.buttonActionIcon, 
        { backgroundColor: action.color }
      ]}>
        <MaterialIcon 
          name={action.icon} 
          size={isLarge ? 28 : 20} 
          color="#FFFFFF" 
        />
      </View>
      {isLarge && <Text style={styles.primaryActionText}>{action.title}</Text>}
    </TouchableOpacity>
  );

  const renderSecondaryAction = (action: ContactAction) => (
    <TouchableOpacity
      key={action.id}
      style={styles.secondaryActionRow}
      onPress={action.onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.secondaryActionIcon, { backgroundColor: action.color }]}>
        <MaterialIcon name={action.icon} size={20} color="#FFFFFF" />
      </View>
      <Text style={styles.secondaryActionTitle}>{action.title}</Text>
      <MaterialIcon name="chevron_right" size={20} color={tokens.colors.onSurface38} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <DynamicHeader
        title="Contact"
        scrollY={scrollOffset}
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
        titleSize={18}
        rightIcons={[
          {
            icon: 'edit',
            onPress: () => {
              Alert.alert('Edit Contact', `Edit ${contactName}'s information`);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
        {/* Contact Info */}
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 15, stiffness: 150 }}
          style={styles.contactInfo}
        >
          <TouchableOpacity
            onPress={() => {
              setShowAvatarModal(true);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            activeOpacity={0.8}
          >
            <Avatar
              source={contactAvatar}
              name={contactName}
              size={120}
            />
          </TouchableOpacity>
          <Text style={styles.contactName}>{contactName}</Text>
          <Text style={styles.contactPhone}>+1 (555) 123-4567</Text>
        </MotiView>

        {/* Primary Actions */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 300, delay: 100 }}
          style={styles.primaryActions}
        >
          {primaryActions.map(action => renderActionButton(action, true))}
        </MotiView>

        {/* Contact Details Card */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 300, delay: 200 }}
          style={styles.detailsCard}
        >
          <Text style={styles.cardTitle}>Contact Info</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Phone</Text>
            <Text style={styles.detailValue}>+1 (555) 123-4567</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Email</Text>
            <Text style={styles.detailValue}>contact@example.com</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status</Text>
            <Text style={styles.detailValue}>Online</Text>
          </View>
        </MotiView>

        {/* Secondary Actions */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 300, delay: 300 }}
          style={styles.secondaryActionsCard}
        >
          {secondaryActions.map(renderSecondaryAction)}
        </MotiView>
      </ScrollView>

      {/* Avatar Modal - WhatsApp style */}
      <Modal
        visible={showAvatarModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAvatarModal(false)}
      >
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowAvatarModal(false)}
            >
              <MaterialIcon name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{contactName}</Text>
            <View style={styles.modalHeaderSpacer} />
          </View>

          {/* Avatar Image */}
          <View style={styles.modalImageContainer}>
            {contactAvatar ? (
              <Image
                source={{ uri: contactAvatar }}
                style={styles.modalImage}
                resizeMode="contain"
              />
            ) : (
              <View style={styles.modalPlaceholder}>
                <Text style={styles.modalPlaceholderText}>
                  {contactName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.modalActionButton}
              onPress={() => {
                setShowAvatarModal(false);
                Alert.alert('Message', `Send message to ${contactName}`);
              }}
            >
              <View style={styles.modalActionIcon}>
                <MaterialIcon name="message" size={24} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.modalActionButton}
              onPress={() => {
                setShowAvatarModal(false);
                handleCall();
              }}
            >
              <View style={styles.modalActionIcon}>
                <MaterialIcon name="phone" size={24} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.modalActionButton}
              onPress={() => {
                setShowAvatarModal(false);
                handleVideoCall();
              }}
            >
              <View style={styles.modalActionIcon}>
                <MaterialIcon name="videocam" size={24} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    paddingBottom: tokens.spacing.xl,
  },
  contactInfo: {
    alignItems: 'center',
    paddingVertical: tokens.spacing.xl,
    paddingHorizontal: tokens.spacing.m,
  },
  contactName: {
    ...tokens.typography.h1,
    color: tokens.colors.onSurface,
    marginTop: tokens.spacing.m,
    textAlign: 'center',
  },
  contactPhone: {
    ...tokens.typography.body,
    color: tokens.colors.onSurface60,
    marginTop: tokens.spacing.xs,
    textAlign: 'center',
  },
  primaryActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: tokens.spacing.m,
    marginBottom: tokens.spacing.m,
  },
  primaryActionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: tokens.spacing.xs,
  },
  actionIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryActionText: {
    ...tokens.typography.caption,
    color: tokens.colors.onSurface,
    marginTop: tokens.spacing.xs,
    fontSize: 12,
    fontWeight: '600',
  },
  secondaryActionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  detailsCard: {
    backgroundColor: tokens.colors.surface1,
    marginHorizontal: tokens.spacing.m,
    marginBottom: tokens.spacing.m,
    borderRadius: tokens.radius.m,
    padding: tokens.spacing.m,
  },
  cardTitle: {
    ...tokens.typography.h2,
    color: tokens.colors.onSurface,
    marginBottom: tokens.spacing.m,
    fontWeight: '600',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: tokens.spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.surface2,
  },
  detailLabel: {
    ...tokens.typography.body,
    color: tokens.colors.onSurface60,
  },
  detailValue: {
    ...tokens.typography.body,
    color: tokens.colors.onSurface,
    fontWeight: '500',
  },
  secondaryActionsCard: {
    backgroundColor: tokens.colors.surface1,
    marginHorizontal: tokens.spacing.m,
    borderRadius: tokens.radius.m,
    overflow: 'hidden',
  },
  secondaryActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: tokens.spacing.m,
    paddingHorizontal: tokens.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.surface2,
  },
  secondaryActionIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: tokens.spacing.m,
  },
  secondaryActionTitle: {
    ...tokens.typography.body,
    color: tokens.colors.onSurface,
    flex: 1,
    fontWeight: '500',
  },
  // Modal styles - WhatsApp-like avatar viewer
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
    zIndex: 1,
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    ...tokens.typography.h2,
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
    fontWeight: '600',
  },
  modalHeaderSpacer: {
    width: 40,
  },
  modalImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  modalImage: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').width,
    maxHeight: Dimensions.get('window').height * 0.7,
  },
  modalPlaceholder: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: tokens.colors.surface1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalPlaceholderText: {
    ...tokens.typography.h1,
    color: tokens.colors.onSurface,
    fontSize: 64,
    fontWeight: '300',
  },
  modalActions: {
    position: 'absolute',
    bottom: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 32,
  },
  modalActionButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
