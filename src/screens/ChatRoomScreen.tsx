import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Keyboard,
  Alert,
  RefreshControl,
  Modal,
  ScrollView,
  Switch,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Audio } from 'expo-av';
import { BlurView } from 'expo-blur';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MotiView, MotiText } from 'moti';
import {
  GestureHandlerRootView,
  PanGestureHandler,
  LongPressGestureHandler,
  TapGestureHandler,
  PinchGestureHandler,
  State,
  PanGestureHandlerGestureEvent,
  LongPressGestureHandlerGestureEvent,
  TapGestureHandlerGestureEvent,
  PinchGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  clamp,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { MaterialIcon } from '../components/MaterialIcon';
import { tokens } from '../theme/tokens';
import { RootStackParamList } from '../navigation/types';

type ChatRoomScreenRouteProp = RouteProp<RootStackParamList, 'ChatRoom'>;
type ChatRoomScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ChatRoom'>;

interface Props {
  route: ChatRoomScreenRouteProp;
  navigation: ChatRoomScreenNavigationProp;
}

interface Message {
  id: string;
  text?: string;
  sticker?: string;
  timestamp: Date;
  isSent: boolean;
  isDelivered?: boolean;
  isRead?: boolean;
  fileUri?: string;
  fileType?: 'image' | 'document' | 'video' | 'audio';
  disappearingTimer?: number; // in seconds, 0 means no timer
  disappearsAt?: Date; // when the message will disappear
  isDisappeared?: boolean; // if the message has already disappeared
}

const { width: screenWidth } = Dimensions.get('window');

// MessageBubble component with individual gesture handling
interface MessageBubbleProps {
  message: Message;
  onLongPress: () => void;
  onDoubleTap: () => void;
  formatTime: (date: Date) => string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onLongPress, onDoubleTap, formatTime }) => {
  const messageSwipeX = useSharedValue(0);
  const messagePinchScale = useSharedValue(1);

  const messageSwipeGestureHandler = useAnimatedGestureHandler<PanGestureHandlerGestureEvent>({
    onStart: () => {
      // Only trigger haptic if it's a strong swipe gesture
    },
    onActive: (event) => {
      // Only respond to significant horizontal swipes to avoid interfering with vertical scrolling
      if (Math.abs(event.translationX) > Math.abs(event.translationY) * 2) {
        if (event.translationX < 0) {
          messageSwipeX.value = clamp(event.translationX, -80, 0);
        } else {
          messageSwipeX.value = clamp(event.translationX, 0, 80);
        }
      }
    },
    onEnd: (event) => {
      // Require more significant swipe to trigger action
      if (Math.abs(event.translationX) > 80 && Math.abs(event.translationX) > Math.abs(event.translationY) * 2) {
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
        runOnJS(onLongPress)();
      }
      messageSwipeX.value = withSpring(0);
    },
  });

  const messagePinchGestureHandler = useAnimatedGestureHandler<PinchGestureHandlerGestureEvent>({
    onActive: (event) => {
      messagePinchScale.value = clamp(event.scale, 0.5, 3);
    },
    onEnd: () => {
      messagePinchScale.value = withSpring(1);
    },
  });

  const messageSwipeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: messageSwipeX.value }],
  }));

  const messagePinchStyle = useAnimatedStyle(() => ({
    transform: [{ scale: messagePinchScale.value }],
  }));

  return (
    <PanGestureHandler 
      onGestureEvent={messageSwipeGestureHandler}
      activeOffsetX={[-15, 15]}
      failOffsetY={[-10, 10]}
    >
      <Animated.View style={messageSwipeStyle}>
        <LongPressGestureHandler
          minDurationMs={800}
          maxDist={20}
          onHandlerStateChange={(event) => {
            if (event.nativeEvent.state === State.ACTIVE) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              onLongPress();
            }
          }}
        >
          <Animated.View>
            <TapGestureHandler
              numberOfTaps={2}
              maxDist={30}
              onHandlerStateChange={(event) => {
                if (event.nativeEvent.state === State.ACTIVE) {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onDoubleTap();
                }
              }}
            >
              <Animated.View>
                <PinchGestureHandler 
                  onGestureEvent={messagePinchGestureHandler}
                >
                  <Animated.View style={messagePinchStyle}>
                    <MotiView
                      from={{ opacity: 0, translateY: 20 }}
                      animate={{ opacity: 1, translateY: 0 }}
                      transition={{ duration: 300 }}
                      style={[
                        styles.messageContainer,
                        message.isSent ? styles.sentMessage : styles.receivedMessage,
                      ]}
                    >
                      {/* Show disappeared message indicator */}
                      {message.isDisappeared ? (
                        <View style={[
                          styles.messageBubble,
                          styles.disappearedBubble,
                        ]}>
                          <View style={styles.disappearedContent}>
                            <MaterialIcon name="auto_delete" size={16} color={tokens.colors.onSurface38} />
                            <Text style={styles.disappearedText}>This message has disappeared</Text>
                          </View>
                        </View>
                      ) : message.sticker ? (
                        <View style={[
                          styles.stickerContainer,
                          message.isSent ? styles.sentSticker : styles.receivedSticker,
                        ]}>
                          <Text style={styles.stickerText}>{message.sticker}</Text>
                          {/* Show timer indicator for disappearing stickers */}
                          {message.disappearingTimer && message.disappearingTimer > 0 && (
                            <MotiView
                              from={{ scale: 1 }}
                              animate={{ scale: [1, 1.1, 1] }}
                              transition={{
                                type: 'timing',
                                duration: 2000,
                                loop: true,
                              }}
                              style={styles.timerIndicator}
                            >
                              <MaterialIcon name="timer" size={12} color="#FFFFFF" />
                            </MotiView>
                          )}
                        </View>
                      ) : (
                        <View style={[
                          styles.messageBubble,
                          message.isSent ? styles.sentBubble : styles.receivedBubble,
                        ]}>
                          {message.text?.startsWith('Forwarded:') && (
                            <View style={styles.forwardedIndicator}>
                              <MaterialIcon name="share" size={12} color={tokens.colors.onSurface60} />
                              <Text style={styles.forwardedText}>Forwarded</Text>
                            </View>
                          )}
                          {message.text?.startsWith('Replying to') && (
                            <View style={styles.replyIndicator}>
                              <MaterialIcon name="reply" size={12} color={tokens.colors.primary} />
                              <Text style={styles.replyIndicatorText}>Reply</Text>
                            </View>
                          )}
                          <Text style={[
                            styles.messageText,
                            message.isSent ? styles.sentText : styles.receivedText,
                          ]}>
                            {message.text}
                          </Text>
                          {/* Show timer indicator for disappearing messages */}
                          {message.disappearingTimer && message.disappearingTimer > 0 && (
                            <MotiView
                              from={{ scale: 1 }}
                              animate={{ scale: [1, 1.1, 1] }}
                              transition={{
                                type: 'timing',
                                duration: 2000,
                                loop: true,
                              }}
                              style={styles.timerIndicator}
                            >
                              <MaterialIcon name="timer" size={12} color="#FFFFFF" />
                            </MotiView>
                          )}
                        </View>
                      )}
                      <View style={[
                        styles.messageInfo,
                        message.isSent ? styles.sentInfo : styles.receivedInfo,
                      ]}>
                        <Text style={styles.timeText}>{formatTime(message.timestamp)}</Text>
                        {message.isSent && (
                          <View style={styles.statusContainer}>
                            {message.isRead ? (
                              <MaterialIcon name="done_all" size={12} color="#007AFF" />
                            ) : message.isDelivered ? (
                              <MaterialIcon name="done_all" size={12} color="rgba(142, 142, 147, 1)" />
                            ) : (
                              <MaterialIcon name="done" size={12} color="rgba(142, 142, 147, 1)" />
                            )}
                          </View>
                        )}
                      </View>
                    </MotiView>
                  </Animated.View>
                </PinchGestureHandler>
              </Animated.View>
            </TapGestureHandler>
          </Animated.View>
        </LongPressGestureHandler>
      </Animated.View>
    </PanGestureHandler>
  );
};

const ChatRoomScreen: React.FC<Props> = ({ route, navigation }) => {
  const { userName, chatId } = route.params;
  const [message, setMessage] = useState('');
  const [showEmojiKeyboard, setShowEmojiKeyboard] = useState(false);
  const [showStickerPack, setShowStickerPack] = useState(false);
  const [keyboardMode, setKeyboardMode] = useState<'text' | 'emoji' | 'sticker' | 'upload'>('text');
  const [showUploadMenu, setShowUploadMenu] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [disappearingTimer, setDisappearingTimer] = useState<number>(0); // Default: no timer
  const [isDisappearingEnabled, setIsDisappearingEnabled] = useState(false);
  const [showDisappearingToast, setShowDisappearingToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const textInputRef = useRef<TextInput>(null);

  // iOS-style icon background colors for chat room
  const getIconBackgroundColor = (iconName: string): string => {
    const iconBackgrounds: { [key: string]: string } = {
      // Header icons
      videocam: '#FF9500',          // Orange for video call
      call: '#34C759',              // Green for voice call
      
      // Dropdown menu icons
      'account-circle': '#007AFF',   // Blue for contact info
      'volume-off': '#8E8E93',      // Gray for mute
      'delete-sweep': '#FF9500',    // Orange for clear chat
      block: '#FF453A',             // Red for block user
      
      // Input area icons
      add: '#007AFF',               // Blue for attach
      send: '#007AFF',              // Blue for send
      microphone: '#FF453A',        // Red for voice record
      'sticker-emoji': 'rgba(255, 255, 255, 0.15)',   // Blur-style for stickers
      'emoticon-outline': 'rgba(255, 255, 255, 0.15)', // Blur-style for emoji
      keyboard: '#8E8E93',          // Gray for keyboard toggle
      
      // Upload menu icons
      camera: '#34C759',            // Green for camera
      image: '#5856D6',             // Purple for gallery
      'file-document': '#FF9500',   // Orange for documents
      
      // Reply/message action icons
      reply: '#007AFF',             // Blue for reply
      close: '#8E8E93',             // Gray for close
      share: '#007AFF',             // Blue for share
    };
    return iconBackgrounds[iconName] || '#8E8E93';
  };
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hey there! How are you doing?',
      timestamp: new Date(Date.now() - 1000 * 60 * 10),
      isSent: false,
    },
    {
      id: '2',
      text: 'I\'m doing great! Just working on some projects. How about you?',
      timestamp: new Date(Date.now() - 1000 * 60 * 8),
      isSent: true,
      isDelivered: true,
      isRead: true,
    },
    {
      id: '3',
      text: 'That sounds exciting! What kind of projects are you working on?',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      isSent: false,
    },
  ]);

  const flatListRef = useRef<FlatList>(null);

  // Gesture state variables
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);
  const [forwardedMessages, setForwardedMessages] = useState<string[]>([]);
  const [showHeaderDropdown, setShowHeaderDropdown] = useState(false);
  const [showProfileSheet, setShowProfileSheet] = useState(false);
  const [showNameDropdown, setShowNameDropdown] = useState(false);
  
  // Bio and contact state
  const [contactBio, setContactBio] = useState('');
  const [isContactSaved, setIsContactSaved] = useState(false);
  const [isNewContact, setIsNewContact] = useState(true); // Simulate new contact
  const [isChatLocked, setIsChatLocked] = useState(false); // Chat lock state
  
  // Profile sheet dynamic header state
  const [showUserNameInHeader, setShowUserNameInHeader] = useState(false);
  
  // Animated values for gestures
  const pullToRefreshY = useSharedValue(0);
  const keyboardSwipeY = useSharedValue(0);

  useEffect(() => {
    // Scroll to bottom when new messages are added
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  useEffect(() => {
    // Initialize bio for demo purposes when profile sheet opens
    if (showProfileSheet && !contactBio && isNewContact) {
      // Simulate fetching bio from user's profile or previous messages
      setTimeout(() => {
        setContactBio("Software developer passionate about mobile apps and user experience. Love to travel and explore new technologies! 🚀");
      }, 500);
    }
  }, [showProfileSheet]);

  useEffect(() => {
    // Listen for keyboard events
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setShowEmojiKeyboard(false);
      setShowStickerPack(false);
      setKeyboardMode('text');
    });

    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      // Keep emoji/sticker keyboard state when regular keyboard hides
    });

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, []);

  // Upload functions
  const toggleUploadMenu = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (keyboardMode === 'upload') {
      // Hide upload menu and show regular keyboard
      setShowUploadMenu(false);
      setShowEmojiKeyboard(false);
      setShowStickerPack(false);
      setKeyboardMode('text');
      textInputRef.current?.focus();
    } else {
      // Hide regular keyboard and show upload menu
      Keyboard.dismiss();
      setTimeout(() => {
        setShowUploadMenu(true);
        setShowEmojiKeyboard(false);
        setShowStickerPack(false);
        setKeyboardMode('upload');
      }, 100);
    }
  };

  const handleImagePicker = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setShowUploadMenu(false);
      setKeyboardMode('text');

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const newMessage: Message = {
          id: Date.now().toString(),
          text: `📷 Image: ${result.assets[0].fileName || 'image.jpg'}`,
          timestamp: new Date(),
          isSent: true,
          isDelivered: false,
          fileUri: result.assets[0].uri,
          fileType: 'image',
        };
        setMessages(prev => [...prev, newMessage]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleCamera = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setShowUploadMenu(false);
      setKeyboardMode('text');

      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Camera access is needed to take photos');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const newMessage: Message = {
          id: Date.now().toString(),
          text: `📷 Camera Photo: ${result.assets[0].fileName || 'photo.jpg'}`,
          timestamp: new Date(),
          isSent: true,
          isDelivered: false,
          fileUri: result.assets[0].uri,
          fileType: 'image',
        };
        setMessages(prev => [...prev, newMessage]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const handleDocumentPicker = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setShowUploadMenu(false);
      setKeyboardMode('text');

      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const file = result.assets[0];
        const newMessage: Message = {
          id: Date.now().toString(),
          text: `📄 ${file.name} (${(file.size! / 1024 / 1024).toFixed(2)} MB)`,
          timestamp: new Date(),
          isSent: true,
          isDelivered: false,
          fileUri: file.uri,
          fileType: 'document',
        };
        setMessages(prev => [...prev, newMessage]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const handleFileShare = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowUploadMenu(false);
    setKeyboardMode('text');
    Alert.alert('File Share', 'Share files with this contact');
  };

  const handleDisappearingMessageToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowUploadMenu(false);
    setKeyboardMode('text');
    setIsDisappearingEnabled(!isDisappearingEnabled);
    Alert.alert(
      'Disappearing Messages',
      isDisappearingEnabled ? 'Disappearing messages turned off' : 'Disappearing messages turned on'
    );
  };

  const handleLocationShare = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowUploadMenu(false);
    setKeyboardMode('text');
    Alert.alert('Location', 'Share your current location');
  };

  const handleContactShare = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowUploadMenu(false);
    setKeyboardMode('text');
    Alert.alert('Contact', 'Share a contact');
  };

  // Voice recording functions
  const startRecording = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      // Request audio permissions
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Microphone access is needed to record audio');
        return;
      }

      // Set audio mode for recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecording(recording);
      setIsRecording(true);
      setRecordingDuration(0);

      // Start timer for recording duration
      const timer = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

      // Store timer reference for cleanup
      (recording as any).timer = timer;

    } catch (error) {
      Alert.alert('Error', 'Failed to start recording');
      console.error('Recording error:', error);
    }
  };

  const stopRecording = async () => {
    try {
      if (!recording) return;

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      // Clear timer
      if ((recording as any).timer) {
        clearInterval((recording as any).timer);
      }

      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      
      const uri = recording.getURI();
      if (uri) {
        const duration = recordingDuration;
        const newMessage: Message = {
          id: Date.now().toString(),
          text: `🎙️ Voice message (${formatDuration(duration)})`,
          timestamp: new Date(),
          isSent: true,
          isDelivered: false,
          fileUri: uri,
          fileType: 'audio',
        };
        setMessages(prev => [...prev, newMessage]);
      }

      setRecording(null);
      setRecordingDuration(0);
    } catch (error) {
      Alert.alert('Error', 'Failed to stop recording');
      console.error('Stop recording error:', error);
    }
  };

  const cancelRecording = async () => {
    try {
      if (!recording) return;

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      // Clear timer
      if ((recording as any).timer) {
        clearInterval((recording as any).timer);
      }

      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      setRecording(null);
      setRecordingDuration(0);
    } catch (error) {
      console.error('Cancel recording error:', error);
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleEmojiKeyboard = () => {
    if (keyboardMode === 'text') {
      // Show emoji keyboard
      Keyboard.dismiss();
      setTimeout(() => {
        setShowEmojiKeyboard(true);
        setShowStickerPack(false);
        setKeyboardMode('emoji');
      }, 100);
    } else if (keyboardMode === 'emoji') {
      // Show sticker pack
      setShowEmojiKeyboard(false);
      setShowStickerPack(true);
      setKeyboardMode('sticker');
    } else {
      // Back to regular keyboard
      setShowEmojiKeyboard(false);
      setShowStickerPack(false);
      setKeyboardMode('text');
      textInputRef.current?.focus();
    }
  };

  const insertEmoji = (emoji: string) => {
    setMessage(prev => prev + emoji);
  };

  const insertSticker = (sticker: string) => {
    const now = new Date();
    const newMessage: Message = {
      id: Date.now().toString(),
      sticker,
      timestamp: now,
      isSent: true,
      isDelivered: true,
      disappearingTimer: isDisappearingEnabled ? disappearingTimer : 0,
      disappearsAt: isDisappearingEnabled && disappearingTimer > 0 
        ? new Date(now.getTime() + disappearingTimer * 1000)
        : undefined,
      isDisappeared: false,
    };

    setMessages(prev => [...prev, newMessage]);

    // Simulate message delivery after a short delay
    setTimeout(() => {
      setMessages(prev =>
        prev.map(msg =>
          msg.id === newMessage.id ? { ...msg, isRead: true } : msg
        )
      );
    }, 1000);

    // Set up disappearing timer if enabled
    if (isDisappearingEnabled && disappearingTimer > 0) {
      setTimeout(() => {
        setMessages(prev =>
          prev.map(msg =>
            msg.id === newMessage.id ? { ...msg, isDisappeared: true } : msg
          )
        );
      }, disappearingTimer * 1000);
    }

    // Hide sticker pack after sending
    setShowStickerPack(false);
    setKeyboardMode('text');
  };

  const sendMessage = () => {
    if (message.trim()) {
      const now = new Date();
      const newMessage: Message = {
        id: Date.now().toString(),
        text: replyToMessage 
          ? `Replying to "${replyToMessage.sticker || replyToMessage.text}": ${message.trim()}`
          : message.trim(),
        timestamp: now,
        isSent: true,
        isDelivered: true,
        disappearingTimer: isDisappearingEnabled ? disappearingTimer : 0,
        disappearsAt: isDisappearingEnabled && disappearingTimer > 0 
          ? new Date(now.getTime() + disappearingTimer * 1000)
          : undefined,
        isDisappeared: false,
      };

      setMessages(prev => [...prev, newMessage]);
      setMessage('');
      setReplyToMessage(null); // Clear reply after sending

      // Simulate message delivery after a short delay
      setTimeout(() => {
        setMessages(prev =>
          prev.map(msg =>
            msg.id === newMessage.id ? { ...msg, isRead: true } : msg
          )
        );
      }, 1000);

      // Set up disappearing timer if enabled
      if (isDisappearingEnabled && disappearingTimer > 0) {
        setTimeout(() => {
          setMessages(prev =>
            prev.map(msg =>
              msg.id === newMessage.id ? { ...msg, isDisappeared: true } : msg
            )
          );
        }, disappearingTimer * 1000);
      }
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getTimerLabel = (seconds: number): string => {
    if (seconds === 0) return 'Off';
    if (seconds < 60) return `${seconds} seconds`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours`;
    return `${Math.floor(seconds / 86400)} days`;
  };

  const showDisappearingToastNotification = (message: string) => {
    setToastMessage(message);
    setShowDisappearingToast(true);
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      setShowDisappearingToast(false);
    }, 3000);
  };

  const renderEmojiCategory = ({ item }: { item: typeof emojiCategories[0] }) => (
    <View style={styles.emojiCategoryContainer}>
      <Text style={styles.emojiCategoryTitle}>{item.category}</Text>
      <View style={styles.emojiGrid}>
        {item.emojis.map((emoji, index) => (
          <TouchableOpacity
            key={index}
            style={styles.emojiPickerButton}
            onPress={() => insertEmoji(emoji)}
            activeOpacity={0.6}
          >
            <Text style={styles.emojiText}>{emoji}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStickerPack = ({ item }: { item: typeof stickerPacks[0] }) => (
    <View style={styles.stickerPackContainer}>
      <Text style={styles.stickerPackTitle}>{item.name}</Text>
      <View style={styles.stickerGrid}>
        {item.stickers.map((sticker, index) => (
          <TouchableOpacity
            key={index}
            style={styles.stickerButton}
            onPress={() => insertSticker(sticker)}
            activeOpacity={0.6}
          >
            <Text style={styles.stickerItemText}>{sticker}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  // Gesture handlers
  const handlePullToRefresh = async () => {
    setIsRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Simulate loading older messages
    setTimeout(() => {
      const olderMessages: Message[] = [
        {
          id: `older-${Date.now()}`,
          text: 'This is an older message loaded from history',
          timestamp: new Date(Date.now() - 1000 * 60 * 60),
          isSent: Math.random() > 0.5,
          isDelivered: true,
          isRead: true,
        },
      ];
      setMessages(prev => [...olderMessages, ...prev]);
      setIsRefreshing(false);
    }, 1500);
  };

  const showMessageActions = (messageId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedMessageId(messageId);
    
    const message = messages.find(msg => msg.id === messageId);
    if (!message) return;
    
    Alert.alert(
      'Message Actions',
      'Choose an action',
      [
        { text: 'Reply', onPress: () => replyToMessage_func(message) },
        { text: 'Forward', onPress: () => forwardMessage(message) },
        { text: 'Copy', onPress: () => copyMessage(message) },
        { text: 'Delete', style: 'destructive', onPress: () => deleteMessage(messageId) },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const replyToMessage_func = (message: Message) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setReplyToMessage(message);
    textInputRef.current?.focus();
    
    // Dismiss any open keyboards
    setShowEmojiKeyboard(false);
    setShowStickerPack(false);
    setKeyboardMode('text');
  };

  const forwardMessage = (message: Message) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    Alert.alert(
      'Forward Message',
      'Message will be forwarded to your chat history',
      [
        {
          text: 'Forward',
          onPress: () => {
            const forwardedMessage: Message = {
              id: Date.now().toString(),
              text: message.sticker ? undefined : `Forwarded: ${message.text}`,
              sticker: message.sticker,
              timestamp: new Date(),
              isSent: true,
              isDelivered: true,
            };

            setMessages(prev => [...prev, forwardedMessage]);
            setForwardedMessages(prev => [...prev, message.id]);

            // Simulate message delivery
            setTimeout(() => {
              setMessages(prev =>
                prev.map(msg =>
                  msg.id === forwardedMessage.id ? { ...msg, isRead: true } : msg
                )
              );
            }, 1000);
          }
        },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const copyMessage = async (message: Message) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    try {
      const textToCopy = message.sticker ? message.sticker : message.text || '';
      await Clipboard.setStringAsync(textToCopy);
      
      Alert.alert(
        'Copied!',
        'Message copied to clipboard',
        [{ text: 'OK' }],
        { cancelable: true }
      );
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to copy message',
        [{ text: 'OK' }]
      );
    }
  };

  const clearReply = () => {
    setReplyToMessage(null);
  };

  const toggleHeaderDropdown = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowHeaderDropdown(!showHeaderDropdown);
  };

  const toggleNameDropdown = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowNameDropdown(!showNameDropdown);
    // Close other dropdowns when opening name dropdown
    if (!showNameDropdown) {
      setShowHeaderDropdown(false);
    }
  };

  const handleContactInfo = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowHeaderDropdown(false);
    setShowNameDropdown(false);
    setShowProfileSheet(true);
  };

  const handleMuteChat = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowHeaderDropdown(false);
    setShowNameDropdown(false);
    Alert.alert(
      'Mute Chat',
      'Mute notifications for this chat?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: '1 Hour', onPress: () => console.log('Mute 1 hour') },
        { text: '8 Hours', onPress: () => console.log('Mute 8 hours') },
        { text: 'Until Tomorrow', onPress: () => console.log('Mute until tomorrow') }
      ]
    );
  };

  const handleBlockUser = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setShowHeaderDropdown(false);
    setShowNameDropdown(false);
    Alert.alert(
      'Block User',
      `Block ${userName}? They won't be able to send you messages.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Block', style: 'destructive', onPress: () => console.log('User blocked') }
      ]
    );
  };

  const handleClearChat = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setShowHeaderDropdown(false);
    setShowNameDropdown(false);
    Alert.alert(
      'Clear Chat',
      'Delete all messages in this chat?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: () => setMessages([]) }
      ]
    );
  };

  const deleteMessage = (messageId: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  };

  const addQuickReaction = (messageId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    console.log('Quick reaction added to message:', messageId);
    // Implementation for quick reactions (like/heart)
  };

  // Profile sheet scroll handler for dynamic header
  const handleProfileSheetScroll = (event: any) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    // Show user name in header when scrolled past the profile section (approximately 200px)
    const shouldShowUserName = scrollY > 200;
    if (shouldShowUserName !== showUserNameInHeader) {
      setShowUserNameInHeader(shouldShowUserName);
    }
  };

  const closeProfileSheet = () => {
    setShowProfileSheet(false);
    setShowUserNameInHeader(false); // Reset header state when closing
  };

  // Animated gesture handlers
  const keyboardSwipeGestureHandler = useAnimatedGestureHandler<PanGestureHandlerGestureEvent>({
    onActive: (event) => {
      if (event.translationY > 0 && (showEmojiKeyboard || showStickerPack)) {
        keyboardSwipeY.value = event.translationY;
      }
    },
    onEnd: (event) => {
      if (event.translationY > 100) {
        keyboardSwipeY.value = withTiming(300);
        runOnJS(() => {
          setShowEmojiKeyboard(false);
          setShowStickerPack(false);
          setKeyboardMode('text');
        })();
      } else {
        keyboardSwipeY.value = withSpring(0);
      }
    },
  });

  const keyboardSwipeStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: keyboardSwipeY.value }],
  }));

  const renderMessage = ({ item }: { item: Message }) => (
    <MessageBubble 
      message={item} 
      onLongPress={() => showMessageActions(item.id)}
      onDoubleTap={() => addQuickReaction(item.id)}
      formatTime={formatTime}
    />
  );

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                navigation.goBack();
              }}
            >
              <View style={{ transform: [{ scaleX: 1.3 }] }}>
                <MaterialIcon 
                  name="chevron-left" 
                  size={40} 
                  color={tokens.colors.primary} 
                />
              </View>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={styles.headerCenter}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              toggleNameDropdown();
            }}
          >
            <View style={styles.headerCenterContent}>
              <View style={styles.headerNameContainer}>
                <Text style={styles.headerTitle}>{userName}</Text>
                <MaterialIcon 
                  name={showNameDropdown ? "expand-less" : "expand-more"} 
                  size={20} 
                  color={tokens.colors.onSurface60} 
                />
              </View>
              <View style={styles.headerSubtitleContainer}>
                <Text style={styles.headerSubtitle}>Online • Last seen recently</Text>
                {isNewContact && !isContactSaved && (
                  <View style={styles.newContactIndicator}>
                    <MaterialIcon name="person-add" size={12} color={tokens.colors.primary} />
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
          
          <View style={styles.headerRight}>
            <View style={styles.headerIconContainer}>
              <MaterialIcon 
                name="videocam" 
                size={24} 
                color="#007AFF"
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  Alert.alert('Video Call', `Start video call with ${userName}?`, [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Call', onPress: () => console.log('Video call started') }
                  ]);
                }}
              />
            </View>
            
            <View style={styles.headerIconContainer}>
              <MaterialIcon 
                name="call" 
                size={22} 
                color="#007AFF"
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  Alert.alert('Voice Call', `Call ${userName}?`, [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Call', onPress: () => console.log('Voice call started') }
                  ]);
                }}
              />
            </View>
          </View>
        </View>

        {showHeaderDropdown && (
          <>
            <TouchableWithoutFeedback onPress={toggleHeaderDropdown}>
              <View style={styles.dropdownOverlay} />
            </TouchableWithoutFeedback>
            <MotiView
              from={{ opacity: 0, translateY: -10 }}
              animate={{ opacity: 1, translateY: 0 }}
              exit={{ opacity: 0, translateY: -10 }}
              transition={{ duration: 200 }}
              style={styles.headerDropdown}
            >
              <TouchableOpacity style={styles.dropdownItem} onPress={handleContactInfo}>
                <View style={styles.headerIconContainer}>
                  <MaterialIcon name="account-circle" size={20} color="#007AFF" />
                </View>
                <Text style={styles.dropdownText}>Contact Info</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.dropdownItem} onPress={handleMuteChat}>
                <View style={styles.headerIconContainer}>
                  <MaterialIcon name="volume-off" size={20} color="#007AFF" />
                </View>
                <Text style={styles.dropdownText}>Mute Notifications</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.dropdownItem} onPress={handleClearChat}>
                <View style={styles.headerIconContainer}>
                  <MaterialIcon name="delete-sweep" size={20} color="#007AFF" />
                </View>
                <Text style={styles.dropdownText}>Clear Chat</Text>
              </TouchableOpacity>
              
              <View style={styles.dropdownSeparator} />
              
              <TouchableOpacity style={styles.dropdownItem} onPress={handleBlockUser}>
                <View style={styles.headerIconContainer}>
                  <MaterialIcon name="block" size={20} color="#007AFF" />
                </View>
                <Text style={[styles.dropdownText, { color: tokens.colors.error }]}>Block User</Text>
              </TouchableOpacity>
            </MotiView>
          </>
        )}

        <KeyboardAvoidingView 
          style={styles.content}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          {showNameDropdown && (
            <>
              <TouchableWithoutFeedback onPress={toggleNameDropdown}>
                <View style={styles.fullScreenOverlay} />
              </TouchableWithoutFeedback>
              <MotiView
                from={{ opacity: 0, translateY: -300, scale: 0.95 }}
                animate={{ opacity: 1, translateY: 0, scale: 1 }}
                exit={{ opacity: 0, translateY: -300, scale: 0.95 }}
                transition={{ 
                  type: 'spring',
                  duration: 600,
                  dampingRatio: 0.8,
                  stiffness: 100
                }}
                style={styles.nameDropdownModalInline}
              >
                <View style={styles.modalDropdownContent}>
                  <TouchableOpacity style={styles.modalDropdownItem} onPress={handleContactInfo}>
                    <View style={styles.modalDropdownIcon}>
                      <MaterialIcon name="account-circle" size={20} color="#007AFF" />
                    </View>
                    <View style={styles.modalDropdownTextContent}>
                      <Text style={styles.modalDropdownText}>Contact Info</Text>
                      <Text style={styles.modalDropdownSubtext}>View profile and details</Text>
                    </View>
                    <MaterialIcon name="chevron-right" size={14} color={tokens.colors.onSurface60} />
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.modalDropdownItem} onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setShowNameDropdown(false);
                    Alert.alert('Audio Call', `Call ${userName}?`, [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Call', onPress: () => console.log('Audio call started') }
                    ]);
                  }}>
                    <View style={styles.modalDropdownIcon}>
                      <MaterialIcon name="phone" size={20} color="#34C759" />
                    </View>
                    <View style={styles.modalDropdownTextContent}>
                      <Text style={styles.modalDropdownText}>Audio Call</Text>
                      <Text style={styles.modalDropdownSubtext}>Start voice call</Text>
                    </View>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.modalDropdownItem} onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setShowNameDropdown(false);
                    Alert.alert('Video Call', `Start video call with ${userName}?`, [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Call', onPress: () => console.log('Video call started') }
                    ]);
                  }}>
                    <View style={styles.modalDropdownIcon}>
                      <MaterialIcon name="videocam" size={20} color="#007AFF" />
                    </View>
                    <View style={styles.modalDropdownTextContent}>
                      <Text style={styles.modalDropdownText}>Video Call</Text>
                      <Text style={styles.modalDropdownSubtext}>Start video call</Text>
                    </View>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.modalDropdownItem} onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setShowNameDropdown(false);
                    Alert.alert('Search Chat', 'Search in conversation...');
                  }}>
                    <View style={styles.modalDropdownIcon}>
                      <MaterialIcon name="search" size={20} color="#FF9500" />
                    </View>
                    <View style={styles.modalDropdownTextContent}>
                      <Text style={styles.modalDropdownText}>Search Chat</Text>
                      <Text style={styles.modalDropdownSubtext}>Find messages</Text>
                    </View>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.modalDropdownItem} onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setShowNameDropdown(false);
                    Alert.alert('Media Gallery', 'View shared photos and videos');
                  }}>
                    <View style={styles.modalDropdownIcon}>
                      <MaterialIcon name="photo-library" size={20} color="#5856D6" />
                    </View>
                    <View style={styles.modalDropdownTextContent}>
                      <Text style={styles.modalDropdownText}>Media & Files</Text>
                      <Text style={styles.modalDropdownSubtext}>Photos, videos, documents</Text>
                    </View>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.modalDropdownItem} onPress={handleMuteChat}>
                    <View style={styles.modalDropdownIcon}>
                      <MaterialIcon name="volume-off" size={20} color="#8E8E93" />
                    </View>
                    <View style={styles.modalDropdownTextContent}>
                      <Text style={styles.modalDropdownText}>Mute Notifications</Text>
                      <Text style={styles.modalDropdownSubtext}>Silence alerts</Text>
                    </View>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.modalDropdownItem} onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setShowNameDropdown(false);
                    Alert.alert('Pin Chat', 'Pin this chat to the top of your conversations?', [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Pin', onPress: () => console.log('Chat pinned') }
                    ]);
                  }}>
                    <View style={styles.modalDropdownIcon}>
                      <MaterialIcon name="push-pin" size={20} color="#FF9500" />
                    </View>
                    <View style={styles.modalDropdownTextContent}>
                      <Text style={styles.modalDropdownText}>Pin Chat</Text>
                      <Text style={styles.modalDropdownSubtext}>Keep at top</Text>
                    </View>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.modalDropdownItem} onPress={handleClearChat}>
                    <View style={styles.modalDropdownIcon}>
                      <MaterialIcon name="delete-sweep" size={20} color="#FF9500" />
                    </View>
                    <View style={styles.modalDropdownTextContent}>
                      <Text style={styles.modalDropdownText}>Clear Chat</Text>
                      <Text style={styles.modalDropdownSubtext}>Delete all messages</Text>
                    </View>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={[styles.modalDropdownItem, styles.modalDropdownItemLast]} onPress={handleBlockUser}>
                    <View style={styles.modalDropdownIcon}>
                      <MaterialIcon name="block" size={20} color={tokens.colors.error} />
                    </View>
                    <View style={styles.modalDropdownTextContent}>
                      <Text style={[styles.modalDropdownText, { color: tokens.colors.error }]}>Block User</Text>
                      <Text style={styles.modalDropdownSubtext}>Block and report</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </MotiView>
            </>
          )}

        {/* Disappearing Messages Toast Notification */}
        {showDisappearingToast && (
          <MotiView
            from={{ opacity: 0, translateY: -50, scale: 0.95 }}
            animate={{ opacity: 1, translateY: 0, scale: 1 }}
            exit={{ opacity: 0, translateY: -50, scale: 0.95 }}
            transition={{
              type: 'spring',
              damping: 15,
              stiffness: 300
            }}
            style={styles.toastNotification}
          >
            <View style={styles.toastContent}>
              <View style={styles.toastIcon}>
                <MaterialIcon 
                  name={isDisappearingEnabled ? "auto_delete" : "timer_off"} 
                  size={16} 
                  color="#FFFFFF" 
                />
              </View>
              <Text style={styles.toastText}>{toastMessage}</Text>
            </View>
          </MotiView>
        )}

          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            style={styles.messagesList}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            scrollEnabled={true}
            bounces={true}
            alwaysBounceVertical={true}
            directionalLockEnabled={true}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handlePullToRefresh}
                tintColor={tokens.colors.primary}
                colors={[tokens.colors.primary]}
                progressBackgroundColor={tokens.colors.surface1}
              />
            }
          />

          {replyToMessage && (
            <MotiView
              from={{ opacity: 0, translateY: -10 }}
              animate={{ opacity: 1, translateY: 0 }}
              exit={{ opacity: 0, translateY: -10 }}
              transition={{ duration: 200 }}
              style={styles.replyContainer}
            >
              <View style={styles.replyContent}>
                <View style={styles.replyInfo}>
                  <View style={styles.headerIconContainer}>
                    <MaterialIcon name="reply" size={16} color="#007AFF" />
                  </View>
                  <Text style={styles.replyLabel}>
                    Replying to {replyToMessage?.isSent ? 'yourself' : userName}
                  </Text>
                </View>
                <Text style={styles.replyText} numberOfLines={1}>
                  {replyToMessage?.sticker || replyToMessage?.text}
                </Text>
              </View>
              <TouchableOpacity onPress={clearReply} style={styles.replyCloseButton}>
                <View style={styles.headerIconContainer}>
                  <MaterialIcon name="close" size={20} color="#007AFF" />
                </View>
              </TouchableOpacity>
            </MotiView>
          )}

        {/* Disappearing Messages Active Banner */}
        {isDisappearingEnabled && (
          <MotiView
            from={{ opacity: 0, translateY: -20, scale: 0.95 }}
            animate={{ opacity: 1, translateY: 0, scale: 1 }}
            exit={{ opacity: 0, translateY: -20, scale: 0.95 }}
            transition={{ 
              type: 'spring',
              damping: 15,
              stiffness: 300
            }}
            style={styles.disappearingBanner}
          >
            <View style={styles.disappearingBannerContent}>
              <View style={styles.disappearingBannerLeft}>
                <View style={styles.disappearingBannerIcon}>
                  <MaterialIcon name="auto_delete" size={16} color="#FFFFFF" />
                </View>
                <View style={styles.disappearingBannerText}>
                  <Text style={styles.disappearingBannerTitle}>Disappearing Messages</Text>
                  <Text style={styles.disappearingBannerSubtitle}>
                    Messages disappear after {getTimerLabel(disappearingTimer)}
                  </Text>
                </View>
                <View style={styles.timerIconContainer}>
                  <MaterialIcon name="timer" size={16} color="#5856D6" />
                  <Text style={styles.timerText}>
                    {disappearingTimer < 60 ? `${disappearingTimer}s` : disappearingTimer < 3600 ? `${Math.floor(disappearingTimer / 60)}m` : `${Math.floor(disappearingTimer / 3600)}h`}
                  </Text>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.disappearingBannerButton}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  Alert.alert(
                    'Disappearing Messages',
                    `Messages in this chat will automatically disappear after ${getTimerLabel(disappearingTimer)}.`,
                    [
                      { 
                        text: 'Change Timer', 
                        onPress: () => {
                          Alert.alert(
                            'Change Timer',
                            'Choose when messages should disappear',
                            [
                              { text: 'Cancel', onPress: () => {} },
                              { text: '5 seconds', onPress: () => setDisappearingTimer(5) },
                              { text: '30 seconds', onPress: () => setDisappearingTimer(30) },
                              { text: '1 minute', onPress: () => setDisappearingTimer(60) },
                              { text: '5 minutes', onPress: () => setDisappearingTimer(300) },
                              { text: '30 minutes', onPress: () => setDisappearingTimer(1800) },
                              { text: '1 hour', onPress: () => setDisappearingTimer(3600) },
                              { text: 'Turn Off', onPress: () => setIsDisappearingEnabled(false) }
                            ]
                          );
                        }
                      },
                      { text: 'OK', onPress: () => {} }
                    ]
                  );
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.disappearingBannerButtonText}>Settings</Text>
              </TouchableOpacity>
            </View>
          </MotiView>
        )}

        <View style={styles.inputContainer}>
          <View style={styles.inputRow}>
            <TouchableOpacity style={styles.attachButton} onPress={toggleUploadMenu}>
              <MaterialIcon name="add" size={20} color="#007AFF" />
            </TouchableOpacity>

            <View style={styles.inputWrapper}>
              <TextInput
                ref={textInputRef}
                style={styles.textInput}
                value={message}
                onChangeText={setMessage}
                placeholder="Text Message"
                placeholderTextColor="#8E8E93" // iOS Messages exact placeholder color
                multiline
                maxLength={1000}
              returnKeyType="default"
              enablesReturnKeyAutomatically
              onFocus={() => {
                setShowEmojiKeyboard(false);
                setShowStickerPack(false);
                setShowUploadMenu(false);
                setKeyboardMode('text');
              }}
            />

            <TouchableOpacity 
              style={styles.emojiButton}
              onPress={toggleEmojiKeyboard}
              activeOpacity={0.7}
            >
              <View style={styles.headerIconContainer}>
                <MaterialIcon 
                  name={
                    keyboardMode === 'emoji' ? "sticker-emoji" : 
                    keyboardMode === 'sticker' ? "keyboard" : 
                    "emoticon-outline"
                  } 
                  size={24} 
                  color="#007AFF" 
                />
              </View>
            </TouchableOpacity>
            </View>

            {/* Send Button - Right side of input row */}
            {message.trim() && (
              <TouchableOpacity 
                style={styles.sendButtonOutside} 
                onPress={sendMessage}
                activeOpacity={0.7}
              >
                <View style={styles.headerIconContainer}>
                  <MaterialIcon name="send" size={24} color="#007AFF" />
                </View>
              </TouchableOpacity>
            )}

            {/* Mic Button - Right side of input row when not typing */}
            {!message.trim() && !isRecording && (
              <TouchableOpacity 
                style={styles.micButtonOutside}
                onPressIn={startRecording}
                onPressOut={stopRecording}
                delayPressIn={0}
                delayPressOut={0}
                activeOpacity={0.7}
              >
                <View style={styles.headerIconContainer}>
                  <MaterialIcon 
                    name="microphone" 
                    size={24} 
                    color="#007AFF" 
                  />
                </View>
              </TouchableOpacity>
            )}

            {/* Recording Indicator - Right side of input row */}
            {isRecording && (
              <MotiView
                from={{ opacity: 0, translateY: 10 }}
                animate={{ opacity: 1, translateY: 0 }}
                exit={{ opacity: 0, translateY: 10 }}
                transition={{ duration: 200 }}
                style={styles.recordingIndicatorInline}
              >
                <View style={styles.recordingWaveInline}>
                  <MotiView
                    from={{ scaleY: 0.3 }}
                    animate={{ scaleY: [0.3, 1, 0.3] }}
                    transition={{
                      repeat: Infinity,
                      duration: 800,
                      delay: 0,
                    }}
                    style={styles.waveBarSmall}
                  />
                  <MotiView
                    from={{ scaleY: 0.5 }}
                    animate={{ scaleY: [0.5, 1.2, 0.5] }}
                    transition={{
                      repeat: Infinity,
                      duration: 800,
                      delay: 200,
                    }}
                    style={styles.waveBarSmall}
                  />
                  <MotiView
                    from={{ scaleY: 0.3 }}
                    animate={{ scaleY: [0.3, 0.8, 0.3] }}
                    transition={{
                      repeat: Infinity,
                      duration: 800,
                      delay: 400,
                    }}
                    style={styles.waveBarSmall}
                  />
                </View>
              </MotiView>
            )}
          </View>
        </View>

        {showUploadMenu && (
          <PanGestureHandler onGestureEvent={keyboardSwipeGestureHandler}>
            <Animated.View style={keyboardSwipeStyle}>
              <BlurView
                intensity={80}
                tint="dark"
                style={styles.uploadKeyboard}
              >
                <MotiView
                  from={{ opacity: 0, translateY: 20 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  exit={{ opacity: 0, translateY: 20 }}
                  transition={{ duration: 200 }}
                  style={styles.uploadKeyboardContent}
                >
                  <View style={styles.uploadHeader}>
                    <Text style={styles.uploadHeaderText}>Attachments</Text>
                    <TouchableOpacity
                      onPress={() => {
                        setShowUploadMenu(false);
                        setKeyboardMode('text');
                      }}
                      style={styles.uploadCloseButton}
                    >
                      <View style={styles.headerIconContainer}>
                        <MaterialIcon name="keyboard" size={20} color="#007AFF" />
                      </View>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.uploadOptions}>
                    <View style={styles.uploadGrid}>
                      <TouchableOpacity style={styles.uploadGridItem} onPress={handleCamera}>
                        <View style={[styles.uploadIcon, { backgroundColor: '#34C759' }]}>
                          <MaterialIcon name="camera" size={24} color="#FFFFFF" />
                        </View>
                        <Text style={styles.uploadGridText}>Camera</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity style={styles.uploadGridItem} onPress={handleImagePicker}>
                        <View style={[styles.uploadIcon, { backgroundColor: '#FF9500' }]}>
                          <MaterialIcon name="image" size={24} color="#FFFFFF" />
                        </View>
                        <Text style={styles.uploadGridText}>Gallery</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity style={styles.uploadGridItem} onPress={handleDocumentPicker}>
                        <View style={[styles.uploadIcon, { backgroundColor: '#007AFF' }]}>
                          <MaterialIcon name="file-document" size={24} color="#FFFFFF" />
                        </View>
                        <Text style={styles.uploadGridText}>Document</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity style={styles.uploadGridItem} onPress={handleFileShare}>
                        <View style={[styles.uploadIcon, { backgroundColor: '#5856D6' }]}>
                          <MaterialIcon name="folder" size={24} color="#FFFFFF" />
                        </View>
                        <Text style={styles.uploadGridText}>File</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity style={styles.uploadGridItem} onPress={handleDisappearingMessageToggle}>
                        <View style={[styles.uploadIcon, { backgroundColor: '#AF52DE' }]}>
                          <MaterialIcon name="auto_delete" size={24} color="#FFFFFF" />
                        </View>
                        <Text style={styles.uploadGridText}>Disappearing</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity style={styles.uploadGridItem} onPress={handleLocationShare}>
                        <View style={[styles.uploadIcon, { backgroundColor: '#FF3B30' }]}>
                          <MaterialIcon name="location_on" size={24} color="#FFFFFF" />
                        </View>
                        <Text style={styles.uploadGridText}>Location</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity style={styles.uploadGridItem} onPress={handleContactShare}>
                        <View style={[styles.uploadIcon, { backgroundColor: '#32D74B' }]}>
                          <MaterialIcon name="contacts" size={24} color="#FFFFFF" />
                        </View>
                        <Text style={styles.uploadGridText}>Contact</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </MotiView>
              </BlurView>
            </Animated.View>
          </PanGestureHandler>
        )}

        {showEmojiKeyboard && (
          <PanGestureHandler onGestureEvent={keyboardSwipeGestureHandler}>
            <Animated.View style={keyboardSwipeStyle}>
              <BlurView
                intensity={80}
                tint="dark"
                style={styles.emojiKeyboard}
              >
                <MotiView
                  from={{ opacity: 0, translateY: 20 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  exit={{ opacity: 0, translateY: 20 }}
                  transition={{ duration: 200 }}
                  style={styles.emojiKeyboardContent}
                >
                  <View style={styles.emojiHeader}>
                    <Text style={styles.emojiHeaderText}>Emoji</Text>
                    <TouchableOpacity
                      onPress={() => {
                        setShowEmojiKeyboard(false);
                        setKeyboardMode('text');
                      }}
                      style={styles.emojiCloseButton}
                    >
                      <View style={styles.headerIconContainer}>
                        <MaterialIcon name="keyboard" size={20} color="#007AFF" />
                      </View>
                    </TouchableOpacity>
                  </View>
                  <FlatList
                    data={emojiCategories}
                    renderItem={renderEmojiCategory}
                    keyExtractor={(item) => item.category}
                    style={styles.emojiList}
                    showsVerticalScrollIndicator={false}
                  />
                </MotiView>
              </BlurView>
            </Animated.View>
          </PanGestureHandler>
        )}

        {showStickerPack && (
          <PanGestureHandler onGestureEvent={keyboardSwipeGestureHandler}>
            <Animated.View style={keyboardSwipeStyle}>
              <BlurView
                intensity={80}
                tint="dark"
                style={styles.stickerKeyboard}
              >
                <MotiView
                  from={{ opacity: 0, translateY: 20 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  exit={{ opacity: 0, translateY: 20 }}
                  transition={{ duration: 200 }}
                  style={styles.stickerKeyboardContent}
                >
                  <View style={styles.stickerHeader}>
                    <Text style={styles.stickerHeaderText}>Stickers</Text>
                    <TouchableOpacity
                      onPress={() => {
                        setShowStickerPack(false);
                        setKeyboardMode('text');
                      }}
                      style={styles.stickerCloseButton}
                    >
                      <View style={styles.headerIconContainer}>
                        <MaterialIcon name="keyboard" size={20} color="#007AFF" />
                      </View>
                    </TouchableOpacity>
                  </View>
                  <FlatList
                    data={stickerPacks}
                    renderItem={renderStickerPack}
                    keyExtractor={(item) => item.name}
                    style={styles.stickerList}
                    showsVerticalScrollIndicator={false}
                  />
                </MotiView>
              </BlurView>
            </Animated.View>
          </PanGestureHandler>
        )}
      </KeyboardAvoidingView>
      </SafeAreaView>

      {/* Profile Sheet Modal */}
      <Modal
        visible={showProfileSheet}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={closeProfileSheet}
      >
        <SafeAreaView style={styles.profileSheetFullContainer}>
          {/* Fixed Dynamic Header */}
          <View style={styles.profileSheetDynamicHeader}>
            <View style={styles.profileSheetHeaderLeft}>
              <TouchableOpacity
                style={styles.profileSheetBackButton}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  closeProfileSheet();
                }}
              >
                <MaterialIcon name="chevron-left" size={28} color={tokens.colors.primary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.profileSheetHeaderCenter}>
              <MotiText 
                style={styles.profileSheetDynamicTitle}
                animate={{ 
                  opacity: 1,
                  translateY: 0 
                }}
                transition={{ 
                  type: 'timing',
                  duration: 200 
                }}
              >
                {showUserNameInHeader ? userName : 'Contact Info'}
              </MotiText>
            </View>
            
            <View style={styles.profileSheetHeaderRight}>
              <TouchableOpacity
                style={styles.profileSheetEditButton}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  Alert.alert('Edit Contact', 'Edit contact information');
                }}
              >
                <Text style={styles.profileSheetEditButtonText}>Edit</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Scrollable Content */}
          <View style={styles.profileSheetFullContent}>
            <ScrollView 
              style={styles.profileSheetScroll} 
              showsVerticalScrollIndicator={false}
              onScroll={handleProfileSheetScroll}
              scrollEventThrottle={16}
            >
              {/* Profile Avatar and Name */}
              <View style={styles.profileSheetMainSection}>
              <View style={styles.profileSheetAvatar}>
                <Text style={styles.profileSheetAvatarText}>
                  {userName?.charAt(0)?.toUpperCase() || 'U'}
                </Text>
              </View>
              <Text style={styles.profileSheetName}>{userName}</Text>
              <Text style={styles.profileSheetStatus}>Online • Last seen recently</Text>
              
              {/* New Contact Notice */}
              {isNewContact && !isContactSaved && (
                <MotiView
                  from={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={styles.newContactNotice}
                >
                  <MaterialIcon name="person-add" size={16} color={tokens.colors.primary} />
                  <Text style={styles.newContactNoticeText}>New Contact</Text>
                </MotiView>
              )}
              
              {/* Bio Section */}
              {contactBio && (
                <View style={styles.bioSection}>
                  <Text style={styles.bioText}>{contactBio}</Text>
                </View>
              )}
            </View>

            {/* Save Contact Banner for New Users */}
            {isNewContact && !isContactSaved && (
              <MotiView
                from={{ opacity: 0, translateY: -20 }}
                animate={{ opacity: 1, translateY: 0 }}
                style={styles.saveContactBanner}
              >
                <View style={styles.saveContactContent}>
                  <View style={styles.saveContactInfo}>
                    <MaterialIcon name="person-add" size={20} color={tokens.colors.primary} />
                    <Text style={styles.saveContactTitle}>Save {userName} to Contacts?</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.saveContactButton}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      setIsContactSaved(true);
                      Alert.alert(
                        'Contact Saved',
                        `${userName} has been saved to your contacts.`,
                        [{ text: 'OK' }]
                      );
                    }}
                  >
                    <Text style={styles.saveContactButtonText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </MotiView>
            )}

              {/* Quick Action Buttons */}
              <View style={styles.profileSheetActions}>
              <TouchableOpacity 
                style={styles.profileSheetActionButton}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  Alert.alert('Audio Call', `Calling ${userName}...`);
                }}
              >
                <View style={[styles.profileSheetActionIcon, { backgroundColor: '#34C759' }]}>
                  <MaterialIcon name="phone" size={20} color="#FFFFFF" />
                </View>
                <Text style={styles.profileSheetActionText}>Audio</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.profileSheetActionButton}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  Alert.alert('Video Call', `Video calling ${userName}...`);
                }}
              >
                <View style={[styles.profileSheetActionIcon, { backgroundColor: '#007AFF' }]}>
                  <MaterialIcon name="videocam" size={20} color="#FFFFFF" />
                </View>
                <Text style={styles.profileSheetActionText}>Video</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.profileSheetActionButton}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  Alert.alert('Search', 'Search in conversation...');
                }}
              >
                <View style={[styles.profileSheetActionIcon, { backgroundColor: '#FF9500' }]}>
                  <MaterialIcon name="search" size={20} color="#FFFFFF" />
                </View>
                <Text style={styles.profileSheetActionText}>Search</Text>
              </TouchableOpacity>
            </View>

              {/* Info Sections */}
              {/* Contact & Media Card */}
              <View style={styles.profileSheetSection}>
                <Text style={styles.profileSheetSectionTitle}>Contact & Media</Text>
                <View style={styles.profileSheetCard}>
                  <TouchableOpacity 
                    style={[styles.profileSheetInfoItem, styles.firstCardItem]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      closeProfileSheet();
                      setTimeout(() => {
                        navigation.navigate('ContactBioEdit', {
                          contactName: userName,
                          initialBio: contactBio,
                          onBioChange: (newBio: string) => {
                            setContactBio(newBio);
                          }
                        });
                      }, 300);
                    }}
                  >
                    <MaterialIcon name="edit" size={20} color={tokens.colors.onSurface60} />
                    <View style={styles.profileSheetInfoContent}>
                      <Text style={styles.profileSheetInfoLabel}>Bio</Text>
                      <Text style={styles.profileSheetInfoValue}>
                        {contactBio || 'Add a bio for this contact...'}
                      </Text>
                    </View>
                    <MaterialIcon name="chevron-right" size={16} color={tokens.colors.onSurface60} />
                  </TouchableOpacity>
                  
                  <View style={styles.cardSeparator} />
                  
                  <TouchableOpacity 
                    style={styles.profileSheetInfoItem}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      Alert.alert('Media Gallery', 'View shared photos and videos');
                    }}
                  >
                    <MaterialIcon name="photo-library" size={20} color={tokens.colors.primary} />
                    <View style={styles.profileSheetInfoContent}>
                      <Text style={styles.profileSheetInfoLabel}>Media, Links & Docs</Text>
                      <Text style={styles.profileSheetInfoSubtext}>142 shared items</Text>
                    </View>
                    <MaterialIcon name="chevron-right" size={16} color={tokens.colors.onSurface60} />
                  </TouchableOpacity>
                  
                  <View style={styles.cardSeparator} />
                  
                  <TouchableOpacity 
                    style={[styles.profileSheetInfoItem, styles.lastCardItem]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      Alert.alert('Starred Messages', 'View starred messages');
                    }}
                  >
                    <MaterialIcon name="star" size={20} color="#FFD700" />
                    <View style={styles.profileSheetInfoContent}>
                      <Text style={styles.profileSheetInfoLabel}>Starred Messages</Text>
                      <Text style={styles.profileSheetInfoSubtext}>5 messages</Text>
                    </View>
                    <MaterialIcon name="chevron-right" size={16} color={tokens.colors.onSurface60} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Contact Details Card */}
              <View style={styles.profileSheetSection}>
                <Text style={styles.profileSheetSectionTitle}>Contact Details</Text>
                <View style={styles.profileSheetCard}>
                  <TouchableOpacity 
                    style={[styles.profileSheetInfoItem, styles.firstCardItem]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      Alert.alert('Call', `Call ${userName}?`);
                    }}
                  >
                    <MaterialIcon name="phone" size={20} color={tokens.colors.onSurface60} />
                    <View style={styles.profileSheetInfoContent}>
                      <Text style={styles.profileSheetInfoLabel}>Phone</Text>
                      <Text style={styles.profileSheetInfoValue}>+1 234 567 8900</Text>
                    </View>
                  </TouchableOpacity>
                  
                  <View style={styles.cardSeparator} />
                  
                  <TouchableOpacity 
                    style={[styles.profileSheetInfoItem, styles.lastCardItem]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      Alert.alert('Email', 'Send email?');
                    }}
                  >
                    <MaterialIcon name="email" size={20} color={tokens.colors.onSurface60} />
                    <View style={styles.profileSheetInfoContent}>
                      <Text style={styles.profileSheetInfoLabel}>Email</Text>
                      <Text style={styles.profileSheetInfoValue}>john@example.com</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Chat & Privacy Settings Card */}
              <View style={styles.profileSheetSection}>
                <Text style={styles.profileSheetSectionTitle}>Chat & Privacy</Text>
                <View style={styles.profileSheetCard}>
                  <TouchableOpacity 
                    style={[styles.profileSheetInfoItem, styles.firstCardItem]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setIsChatLocked(!isChatLocked);
                    }}
                  >
                    <MaterialIcon name="lock" size={20} color={tokens.colors.primary} />
                    <View style={styles.profileSheetInfoContent}>
                      <Text style={styles.profileSheetInfoLabel}>Lock Chat</Text>
                    </View>
                    <Switch
                      value={isChatLocked}
                      onValueChange={(value) => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setIsChatLocked(value);
                      }}
                      trackColor={{ false: '#39393D', true: '#34C759' }}
                      thumbColor={Platform.OS === 'ios' ? undefined : (isChatLocked ? '#FFFFFF' : '#f4f3f4')}
                      ios_backgroundColor="#39393D"
                      style={{ transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }] }}
                    />
                  </TouchableOpacity>
                  
                  <View style={styles.cardSeparator} />
                  
                  <TouchableOpacity 
                    style={styles.profileSheetInfoItem}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setIsDisappearingEnabled(!isDisappearingEnabled);
                    }}
                  >
                    <MaterialIcon name="auto_delete" size={20} color={isDisappearingEnabled ? '#5856D6' : tokens.colors.onSurface60} />
                    <View style={styles.profileSheetInfoContent}>
                      <Text style={styles.profileSheetInfoLabel}>Disappearing Messages</Text>
                      <Text style={styles.profileSheetInfoSubtext}>
                        {isDisappearingEnabled ? `${getTimerLabel(disappearingTimer)} timer` : 'Off'}
                      </Text>
                    </View>
                    <Switch
                      value={isDisappearingEnabled}
                      onValueChange={(value) => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setIsDisappearingEnabled(value);
                        
                        // Show toast notification
                        if (value) {
                          if (disappearingTimer === 0) {
                            setDisappearingTimer(3600); // Default to 1 hour
                            showDisappearingToastNotification('Disappearing messages turned on for 1 hour');
                          } else {
                            showDisappearingToastNotification(`Disappearing messages turned on for ${getTimerLabel(disappearingTimer)}`);
                          }
                        } else {
                          showDisappearingToastNotification('Disappearing messages turned off');
                        }
                      }}
                      trackColor={{ false: '#39393D', true: '#34C759' }}
                      thumbColor={Platform.OS === 'ios' ? undefined : (isDisappearingEnabled ? '#FFFFFF' : '#f4f3f4')}
                      ios_backgroundColor="#39393D"
                      style={{ transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }] }}
                    />
                  </TouchableOpacity>
                  
                  {/* Timer Selection (only show when disappearing messages is enabled) */}
                  {isDisappearingEnabled && (
                    <>
                      <View style={styles.cardSeparator} />
                      <TouchableOpacity 
                        style={styles.profileSheetInfoItem}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                          Alert.alert(
                            'Disappearing Timer',
                            'Choose when messages should disappear',
                            [
                              { text: 'Cancel', onPress: () => {} },
                              { text: '5 seconds', onPress: () => setDisappearingTimer(5) },
                              { text: '30 seconds', onPress: () => setDisappearingTimer(30) },
                              { text: '1 minute', onPress: () => setDisappearingTimer(60) },
                              { text: '5 minutes', onPress: () => setDisappearingTimer(300) },
                              { text: '30 minutes', onPress: () => setDisappearingTimer(1800) },
                              { text: '1 hour', onPress: () => setDisappearingTimer(3600) },
                              { text: '6 hours', onPress: () => setDisappearingTimer(21600) },
                              { text: '24 hours', onPress: () => setDisappearingTimer(86400) },
                              { text: '7 days', onPress: () => setDisappearingTimer(604800) }
                            ]
                          );
                        }}
                      >
                        <MaterialIcon name="timer" size={20} color="#5856D6" />
                        <View style={styles.profileSheetInfoContent}>
                          <Text style={styles.profileSheetInfoLabel}>Timer</Text>
                          <Text style={styles.profileSheetInfoSubtext}>{getTimerLabel(disappearingTimer)}</Text>
                        </View>
                        <MaterialIcon name="chevron-right" size={16} color={tokens.colors.onSurface60} />
                      </TouchableOpacity>
                    </>
                  )}
                  
                  <View style={styles.cardSeparator} />
                  
                  <TouchableOpacity 
                    style={styles.profileSheetInfoItem}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      Alert.alert(
                        'Mute Notifications',
                        'Mute notifications for this chat?',
                        [
                          { text: 'Cancel', style: 'cancel' },
                          { text: '15 minutes', onPress: () => console.log('Mute 15 min') },
                          { text: '1 hour', onPress: () => console.log('Mute 1 hour') },
                          { text: '8 hours', onPress: () => console.log('Mute 8 hours') },
                          { text: 'Until I turn it back on', onPress: () => console.log('Mute indefinitely') }
                        ]
                      );
                    }}
                  >
                    <MaterialIcon name="notifications-off" size={20} color={tokens.colors.onSurface60} />
                    <View style={styles.profileSheetInfoContent}>
                      <Text style={styles.profileSheetInfoLabel}>Mute Notifications</Text>
                    </View>
                    <MaterialIcon name="chevron-right" size={16} color={tokens.colors.onSurface60} />
                  </TouchableOpacity>
                  
                  <View style={styles.cardSeparator} />
                  
                  <TouchableOpacity 
                    style={styles.profileSheetInfoItem}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      Alert.alert('Encryption', 'Messages are end-to-end encrypted. Tap to learn more.');
                    }}
                  >
                    <MaterialIcon name="security" size={20} color="#34C759" />
                    <View style={styles.profileSheetInfoContent}>
                      <Text style={styles.profileSheetInfoLabel}>Encryption</Text>
                      <Text style={styles.profileSheetInfoSubtext}>Messages are secure</Text>
                    </View>
                    <MaterialIcon name="info" size={16} color={tokens.colors.onSurface60} />
                  </TouchableOpacity>
                  
                  <View style={styles.cardSeparator} />
                  
                  <TouchableOpacity 
                    style={[styles.profileSheetInfoItem, styles.lastCardItem]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      Alert.alert(
                        'Clear Chat',
                        'Delete all messages in this chat?',
                        [
                          { text: 'Cancel', style: 'cancel' },
                          { text: 'Clear Chat', style: 'destructive', onPress: () => setMessages([]) }
                        ]
                      );
                    }}
                  >
                    <MaterialIcon name="delete-sweep" size={20} color="#FF9500" />
                    <View style={styles.profileSheetInfoContent}>
                      <Text style={styles.profileSheetInfoLabel}>Clear Chat</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Contact Management & Actions Card */}
              <View style={styles.profileSheetSection}>
                <Text style={styles.profileSheetSectionTitle}>Contact Management</Text>
                <View style={styles.profileSheetCard}>
                  {!isContactSaved ? (
                    <>
                      <TouchableOpacity 
                        style={[styles.profileSheetInfoItem, styles.firstCardItem]}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                          Alert.alert(
                            'Add to Contacts',
                            `Save ${userName} to your contacts?`,
                            [
                              { text: 'Cancel', style: 'cancel' },
                              { 
                                text: 'Add Contact', 
                                onPress: () => {
                                  setIsContactSaved(true);
                                  setIsNewContact(false);
                                  Alert.alert('Contact Added', `${userName} has been saved to your contacts.`);
                                }
                              }
                            ]
                          );
                        }}
                      >
                        <MaterialIcon name="person-add" size={20} color={tokens.colors.primary} />
                        <View style={styles.profileSheetInfoContent}>
                          <Text style={styles.profileSheetInfoLabel}>Add to Contacts</Text>
                        </View>
                        <MaterialIcon name="chevron-right" size={16} color={tokens.colors.onSurface60} />
                      </TouchableOpacity>
                      
                      <View style={styles.cardSeparator} />
                      
                      <TouchableOpacity 
                        style={styles.profileSheetInfoItem}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          Alert.alert('Share Contact', 'Share this contact with others');
                        }}
                      >
                        <MaterialIcon name="share" size={20} color={tokens.colors.primary} />
                        <View style={styles.profileSheetInfoContent}>
                          <Text style={styles.profileSheetInfoLabel}>Share Contact</Text>
                        </View>
                        <MaterialIcon name="chevron-right" size={16} color={tokens.colors.onSurface60} />
                      </TouchableOpacity>
                      
                      <View style={styles.cardSeparator} />
                      
                      <TouchableOpacity 
                        style={styles.profileSheetInfoItem}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                          Alert.alert(
                            'Block Contact',
                            `Block ${userName}? They won't be able to send you messages or call you.`,
                            [
                              { text: 'Cancel', style: 'cancel' },
                              { text: 'Block', style: 'destructive', onPress: () => console.log('User blocked') }
                            ]
                          );
                        }}
                      >
                        <MaterialIcon name="block" size={20} color={tokens.colors.error} />
                        <View style={styles.profileSheetInfoContent}>
                          <Text style={[styles.profileSheetInfoLabel, { color: tokens.colors.error }]}>Block Contact</Text>
                        </View>
                      </TouchableOpacity>
                      
                      <View style={styles.cardSeparator} />
                      
                      <TouchableOpacity 
                        style={[styles.profileSheetInfoItem, styles.lastCardItem]}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                          Alert.alert(
                            'Report Contact',
                            'Report this contact for spam, abuse, or other issues?',
                            [
                              { text: 'Cancel', style: 'cancel' },
                              { text: 'Report', style: 'destructive', onPress: () => console.log('User reported') }
                            ]
                          );
                        }}
                      >
                        <MaterialIcon name="report" size={20} color={tokens.colors.error} />
                        <View style={styles.profileSheetInfoContent}>
                          <Text style={[styles.profileSheetInfoLabel, { color: tokens.colors.error }]}>Report Contact</Text>
                        </View>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      <TouchableOpacity 
                        style={[styles.profileSheetInfoItem, styles.firstCardItem]}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          Alert.alert('Create Group', `Create a group with ${userName}?`);
                        }}
                      >
                        <MaterialIcon name="group-add" size={20} color={tokens.colors.primary} />
                        <View style={styles.profileSheetInfoContent}>
                          <Text style={styles.profileSheetInfoLabel}>Create Group</Text>
                        </View>
                        <MaterialIcon name="chevron-right" size={16} color={tokens.colors.onSurface60} />
                      </TouchableOpacity>
                      
                      <View style={styles.cardSeparator} />
                      
                      <TouchableOpacity 
                        style={styles.profileSheetInfoItem}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          Alert.alert('Share Contact', 'Share this contact with others');
                        }}
                      >
                        <MaterialIcon name="share" size={20} color={tokens.colors.primary} />
                        <View style={styles.profileSheetInfoContent}>
                          <Text style={styles.profileSheetInfoLabel}>Share Contact</Text>
                        </View>
                        <MaterialIcon name="chevron-right" size={16} color={tokens.colors.onSurface60} />
                      </TouchableOpacity>
                      
                      <View style={styles.cardSeparator} />
                      
                      <TouchableOpacity 
                        style={styles.profileSheetInfoItem}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                          Alert.alert(
                            'Remove from Contacts',
                            `Remove ${userName} from your contacts?`,
                            [
                              { text: 'Cancel', style: 'cancel' },
                              { 
                                text: 'Remove', 
                                style: 'destructive',
                                onPress: () => {
                                  setIsContactSaved(false);
                                  setIsNewContact(true);
                                  Alert.alert('Contact Removed', `${userName} has been removed from your contacts.`);
                                }
                              }
                            ]
                          );
                        }}
                      >
                        <MaterialIcon name="person-remove" size={20} color={tokens.colors.error} />
                        <View style={styles.profileSheetInfoContent}>
                          <Text style={[styles.profileSheetInfoLabel, { color: tokens.colors.error }]}>Remove from Contacts</Text>
                        </View>
                      </TouchableOpacity>
                      
                      <View style={styles.cardSeparator} />
                      
                      <TouchableOpacity 
                        style={styles.profileSheetInfoItem}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                          Alert.alert(
                            'Block Contact',
                            `Block ${userName}? They won't be able to send you messages or call you.`,
                            [
                              { text: 'Cancel', style: 'cancel' },
                              { text: 'Block', style: 'destructive', onPress: () => console.log('User blocked') }
                            ]
                          );
                        }}
                      >
                        <MaterialIcon name="block" size={20} color={tokens.colors.error} />
                        <View style={styles.profileSheetInfoContent}>
                          <Text style={[styles.profileSheetInfoLabel, { color: tokens.colors.error }]}>Block Contact</Text>
                        </View>
                      </TouchableOpacity>
                      
                      <View style={styles.cardSeparator} />
                      
                      <TouchableOpacity 
                        style={[styles.profileSheetInfoItem, styles.lastCardItem]}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                          Alert.alert(
                            'Report Contact',
                            'Report this contact for spam, abuse, or other issues?',
                            [
                              { text: 'Cancel', style: 'cancel' },
                              { text: 'Report', style: 'destructive', onPress: () => console.log('User reported') }
                            ]
                          );
                        }}
                      >
                        <MaterialIcon name="report" size={20} color={tokens.colors.error} />
                        <View style={styles.profileSheetInfoContent}>
                          <Text style={[styles.profileSheetInfoLabel, { color: tokens.colors.error }]}>Report Contact</Text>
                        </View>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>
    </GestureHandlerRootView>
  );
};

// Emoji data - iOS-style categories
const emojiCategories = [
  {
    category: 'Smileys & People',
    emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '🥲', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '🥸', '😎', '🤓', '🧐', '😕', '😟', '🙁', '😮', '😯', '😲', '😳', '🥺', '😦', '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣', '😞', '😓', '😩', '😫', '🥱', '😤', '😡', '😠', '🤬', '😈', '👿', '💀', '💩', '🤡', '👹', '👺', '👻', '👽', '👾', '🤖', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾']
  },
  {
    category: 'Animals & Nature',
    emojis: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐽', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒', '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜', '🦟', '🦗', '🕷', '🕸', '🦂', '🐢', '🐍', '🦎', '🦖', '🦕', '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳', '🐋', '🦈', '🐊', '🐅', '🐆', '🦓', '🦍', '🦧', '🐘', '🦛', '🦏', '🐪', '🐫', '🦒', '🦘', '🐃', '🐂', '🐄', '🐎', '🐖', '🐏', '🐑', '🦙', '🐐', '🦌', '🐕', '🐩', '🦮', '🐕‍🦺', '🐈', '🐓', '🦃', '🦚', '🦜', '🦢', '🦩', '🕊', '🐇', '🦝', '🦨', '🦡', '🦦', '🦥', '🐁', '🐀', '🐿', '🦔']
  },
  {
    category: 'Food & Drink',
    emojis: ['🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶', '🫑', '🌽', '🥕', '🫒', '🧄', '🧅', '🥔', '🍠', '🥐', '🥯', '🍞', '🥖', '🥨', '🧀', '🥚', '🍳', '🧈', '🥞', '🧇', '🥓', '🥩', '🍗', '🍖', '🦴', '🌭', '🍔', '🍟', '🍕', '🫓', '🥪', '🥙', '🧆', '🌮', '🌯', '🫔', '🥗', '🥘', '🫕', '🥫', '🍝', '🍜', '🍲', '🍛', '🍣', '🍱', '🥟', '🦪', '🍤', '🍙', '🍚', '🍘', '🍥', '🥠', '🥮', '🍢', '🍡', '🍧', '🍨', '🍦', '🥧', '🧁', '🍰', '🎂', '🍮', '🍭', '🍬', '🍫', '🍿', '🍩', '🍪', '🌰', '🥜', '🍯', '🥛', '🍼', '☕', '🫖', '🍵', '🧃', '🥤', '🧋', '🍶', '🍺', '🍻', '🥂', '🍷', '🥃', '🍸', '🍹', '🧉', '🍾']
  },
  {
    category: 'Activities',
    emojis: ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🪃', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛷', '⛸', '🥌', '🎿', '⛷', '🏂', '🪂', '🏋️‍♀️', '🏋️', '🏋️‍♂️', '🤼‍♀️', '🤼', '🤼‍♂️', '🤸‍♀️', '🤸', '🤸‍♂️', '⛹️‍♀️', '⛹️', '⛹️‍♂️', '🤺', '🤾‍♀️', '🤾', '🤾‍♂️', '🏌️‍♀️', '🏌️', '🏌️‍♂️', '🏇', '🧘‍♀️', '🧘', '🧘‍♂️', '🏄‍♀️', '🏄', '🏄‍♂️', '🏊‍♀️', '🏊', '🏊‍♂️', '🤽‍♀️', '🤽', '🤽‍♂️', '🚣‍♀️', '🚣', '🚣‍♂️', '🧗‍♀️', '🧗', '🧗‍♂️', '🚵‍♀️', '🚵', '🚵‍♂️', '🚴‍♀️', '🚴', '🚴‍♂️', '🏆', '🥇', '🥈', '🥉', '🏅', '🎖', '🏵', '🎗', '🎫', '🎟', '🎪', '🤹‍♀️', '🤹', '🤹‍♂️', '🎭', '🩰', '🎨', '🎬', '🎤', '🎧', '🎼', '🎵', '🎶', '🥁', '🪘', '🎹', '🎻', '🎺', '🎸', '🪕', '🎷', '🎯', '🎳', '🎮', '🎰', '🧩']
  },
  {
    category: 'Travel & Places',
    emojis: ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎', '🚓', '🚑', '🚒', '🚐', '🛻', '🚚', '🚛', '🚜', '🏍', '🛵', '🚲', '🛴', '🛹', '🛼', '🚁', '🛸', '✈️', '🛩', '🛫', '🛬', '🪂', '💺', '🚀', '🛰', '🚉', '🚊', '🚝', '🚞', '🚋', '🚃', '🚟', '🚠', '🚡', '⛴', '🛥', '🚤', '⛵', '🛶', '🚢', '⚓', '⛽', '🚧', '🚦', '🚥', '🗺', '🗿', '🗽', '🗼', '🏰', '🏯', '🏟', '🎡', '🎢', '🎠', '⛲', '⛱', '🏖', '🏝', '🏜', '🌋', '⛰', '🏔', '🗻', '🏕', '⛺', '🛖', '🏠', '🏡', '🏘', '🏚', '🏗', '🏭', '🏢', '🏬', '🏣', '🏤', '🏥', '🏦', '🏨', '🏪', '🏫', '🏩', '💒', '🏛', '⛪', '🕌', '🛕', '🕍', '🕯', '💡', '🔦', '🏮', '🪔', '📱', '💻', '🖥', '🖨', '⌨️', '🖱', '🖲', '💽', '💾', '💿', '📀', '📼', '📷', '📸', '📹', '🎥', '📽', '🎞', '📞', '☎️', '📟', '📠', '📺', '📻', '🎙', '🎚', '🎛', '🧭', '⏱', '⏲', '⏰', '🕰', '⌛', '⏳', '📡', '🔋', '🔌', '💡', '🔦', '🕯', '🪔', '🧯']
  },
  {
    category: 'Objects',
    emojis: ['⌚', '📱', '📲', '💻', '⌨️', '🖥', '🖨', '🖱', '🖲', '🕹', '🗜', '💽', '💾', '💿', '📀', '📼', '📷', '📸', '📹', '🎥', '📽', '🎞', '📞', '☎️', '📟', '📠', '📺', '📻', '🎙', '🎚', '🎛', '⏱', '⏲', '⏰', '🕰', '⌛', '⏳', '📡', '🔋', '🔌', '💡', '🔦', '🕯', '🪔', '🧯', '🛢', '💸', '💵', '💴', '💶', '💷', '💰', '💳', '💎', '⚖️', '🧰', '🔧', '🔨', '⚒', '🛠', '⛏', '🔩', '⚙️', '🧱', '⛓', '🧲', '🔫', '💣', '🧨', '🪓', '🔪', '🗡', '⚔️', '🛡', '🚬', '⚰️', '⚱️', '🏺', '🔮', '📿', '🧿', '💈', '⚗️', '🔭', '🔬', '🕳', '🩹', '🩺', '💊', '💉', '🩸', '🧬', '🦠', '🧫', '🧪', '🌡', '🧹', '🧺', '🧻', '🚽', '🚰', '🚿', '🛁', '🛀', '🧼', '🪥', '🪒', '🧽', '🧴', '🛎', '🔑', '🗝', '🚪', '🪑', '🛋', '🛏', '🛌', '🧸', '🖼', '🛍', '🛒', '🎁', '🎈', '🎏', '🎀', '🎊', '🎉', '🎎', '🏮', '🎐', '🧧', '✉️', '📩', '📨', '📧', '💌', '📥', '📤', '📦', '🏷', '📪', '📫', '📬', '📭', '📮', '📯', '📜', '📃', '📄', '📑', '📊', '📈', '📉', '🗒', '🗓', '📆', '📅', '📇', '🗃', '🗳', '🗄', '📋', '📁', '📂', '🗂', '🗞', '📰', '📓', '📔', '📒', '📕', '📗', '📘', '📙', '📚', '📖', '🔖', '🧷', '🔗', '📎', '🖇', '📐', '📏', '🧮', '📌', '📍', '✂️', '🖊', '🖋', '✒️', '🖌', '🖍', '📝', '✏️', '🔍', '🔎', '🔏', '🔐', '🔒', '🔓']
  },
  {
    category: 'Symbols',
    emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓', '🆔', '⚛️', '🉑', '☢️', '☣️', '📴', '📳', '🈶', '🈚', '🈸', '🈺', '🈷️', '✴️', '🆚', '💮', '🉐', '㊙️', '㊗️', '🈴', '🈵', '🈹', '🈲', '🅰️', '🅱️', '🆎', '🆑', '🅾️', '🆘', '❌', '⭕', '🛑', '⛔', '📛', '🚫', '💯', '💢', '♨️', '🚷', '🚯', '🚳', '🚱', '🔞', '📵', '🚭', '❗', '❕', '❓', '❔', '‼️', '⁉️', '🔅', '🔆', '〽️', '⚠️', '🚸', '🔱', '⚜️', '🔰', '♻️', '✅', '🈯', '💹', '❇️', '✳️', '❎', '🌐', '💠', 'Ⓜ️', '🌀', '💤', '🏧', '🚾', '♿', '🅿️', '🈳', '🈂️', '🛂', '🛃', '🛄', '🛅', '🚹', '🚺', '🚼', '🚻', '🚮', '🎦', '📶', '🈁', '🔣', 'ℹ️', '🔤', '🔡', '🔠', '🆖', '🆗', '🆙', '🆒', '🆕', '🆓', '0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟', '🔢', '#️⃣', '*️⃣', '⏏️', '▶️', '⏸', '⏯', '⏹', '⏺', '⏭', '⏮', '⏩', '⏪', '⏫', '⏬', '◀️', '🔼', '🔽', '➡️', '⬅️', '⬆️', '⬇️', '↗️', '↘️', '↙️', '↖️', '↕️', '↔️', '↩️', '↪️', '⤴️', '⤵️', '🔀', '🔁', '🔂', '🔄', '🔃', '🎵', '🎶', '➕', '➖', '➗', '✖️', '♾', '💲', '💱', '™️', '©️', '®️', '〰️', '➰', '➿', '🔚', '🔙', '🔛', '🔝', '🔜', '✔️', '☑️', '🔘', '⚪', '⚫', '🔴', '🔵', '🔺', '🔻', '🔸', '🔹', '🔶', '🔷', '🔳', '🔲', '▪️', '▫️', '◾', '◽', '◼️', '◻️', '⬛', '⬜', '🔈', '🔇', '🔉', '🔊', '🔔', '🔕', '📣', '📢', '👁‍🗨', '💬', '💭', '🗯', '♠️', '♣️', '♥️', '♦️', '🃏', '🎴', '🀄', '🕐', '🕑', '🕒', '🕓', '🕔', '🕕', '🕖', '🕗', '🕘', '🕙', '🕚', '🕛', '🕜', '🕝', '🕞', '🕟', '🕠', '🕡', '🕢', '🕣', '🕤', '🕥', '🕦', '🕧']
  },
  {
    category: 'Flags',
    emojis: ['🏁', '🚩', '🎌', '🏴', '🏳️', '🏳️‍🌈', '🏳️‍⚧️', '🏴‍☠️', '🇦🇫', '🇦🇽', '🇦🇱', '🇩🇿', '🇦🇸', '🇦🇩', '🇦🇴', '🇦🇮', '🇦🇶', '🇦🇬', '🇦🇷', '🇦🇲', '🇦🇼', '🇦🇺', '🇦🇹', '🇦🇿', '🇧🇸', '🇧🇭', '🇧🇩', '🇧🇧', '🇧🇾', '🇧🇪', '🇧🇿', '🇧🇯', '🇧🇲', '🇧🇹', '🇧🇴', '🇧🇦', '🇧🇼', '🇧🇷', '🇮🇴', '🇻🇬', '🇧🇳', '🇧🇬', '🇧🇫', '🇧🇮', '🇰🇭', '🇨🇲', '🇨🇦', '🇮🇨', '🇨🇻', '🇧🇶', '🇰🇾', '🇨🇫', '🇹🇩', '🇨🇱', '🇨🇳', '🇨🇽', '🇨🇨', '🇨🇴', '🇰🇲', '🇨🇬', '🇨🇩', '🇨🇰', '🇨🇷', '🇨🇮', '🇭🇷', '🇨🇺', '🇨🇼', '🇨🇾', '🇨🇿', '🇩🇰', '🇩🇯', '🇩🇲', '🇩🇴', '🇪🇨', '🇪🇬', '🇸🇻', '🇬🇶', '🇪🇷', '🇪🇪', '🇪🇹', '🇪🇺', '🇫🇰', '🇫🇴', '🇫🇯', '🇫🇮', '🇫🇷', '🇬🇫', '🇵🇫', '🇹🇫', '🇬🇦', '🇬🇲', '🇬🇪', '🇩🇪', '🇬🇭', '🇬🇮', '🇬🇷', '🇬🇱', '🇬🇩', '🇬🇵', '🇬🇺', '🇬🇹', '🇬🇬', '🇬🇳', '🇬🇼', '🇬🇾', '🇭🇹', '🇭🇳', '🇭🇰', '🇭🇺', '🇮🇸', '🇮🇳', '🇮🇩', '🇮🇷', '🇮🇶', '🇮🇪', '🇮🇲', '🇮🇱', '🇮🇹', '🇯🇲', '🇯🇵', '🎌', '🇯🇪', '🇯🇴', '🇰🇿', '🇰🇪', '🇰🇮', '🇽🇰', '🇰🇼', '🇰🇬', '🇱🇦', '🇱🇻', '🇱🇧', '🇱🇸', '🇱🇷', '🇱🇾', '🇱🇮', '🇱🇹', '🇱🇺', '🇲🇴', '🇲🇰', '🇲🇬', '🇲🇼', '🇲🇾', '🇲🇻', '🇲🇱', '🇲🇹', '🇲🇭', '🇲🇶', '🇲🇷', '🇲🇺', '🇾🇹', '🇲🇽', '🇫🇲', '🇲🇩', '🇲🇨', '🇲🇳', '🇲🇪', '🇲🇸', '🇲🇦', '🇲🇿', '🇲🇲', '🇳🇦', '🇳🇷', '🇳🇵', '🇳🇱', '🇳🇨', '🇳🇿', '🇳🇮', '🇳🇪', '🇳🇬', '🇳🇺', '🇳🇫', '🇰🇵', '🇲🇵', '🇳🇴', '🇴🇲', '🇵🇰', '🇵🇼', '🇵🇸', '🇵🇦', '🇵🇬', '🇵🇾', '🇵🇪', '🇵🇭', '🇵🇳', '🇵🇱', '🇵🇹', '🇵🇷', '🇶🇦', '🇷🇪', '🇷🇴', '🇷🇺', '🇷🇼', '🇼🇸', '🇸🇲', '🇸🇹', '🇸🇦', '🇸🇳', '🇷🇸', '🇸🇨', '🇸🇱', '🇸🇬', '🇸🇽', '🇸🇰', '🇸🇮', '🇬🇸', '🇸🇧', '🇸🇴', '🇿🇦', '🇰🇷', '🇸🇸', '🇪🇸', '🇱🇰', '🇧🇱', '🇸🇭', '🇰🇳', '🇱🇨', '🇵🇲', '🇻🇨', '🇸🇩', '🇸🇷', '🇸🇿', '🇸🇪', '🇨🇭', '🇸🇾', '🇹🇼', '🇹🇯', '🇹🇿', '🇹🇭', '🇹🇱', '🇹🇬', '🇹🇰', '🇹🇴', '🇹🇹', '🇹🇳', '🇹🇷', '🇹🇲', '🇹🇨', '🇹🇻', '🇻🇮', '🇺🇬', '🇺🇦', '🇦🇪', '🇬🇧', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', '🏴󠁧󠁢󠁳󠁣󠁴󠁿', '🏴󠁧󠁢󠁷󠁬󠁳󠁿', '🇺🇸', '🇺🇾', '🇺🇿', '🇻🇺', '🇻🇦', '🇻🇪', '🇻🇳', '🇼🇫', '🇪🇭', '🇾🇪', '🇿🇲', '🇿🇼']
  }
];

// Sticker packs - iOS-style animated and static stickers
const stickerPacks = [
  {
    name: 'Classic',
    stickers: ['👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👋', '🤚', '🖐', '✋', '🖖', '👏', '🙌', '🤲', '🤝', '🙏', '✍️', '💪', '🦾', '🦿', '🦵', '🦶']
  },
  {
    name: 'Hearts',
    stickers: ['💖', '💝', '💗', '💓', '💞', '💕', '💘', '💑', '💏', '💋', '🥰', '😍', '🤩', '😘', '😗', '☺️', '😚', '😙', '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💟']
  },
  {
    name: 'Animals',
    stickers: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒', '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉', '🦇', '🐺']
  },
  {
    name: 'Party',
    stickers: ['🎉', '🎊', '🥳', '🎈', '🎂', '🍰', '🧁', '🍾', '🥂', '🍻', '🍺', '🥃', '🍸', '🍹', '🍷', '🥤', '🎁', '🎀', '🏆', '🥇', '🥈', '🥉', '🎖', '🏅', '🎗', '🎟', '🎫', '🎪', '🎭', '🎨']
  },
  {
    name: 'Travel',
    stickers: ['✈️', '🛫', '🛬', '🚗', '🚕', '🚙', '🚌', '🚎', '🏎', '🚓', '🚑', '🚒', '🚐', '🚚', '🚛', '🚜', '🏍', '🛵', '🚲', '🛴', '🛹', '🚁', '🛸', '🚀', '🛰', '⛵', '🛥', '🚤', '⛴', '🚢']
  }
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000', // iOS Messages dark background
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 64,
    backgroundColor: '#000000', // Same as main background
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: tokens.colors.separator,
    paddingHorizontal: 16,
    position: 'relative',
  },
  headerLeft: {
    position: 'absolute',
    left: 1,
    zIndex: 1,
  },
  headerCenter: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 0,
  },
  simpleDropdown: {
    position: 'absolute',
    right: 70,
    top: 20,
    padding: 8,
  },
  headerRight: {
    position: 'absolute',
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  backButton: {
    padding: 0,
  },
  headerAction: {
    padding: 12,
    marginLeft: 8,
  },
  headerTitle: {
    ...tokens.typography.headline,
    color: tokens.colors.onSurface,
    fontWeight: '600',
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '400',
    color: tokens.colors.onSurface60,
    marginTop: 1,
  },
  headerCenterContent: {
    alignItems: 'center',
  },
  headerNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSubtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  newContactIndicator: {
    marginLeft: 4,
    backgroundColor: tokens.colors.primary + '20',
    borderRadius: 8,
    padding: 2,
  },
  content: {
    flex: 1,
    backgroundColor: '#000000', // iOS Messages content background
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  messagesList: {
    flex: 1,
    paddingHorizontal: 8, // iOS Messages horizontal padding
  },
  messagesContent: {
    paddingVertical: 8, // iOS Messages vertical padding
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  messageContainer: {
    marginVertical: 2, // iOS Messages tight spacing
    maxWidth: screenWidth * 0.65, // iOS Messages max width (slightly narrower)
    paddingHorizontal: 8, // iOS Messages side padding
  },
  sentMessage: {
    alignSelf: 'flex-end',
    marginLeft: screenWidth * 0.25, // iOS asymmetric margins
  },
  receivedMessage: {
    alignSelf: 'flex-start',
    marginRight: screenWidth * 0.25, // iOS asymmetric margins
  },
  messageBubble: {
    paddingHorizontal: 14, // iOS Messages padding
    paddingVertical: 8, // iOS Messages padding
    borderRadius: 18, // iOS Messages corner radius
    maxWidth: '100%',
    minHeight: 34, // iOS minimum bubble height
  },
  sentBubble: {
    backgroundColor: tokens.colors.primary, // iOS blue
    borderBottomRightRadius: 4, // iOS tail corner
  },
  receivedBubble: {
    backgroundColor: 'rgba(142, 142, 147, 0.12)', // iOS gray bubble
    borderBottomLeftRadius: 4, // iOS tail corner
  },
  disappearedBubble: {
    backgroundColor: 'rgba(142, 142, 147, 0.08)', // Even more subtle gray
    borderWidth: 1,
    borderColor: 'rgba(142, 142, 147, 0.2)',
    borderStyle: 'dashed',
  },
  disappearedContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  disappearedText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: tokens.colors.onSurface38,
    marginLeft: 6,
  },
  timerIndicator: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: 'rgba(88, 86, 214, 0.8)', // Purple background for timer
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageText: {
    fontSize: 16, // iOS Messages font size
    lineHeight: 20, // iOS Messages line height
    fontFamily: 'System', // iOS system font
    fontWeight: '400',
  },
  sentText: {
    color: '#FFFFFF', // White text on blue background
  },
  receivedText: {
    color: tokens.colors.onSurface, // Dark text on light background
  },
  messageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2, // Tighter spacing like iOS
    paddingHorizontal: 2,
  },
  sentInfo: {
    justifyContent: 'flex-end',
  },
  receivedInfo: {
    justifyContent: 'flex-start',
  },
  timeText: {
    fontSize: 11, // iOS timestamp size
    color: 'rgba(142, 142, 147, 1)', // iOS secondary label color
    fontFamily: 'System', // iOS system font
    fontWeight: '400',
  },
  statusContainer: {
    marginLeft: 4,
  },
  inputContainer: {
    backgroundColor: '#000000', // Pure black like iOS Messages
    paddingTop: 8, // iOS Messages top padding
    paddingBottom: 8, // Minimal safe area bottom padding
    borderTopWidth: StyleSheet.hairlineWidth, // Thin separator line
    borderTopColor: '#38383A', // Subtle gray separator
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center', // Center align all items
    paddingHorizontal: 8, // iOS horizontal padding
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#38383A', // iOS Messages actual input color
    borderRadius: 25, // More curved iOS Messages radius
    paddingLeft: 14, // iOS Messages left padding
    paddingRight: 6, // iOS Messages right padding (less for send button)
    paddingTop: 4, // Top padding
    paddingBottom: 2, // Reduced bottom padding
    minHeight: 30, // Reduced iOS Messages height
  },
  attachButton: {
    width: 30, // iOS plus button size
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8, // Space between plus and input
    borderRadius: 15, // Round border (half of width/height)
    borderWidth: 1,
    borderColor: '#007AFF', // iOS blue border color
  },
  textInput: {
    flex: 1,
    fontSize: 17, // iOS Messages exact font size
    fontFamily: 'System',
    fontWeight: '400',
    color: '#FFFFFF', 
    paddingVertical: 7, // iOS Messages exact padding
    paddingHorizontal: 0,
    textAlignVertical: 'center',
    lineHeight: 22,
    minHeight: 22, // iOS Messages line height
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#007AFF', // iOS blue
    borderRadius: 12, // iOS Messages send button radius
    width: 24, // iOS Messages send button exact size
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6, // iOS spacing
    marginBottom: 1, // Slight alignment adjustment
  },
  sendButtonOutside: {
    // Removed backgroundColor and borderRadius - now handled by headerIconContainer
    width: 40, // Even larger button size
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8, // iOS spacing
    alignSelf: 'center', // Center align with input
  },
  micButtonOutside: {
    // Removed borderRadius and backgroundColor - now handled by headerIconContainer
    width: 40, // Even larger button size
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8, // iOS spacing
    alignSelf: 'center', // Center align with input
    // Removed border properties as well
  },
  emojiButton: {
    padding: 2, // Minimal iOS padding
    marginLeft: 8, // iOS spacing
  },
  timerButton: {
    padding: 4,
    marginLeft: 8,
    backgroundColor: 'rgba(88, 86, 214, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(88, 86, 214, 0.3)',
  },
  timerIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  timerText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#5856D6',
    marginLeft: 3,
  },
  micButton: {
    padding: 2, // Minimal iOS padding
    marginLeft: 8, // iOS spacing
  },
  // Emoji keyboard styles
  emojiKeyboard: {
    height: 280,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: tokens.colors.surface2,
    overflow: 'hidden',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  emojiKeyboardContent: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  emojiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: tokens.colors.surface2,
  },
  emojiHeaderText: {
    fontSize: tokens.typography.h2.fontSize,
    fontFamily: tokens.typography.h2.fontFamily,
    color: tokens.colors.onSurface,
    fontWeight: tokens.typography.h2.fontWeight,
  },
  emojiCloseButton: {
    padding: 8,
  },
  emojiList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  emojiCategoryContainer: {
    marginVertical: 8,
  },
  emojiCategoryTitle: {
    fontSize: tokens.typography.body.fontSize,
    fontFamily: tokens.typography.body.fontFamily,
    color: tokens.colors.onSurface60,
    marginBottom: 8,
    fontWeight: '600',
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  emojiPickerButton: {
    width: '12%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 2,
  },
  emojiText: {
    fontSize: 24,
  },
  // Sticker styles
  stickerContainer: {
    padding: 4,
    borderRadius: 16,
    maxWidth: '100%',
  },
  sentSticker: {
    alignSelf: 'flex-end',
  },
  receivedSticker: {
    alignSelf: 'flex-start',
  },
  stickerText: {
    fontSize: 64,
    textAlign: 'center',
  },
  stickerKeyboard: {
    height: 280,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: tokens.colors.surface2,
    overflow: 'hidden',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  stickerKeyboardContent: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  stickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: tokens.colors.surface2,
  },
  stickerHeaderText: {
    fontSize: tokens.typography.h2.fontSize,
    fontFamily: tokens.typography.h2.fontFamily,
    color: tokens.colors.onSurface,
    fontWeight: tokens.typography.h2.fontWeight,
  },
  stickerCloseButton: {
    padding: 8,
  },
  stickerList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  stickerPackContainer: {
    marginVertical: 8,
  },
  stickerPackTitle: {
    fontSize: tokens.typography.body.fontSize,
    fontFamily: tokens.typography.body.fontFamily,
    color: tokens.colors.onSurface60,
    marginBottom: 8,
    fontWeight: '600',
  },
  stickerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  stickerButton: {
    width: '15%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 2,
    borderRadius: 8,
  },
  stickerItemText: {
    fontSize: 32,
  },
  // Disappearing Messages Banner styles
  disappearingBanner: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 8,
    marginBottom: 4,
  },
  disappearingBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 2,
  },
  disappearingBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  disappearingBannerIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(88, 86, 214, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  disappearingBannerText: {
    flex: 1,
  },
  disappearingBannerTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#5856D6', // Purple color
    marginBottom: 2,
  },
  disappearingBannerSubtitle: {
    fontSize: 13,
    color: 'rgba(88, 86, 214, 0.8)', // Purple with transparency
    lineHeight: 16,
  },
  disappearingBannerButton: {
    backgroundColor: 'rgba(88, 86, 214, 0.8)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(88, 86, 214, 0.9)',
  },
  disappearingBannerButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  disappearingBannerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(116, 79, 245, 0.3)', // Lighter purple overlay
    borderRadius: 12,
  },
  // Toast Notification styles
  toastNotification: {
    position: 'absolute',
    top: 100, // Below the header
    left: 16,
    right: 16,
    zIndex: 1000,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toastIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(88, 86, 214, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  toastText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    flex: 1,
  },
  // Reply styles
  replyContainer: {
    backgroundColor: tokens.colors.surface2,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: tokens.colors.surface3,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  replyContent: {
    flex: 1,
    marginRight: 8,
  },
  replyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  replyLabel: {
    fontSize: tokens.typography.caption.fontSize,
    fontFamily: tokens.typography.caption.fontFamily,
    color: tokens.colors.primary,
    marginLeft: 4,
    fontWeight: '600',
  },
  replyText: {
    fontSize: tokens.typography.body.fontSize,
    fontFamily: tokens.typography.body.fontFamily,
    color: tokens.colors.onSurface60,
    fontStyle: 'italic',
  },
  replyCloseButton: {
    padding: 4,
  },
  // Message indicator styles
  forwardedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    paddingBottom: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: tokens.colors.onSurface38,
  },
  forwardedText: {
    fontSize: tokens.typography.caption.fontSize,
    fontFamily: tokens.typography.caption.fontFamily,
    color: tokens.colors.onSurface60,
    marginLeft: 4,
    fontStyle: 'italic',
  },
  replyIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    paddingBottom: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: tokens.colors.primary,
  },
  replyIndicatorText: {
    fontSize: tokens.typography.caption.fontSize,
    fontFamily: tokens.typography.caption.fontFamily,
    color: tokens.colors.primary,
    marginLeft: 4,
    fontWeight: '600',
  },
  headerDropdown: {
    position: 'absolute',
    top: 80,
    right: 12,
    backgroundColor: tokens.colors.surface2,
    borderRadius: 12,
    paddingVertical: 8,
    minWidth: 180,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 1000,
  },
  nameDropdown: {
    position: 'absolute',
    top: 80,
    left: '50%',
    transform: [{ translateX: -90 }], // Center the dropdown (half of 180px width)
    backgroundColor: tokens.colors.surface2,
    borderRadius: 12,
    paddingVertical: 8,
    minWidth: 180,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 1000,
  },
  nameDropdownModal: {
    position: 'absolute',
    top: 64 + StyleSheet.hairlineWidth, // Header height + separator line
    left: 0,
    right: 0,
    backgroundColor: tokens.colors.surface2,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    zIndex: 1000,
  },
  nameDropdownModalInline: {
    backgroundColor: tokens.colors.surface2,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 0,
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    zIndex: 1000,
    marginHorizontal: 0,
  },
  fullScreenOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 999,
  },
  modalDropdownContent: {
    paddingHorizontal: 0,
  },
  modalDropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 52,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: tokens.colors.separator,
  },
  modalDropdownItemLast: {
    borderBottomWidth: 0,
  },
  modalDropdownIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: tokens.colors.surface1,
    marginRight: 12,
  },
  modalDropdownTextContent: {
    flex: 1,
    justifyContent: 'center',
  },
  modalDropdownText: {
    fontSize: 15,
    fontWeight: '600',
    color: tokens.colors.onSurface,
    marginBottom: 1,
  },
  modalDropdownSubtext: {
    fontSize: 12,
    fontWeight: '400',
    color: tokens.colors.onSurface60,
  },
  modalDropdownSeparator: {
    height: 6,
    backgroundColor: tokens.colors.surface1,
    marginVertical: 2,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  dropdownText: {
    fontSize: 16,
    color: tokens.colors.onSurface,
    fontWeight: '500',
  },
  dropdownSeparator: {
    height: 1,
    backgroundColor: tokens.colors.onSurface38,
    marginVertical: 4,
    marginHorizontal: 16,
  },
  dropdownOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  uploadOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 1998,
  },
  // Upload keyboard styles (like emoji keyboard)
  uploadKeyboard: {
    height: 240,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: tokens.colors.surface2,
    overflow: 'hidden',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  uploadKeyboardContent: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  uploadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: tokens.colors.surface2,
  },
  uploadHeaderText: {
    ...tokens.typography.h3,
    color: tokens.colors.onSurface,
    fontWeight: '600',
  },
  uploadCloseButton: {
    padding: 4,
  },
  uploadOptions: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  uploadGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingVertical: 8,
  },
  uploadGridItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '22%',
    marginVertical: 8,
  },
  uploadIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  uploadGridText: {
    ...tokens.typography.caption,
    color: tokens.colors.onSurface,
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
  uploadMenu: {
    position: 'absolute',
    bottom: 140,
    left: 20,
    backgroundColor: tokens.colors.surface2,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 1999,
  },
  uploadOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginVertical: 2,
    borderRadius: 8,
  },
  uploadIconContainer: {
    // Removed background and border radius - now handled by headerIconContainer
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  uploadOptionText: {
    fontSize: 16,
    color: tokens.colors.onSurface,
    fontWeight: '500',
  },
  micButtonRecording: {
    backgroundColor: tokens.colors.error + '20',
    borderColor: tokens.colors.error,
    borderWidth: 2,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.colors.surface2,
    marginHorizontal: 16,
    marginBottom: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  recordingWave: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    gap: 3,
  },
  waveBar: {
    width: 3,
    height: 16,
    backgroundColor: tokens.colors.error,
    borderRadius: 1.5,
  },
  recordingIndicatorInline: {
    marginLeft: 8,
    alignSelf: 'center',
  },
  recordingWaveInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  waveBarSmall: {
    width: 2,
    height: 8,
    backgroundColor: tokens.colors.error,
    borderRadius: 1,
  },
  recordingText: {
    flex: 1,
    fontSize: 14,
    color: tokens.colors.error,
    fontWeight: '600',
    marginLeft: 8,
  },
  cancelRecordingButton: {
    padding: 8,
    borderRadius: 16,
    backgroundColor: tokens.colors.error + '20',
  },
  // Profile Sheet Styles
  profileSheetContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  profileSheetContent: {
    flex: 1,
    backgroundColor: tokens.colors.bg,
  },
  profileSheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing.m,
    paddingVertical: tokens.spacing.s,
    borderBottomWidth: 0.5,
    borderBottomColor: tokens.colors.separator,
  },
  profileSheetCloseButton: {
    padding: tokens.spacing.s,
    borderRadius: 20,
    backgroundColor: tokens.colors.surface1,
  },
  profileSheetTitle: {
    ...tokens.typography.h3,
    color: tokens.colors.onSurface,
    fontWeight: '600',
    textAlign: 'center',
    flex: 1,
  },
  profileSheetHeaderSpacer: {
    width: 40, // Same width as close button
  },
  profileSheetMainSection: {
    alignItems: 'center',
    paddingVertical: tokens.spacing.m, // Further reduced from l
    paddingHorizontal: tokens.spacing.m,
  },
  profileSheetAvatar: {
    width: 90, // Further reduced from 100
    height: 90, // Further reduced from 100
    borderRadius: 45, // Further reduced from 50
    backgroundColor: tokens.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6, // Further reduced from tokens.spacing.s
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  profileSheetAvatarText: {
    fontSize: 36, // Further reduced from 40
    fontWeight: '600',
    color: '#FFFFFF',
  },
  profileSheetName: {
    ...tokens.typography.h2,
    color: tokens.colors.onSurface,
    fontWeight: '600',
    marginBottom: 2, // Further reduced from tokens.spacing.xs
    textAlign: 'center',
  },
  profileSheetStatus: {
    ...tokens.typography.body,
    color: tokens.colors.onSurface60,
    textAlign: 'center',
  },
  profileSheetActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: tokens.spacing.m, // Further reduced from l
    paddingVertical: tokens.spacing.s, // Further reduced from m
    borderBottomWidth: 0.5,
    borderBottomColor: tokens.colors.separator,
  },
  profileSheetActionButton: {
    alignItems: 'center',
    minWidth: 50, // Reduced from 60
  },
  profileSheetActionIcon: {
    width: 42, // Further reduced from 48
    height: 42, // Further reduced from 48
    borderRadius: 21, // Further reduced from 24
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4, // Further reduced from tokens.spacing.xs
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  profileSheetActionText: {
    ...tokens.typography.caption,
    color: tokens.colors.onSurface,
    fontWeight: '500',
    textAlign: 'center',
  },
  profileSheetScroll: {
    flex: 1,
  },
  profileSheetSection: {
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  profileSheetSectionTitle: {
    fontSize: 13,
    fontWeight: '400',
    color: tokens.colors.onSurface60,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 4, // Further reduced from 6
    marginTop: 16, // Further reduced from 24
    marginLeft: 32,
  },
  profileSheetInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8, // Further reduced from 10
    paddingHorizontal: 16,
    backgroundColor: 'transparent',
    minHeight: 36, // Further reduced from 40
  },
  profileSheetInfoContent: {
    marginLeft: 10, // Reduced from 12
    flex: 1,
  },
  profileSheetInfoLabel: {
    fontSize: 16, // Reduced from 17
    color: tokens.colors.onSurface,
    fontWeight: '400',
  },
  profileSheetInfoValue: {
    fontSize: 15, // Reduced from 17
    color: tokens.colors.onSurface60,
    marginTop: 1,
  },
  profileSheetInfoSubtext: {
    fontSize: 14, // Reduced from 15
    color: tokens.colors.onSurface60,
    marginTop: 1,
  },
  // Bio and Save Contact Styles
  newContactNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.primary + '15',
    paddingHorizontal: 10, // Reduced from 12
    paddingVertical: 4, // Reduced from 6
    borderRadius: 16,
    marginTop: 6, // Reduced from 8
  },
  newContactNoticeText: {
    ...tokens.typography.caption,
    color: tokens.colors.primary,
    fontWeight: '600',
    marginLeft: 4,
  },
  bioSection: {
    marginTop: 6, // Further reduced from 8
    paddingHorizontal: 16, // Reduced from 20
    alignItems: 'center',
  },
  bioText: {
    ...tokens.typography.body,
    color: tokens.colors.onSurface60,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 16, // Further reduced from 18
    fontSize: 13, // Further reduced from 14
  },
  saveContactBanner: {
    backgroundColor: tokens.colors.primary + '10',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: tokens.colors.primary + '20',
    paddingVertical: 6, // Further reduced from 8
    paddingHorizontal: 16,
  },
  saveContactContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  saveContactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  saveContactTitle: {
    ...tokens.typography.body,
    color: tokens.colors.onSurface,
    fontWeight: '500',
    marginLeft: 8,
  },
  saveContactButton: {
    backgroundColor: tokens.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 16,
  },
  saveContactButtonText: {
    ...tokens.typography.body,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  // Full-screen profile sheet styles
  profileSheetFullContainer: {
    flex: 1,
    backgroundColor: tokens.colors.bg,
  },
  profileSheetFullContent: {
    flex: 1,
  },
  profileSheetDynamicHeaderSafe: {
    backgroundColor: tokens.colors.bg,
  },
  profileSheetDynamicHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12, // Reduced from 16
    backgroundColor: tokens.colors.bg,
    minHeight: 56, // Reduced from 60
  },
  profileSheetHeaderLeft: {
    flex: 1,
    alignItems: 'flex-start',
  },
  profileSheetHeaderCenter: {
    flex: 2,
    alignItems: 'center',
  },
  profileSheetHeaderRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  profileSheetBackButton: {
    padding: 8,
  },
  profileSheetDynamicTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: tokens.colors.onSurface,
  },
  profileSheetEditButton: {
    padding: 8,
  },
  profileSheetEditButtonText: {
    fontSize: 16,
    color: tokens.colors.primary,
    fontWeight: '600',
  },
  // Apple-style card components
  profileSheetCard: {
    backgroundColor: tokens.colors.surface1,
    borderRadius: 10,
    marginHorizontal: 16,
    marginVertical: 3, // Further reduced from 6
    overflow: 'hidden',
    ...tokens.elevation.small,
  },
  firstCardItem: {
    // No additional border radius - card handles it
  },
  lastCardItem: {
    // No additional border radius - card handles it
  },
  cardSeparator: {
    height: 0.33,
    backgroundColor: tokens.colors.separator,
    marginLeft: 50, // Reduced from 52 to align with smaller icon spacing
  },
});

export default ChatRoomScreen;
