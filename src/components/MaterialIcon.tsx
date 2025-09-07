import React from 'react';
import { StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import { IconButton } from 'react-native-paper';
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
  
  // Messaging
  'send': 'send',
  'attachment': 'attachment',
  'attach_file': 'attachment',
  'emoji_emotions': 'emoticon-happy',
  'emoticon-outline': 'emoticon-happy-outline',
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
  'lock': 'lock',
  'preview': 'eye',
  
  // User & Social
  'person_add': 'account-plus',
  'login': 'login',
  'account_circle': 'account-circle',
  'group': 'account-group',
  'admin_panel_settings': 'shield-account',
  'mark_as_unread': 'email-mark-as-unread',
  
  // Actions
  'delete': 'delete',
  'add': 'plus',
  'share': 'share-variant',
  'download': 'download',
  'file_download': 'download',
  'backup': 'backup-restore',
  'archive': 'archive',
  'clear_all': 'notification-clear-all',
  
  // Camera & Photo
  'camera_alt': 'camera',
  'photo': 'image',
  'photo_camera': 'camera',
  'image': 'image',
  'wallpaper': 'wallpaper',
  
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
  
  // Settings & Configuration
  'settings': 'cog',
  'notifications': 'bell',
  'notifications_active': 'bell-ring',
  'storage': 'database',
  'help': 'help-circle-outline',
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
  'screen_lock_portrait': 'cellphone-lock',
  'fingerprint': 'fingerprint',
  'verified_user': 'shield-check',
  'assessment': 'chart-line',
  'block': 'block-helper',
  
  // Video & Tutorials
  'play_circle': 'play-circle',
  'smart_display': 'monitor-cellphone',
  'video_library': 'video-box',
  'ondemand_video': 'play-box',
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

  // Debug log
  console.log(`MaterialIcon: ${name} -> ${mappedIconName}`);

  // For debugging - let's use a simple colored text approach to ensure color shows
  if (color === tokens.colors.success || color === tokens.colors.error) {
    const IconComponent = () => (
      <View style={[styles.debugIcon, { backgroundColor: color, borderRadius: size/2, width: size, height: size }]}>
        <Text style={{ color: '#FFFFFF', fontSize: size * 0.6, textAlign: 'center', lineHeight: size }}>
          {name.includes('made') ? '↗' : name.includes('received') ? '↙' : '📞'}
        </Text>
      </View>
    );

    if (onPress) {
      return (
        <TouchableOpacity onPress={onPress} style={styles.button}>
          <IconComponent />
        </TouchableOpacity>
      );
    }
    return <IconComponent />;
  }

  // Fallback to original IconButton for other icons
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

  return (
    <IconButton
      icon={mappedIconName}
      size={size}
      iconColor={iconColor}
      style={styles.icon}
      disabled
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
