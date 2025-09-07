import React from 'react';
import { StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import { IconButton, Icon } from 'react-native-paper';
import { tokens } from '../theme/tokens';

interface MaterialIconProps {
  name: string;
  size?: number;
  color?: string;
  onPress?: () => void;
  weight?: 200 | 300 | 400 | 500 | 600;
  active?: boolean;
}

// Map Material Design icon names to Material Community Icons used by React Native Paper
const iconMap: Record<string, string> = {
  // Navigation & UI
  'arrow_back': 'arrow-left',
  'arrow_back_ios': 'chevron-left',
  'search': 'magnify',
  'edit': 'pencil',
  'more_vert': 'dots-vertical',
  'chevron_right': 'chevron-right',
  'done': 'check',
  'done_all': 'check-all',
  'error': 'alert-circle',
  'close': 'close',
  'filter_list': 'filter-variant',
  
  // Communication
  'phone': 'phone',
  'videocam': 'video',
  'videocam_off': 'video-off',
  'phone_in_talk': 'phone-in-talk',
  'call': 'phone',
  'call_end': 'phone-hangup',
  'call_made': 'phone-outgoing',
  'call_received': 'phone-incoming',
  'add_call': 'phone-plus',
  
  // Audio & Media
  'mic': 'microphone',
  'mic_off': 'microphone-off',
  'pause': 'pause',
  'volume_up': 'volume-high',
  'photo_library': 'image-multiple',
  'photo-library': 'image-multiple',
  
  // Messaging
  'send': 'send',
  'attachment': 'attachment',
  'attach_file': 'attachment',
  'emoji_emotions': 'emoticon-happy',
  'emoticon-outline': 'emoticon-happy-outline',
  'sticker-emoji': 'sticker-emoji',
  'microphone': 'microphone',
  'keyboard': 'keyboard',
  'message': 'message-text',
  'message-text': 'message-text',
  
  // Stories & Books
  'book-open-variant': 'book-open-variant',
  'story': 'image-multiple',
  
  // Security & Visibility
  'visibility': 'eye',
  'visibility_off': 'eye-off',
  'shield_spark': 'shield-check',
  'sparkle': 'star',
  'star': 'star',
  'lock': 'lock',
  'preview': 'eye',
  
  // User & Social
  'person_add': 'account-plus',
  'person-add': 'account-plus',
  'person-remove': 'account-remove',
  'login': 'login',
  'account_circle': 'account-circle',
  'group': 'account-group',
  'admin_panel_settings': 'shield-account',
  'mark_as_unread': 'email-mark-as-unread',
  
  // Actions
  'delete': 'delete',
  'delete-outline': 'trash-can',
  'delete-sweep': 'delete-sweep',
  'add': 'plus',
  'share': 'share-variant',
  'download': 'download',
  'file_download': 'download',
  'file-document': 'file-document',
  'backup': 'backup-restore',
  'archive': 'archive',
  'archive-outline': 'inbox-arrow-down',
  'clear_all': 'notification-clear-all',
  'push-pin': 'pin',
  'push-pin-outline': 'pin-outline',
  
  // Camera & Photo
  'camera_alt': 'camera',
  'photo': 'image',
  'photo_camera': 'camera',
  'flip_camera_ios': 'camera-flip',
  'image': 'image',
  'wallpaper': 'wallpaper',
  
  // Screen & Display
  'fullscreen': 'fullscreen',
  'fullscreen_exit': 'fullscreen-exit',
  
  // Interface Elements
  'insert_emoticon': 'emoticon-happy',
  'forum': 'forum',
  'bubble_chart': 'forum',
  'circle': 'circle',
  'radio_button_checked': 'radiobox-marked',
  'radio_button_unchecked': 'radiobox-blank',
  'check_circle': 'check-circle',
  'keyboard_arrow_up': 'chevron-up',
  'keyboard_arrow_down': 'chevron-down',
  'chevron-right': 'chevron-right',
  'chevron-left': 'chevron-left',
  'expand-less': 'chevron-up',
  'expand-more': 'chevron-down',
  
  // Settings & Configuration
  'settings': 'cog',
  'notifications': 'bell',
  'notifications_active': 'bell-ring',
  'notifications-off': 'bell-off',
  'timer': 'timer-outline',
  'storage': 'database',
  'help': 'help-circle-outline',
  'headset': 'headset',
  'cleaning_services': 'broom',
  'chat_bubble': 'chat',
  'viber': 'chat-processing',
  'schedule': 'clock-outline',
  'palette': 'palette',
  'format_size': 'format-size',
  'vibration': 'vibrate',
  'music_note': 'music-note',
  'ring_volume': 'phone-ring',
  'lightbulb': 'lightbulb',
  'weekend': 'calendar-weekend',
  'history': 'history',
  'security': 'security',
  'restore': 'backup-restore',
  'refresh': 'refresh',
  'alternate_email': 'at',
  'favorite': 'heart',
  'info': 'information',
  'auto_delete': 'clock-outline',
  'location_on': 'map-marker',
  'location-on': 'map-marker',
  'screen_lock_portrait': 'cellphone-lock',
  'fingerprint': 'fingerprint',
  'verified_user': 'shield-check',
  'assessment': 'chart-line',
  'block': 'block-helper',
  'report': 'flag',
  'email': 'email',
  
  // Video & Tutorials
  'play_circle': 'play-circle',
  'smart_display': 'monitor-cellphone',
  'video_library': 'video-box',
  'ondemand_video': 'play-box',
  
  // Social Media Icons
  'whatsapp': 'whatsapp',
  'twitter': 'twitter',
  'facebook': 'facebook',
};

export const MaterialIcon: React.FC<MaterialIconProps> = ({
  name,
  size = 24,
  color,
  onPress,
  weight = 300,
  active = false,
}) => {
  const iconColor = color || (active ? tokens.colors.primary : tokens.colors.onSurface60);
  const mappedIconName = iconMap[name] || name;
  const iconWeight = active ? 600 : weight;

  // Use IconButton for pressable icons
  if (onPress) {
    return (
      <IconButton
        icon={mappedIconName}
        size={size}
        iconColor={iconColor}
        onPress={onPress}
        style={styles.button}
      />
    );
  }

  // Use Icon component for non-pressable icons (no disabled state issues)
  return (
    <Icon
      source={mappedIconName}
      size={size}
      color={iconColor}
    />
  );
};

const styles = StyleSheet.create({
  button: {
    margin: 0,
  },
  icon: {
    margin: 0,
  },
  debugIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
