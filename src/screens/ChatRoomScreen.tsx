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
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Audio } from 'expo-av';
import { BlurView } from 'expo-blur';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MotiView } from 'moti';
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
import { ChatsStackParamList } from '../navigation/types';

type ChatRoomScreenRouteProp = RouteProp<ChatsStackParamList, 'ChatRoom'>;
type ChatRoomScreenNavigationProp = StackNavigationProp<ChatsStackParamList, 'ChatRoom'>;

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
                      {message.sticker ? (
                        <View style={[
                          styles.stickerContainer,
                          message.isSent ? styles.sentSticker : styles.receivedSticker,
                        ]}>
                          <Text style={styles.stickerText}>{message.sticker}</Text>
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
};const ChatRoomScreen: React.FC<Props> = ({ route, navigation }) => {
  const { userName, chatId } = route.params;
  const [message, setMessage] = useState('');
  const [showEmojiKeyboard, setShowEmojiKeyboard] = useState(false);
  const [showStickerPack, setShowStickerPack] = useState(false);
  const [keyboardMode, setKeyboardMode] = useState<'text' | 'emoji' | 'sticker'>('text');
  const [showUploadMenu, setShowUploadMenu] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
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
    setShowUploadMenu(!showUploadMenu);
    setShowEmojiKeyboard(false);
    setShowStickerPack(false);
  };

  const handleImagePicker = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setShowUploadMenu(false);

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
    if (keyboardMode === 'emoji') {
      // Hide emoji keyboard and show regular keyboard
      setShowEmojiKeyboard(false);
      setShowStickerPack(false);
      setKeyboardMode('text');
      textInputRef.current?.focus();
    } else {
      // Hide regular keyboard and show emoji keyboard
      Keyboard.dismiss();
      setTimeout(() => {
        setShowEmojiKeyboard(true);
        setShowStickerPack(false);
        setKeyboardMode('emoji');
      }, 100);
    }
  };

  const toggleStickerPack = () => {
    if (keyboardMode === 'sticker') {
      // Hide sticker pack and show regular keyboard
      setShowEmojiKeyboard(false);
      setShowStickerPack(false);
      setKeyboardMode('text');
      textInputRef.current?.focus();
    } else {
      // Hide regular keyboard and show sticker pack
      Keyboard.dismiss();
      setTimeout(() => {
        setShowEmojiKeyboard(false);
        setShowStickerPack(true);
        setKeyboardMode('sticker');
      }, 100);
    }
  };

  const insertEmoji = (emoji: string) => {
    setMessage(prev => prev + emoji);
  };

  const insertSticker = (sticker: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      sticker,
      timestamp: new Date(),
      isSent: true,
      isDelivered: true,
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

    // Hide sticker pack after sending
    setShowStickerPack(false);
    setKeyboardMode('text');
  };

  const sendMessage = () => {
    if (message.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: replyToMessage 
          ? `Replying to "${replyToMessage.sticker || replyToMessage.text}": ${message.trim()}`
          : message.trim(),
        timestamp: new Date(),
        isSent: true,
        isDelivered: true,
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
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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

        {showNameDropdown && (
          <>
            <TouchableWithoutFeedback onPress={toggleNameDropdown}>
              <View style={styles.dropdownOverlay} />
            </TouchableWithoutFeedback>
            <MotiView
              from={{ opacity: 0, translateY: -10 }}
              animate={{ opacity: 1, translateY: 0 }}
              exit={{ opacity: 0, translateY: -10 }}
              transition={{ duration: 200 }}
              style={styles.nameDropdown}
            >
              <TouchableOpacity style={styles.dropdownItem} onPress={handleContactInfo}>
                <View style={styles.headerIconContainer}>
                  <MaterialIcon name="account-circle" size={20} color="#007AFF" />
                </View>
                <Text style={styles.dropdownText}>Contact Info</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.dropdownItem} onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowNameDropdown(false);
                Alert.alert('Audio Call', `Call ${userName}?`, [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Call', onPress: () => console.log('Audio call started') }
                ]);
              }}>
                <View style={styles.headerIconContainer}>
                  <MaterialIcon name="phone" size={20} color="#34C759" />
                </View>
                <Text style={styles.dropdownText}>Audio Call</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.dropdownItem} onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowNameDropdown(false);
                Alert.alert('Video Call', `Start video call with ${userName}?`, [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Call', onPress: () => console.log('Video call started') }
                ]);
              }}>
                <View style={styles.headerIconContainer}>
                  <MaterialIcon name="videocam" size={20} color="#007AFF" />
                </View>
                <Text style={styles.dropdownText}>Video Call</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.dropdownItem} onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowNameDropdown(false);
                Alert.alert('Search Chat', 'Search in conversation...');
              }}>
                <View style={styles.headerIconContainer}>
                  <MaterialIcon name="search" size={20} color="#FF9500" />
                </View>
                <Text style={styles.dropdownText}>Search Chat</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.dropdownItem} onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowNameDropdown(false);
                Alert.alert('Media Gallery', 'View shared photos and videos');
              }}>
                <View style={styles.headerIconContainer}>
                  <MaterialIcon name="photo-library" size={20} color="#5856D6" />
                </View>
                <Text style={styles.dropdownText}>Media & Files</Text>
              </TouchableOpacity>
              
              <View style={styles.dropdownSeparator} />
              
              <TouchableOpacity style={styles.dropdownItem} onPress={handleMuteChat}>
                <View style={styles.headerIconContainer}>
                  <MaterialIcon name="volume-off" size={20} color="#8E8E93" />
                </View>
                <Text style={styles.dropdownText}>Mute Notifications</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.dropdownItem} onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowNameDropdown(false);
                Alert.alert('Pin Chat', 'Pin this chat to the top of your conversations?', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Pin', onPress: () => console.log('Chat pinned') }
                ]);
              }}>
                <View style={styles.headerIconContainer}>
                  <MaterialIcon name="push-pin" size={20} color="#FF9500" />
                </View>
                <Text style={styles.dropdownText}>Pin Chat</Text>
              </TouchableOpacity>
              
              <View style={styles.dropdownSeparator} />
              
              <TouchableOpacity style={styles.dropdownItem} onPress={handleClearChat}>
                <View style={styles.headerIconContainer}>
                  <MaterialIcon name="delete-sweep" size={20} color="#FF9500" />
                </View>
                <Text style={styles.dropdownText}>Clear Chat</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.dropdownItem} onPress={handleBlockUser}>
                <View style={styles.headerIconContainer}>
                  <MaterialIcon name="block" size={20} color={tokens.colors.error} />
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

        <View style={styles.inputContainer}>
          <View style={styles.inputRow}>
            <TouchableOpacity style={styles.attachButton} onPress={toggleUploadMenu}>
              <View style={styles.headerIconContainer}>
                <MaterialIcon name="add" size={18} color="#007AFF" />
              </View>
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
              onPress={toggleStickerPack}
              activeOpacity={0.7}
            >
              <View style={styles.headerIconContainer}>
                <MaterialIcon 
                  name={keyboardMode === 'sticker' ? "keyboard" : "sticker-emoji"} 
                  size={24} 
                  color="#007AFF" 
                />
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.emojiButton}
              onPress={toggleEmojiKeyboard}
              activeOpacity={0.7}
            >
              <View style={styles.headerIconContainer}>
                <MaterialIcon 
                  name={keyboardMode === 'emoji' ? "keyboard" : "emoticon-outline"} 
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
          <>
            <TouchableWithoutFeedback onPress={toggleUploadMenu}>
              <View style={styles.uploadOverlay} />
            </TouchableWithoutFeedback>
            <MotiView
              from={{ opacity: 0, scale: 0.8, translateY: 20 }}
              animate={{ opacity: 1, scale: 1, translateY: 0 }}
              exit={{ opacity: 0, scale: 0.8, translateY: 20 }}
              transition={{ duration: 200 }}
              style={styles.uploadMenu}
            >
              <TouchableOpacity style={styles.uploadOption} onPress={handleCamera}>
                <View style={styles.headerIconContainer}>
                  <MaterialIcon name="camera" size={24} color="#007AFF" />
                </View>
                <Text style={styles.uploadOptionText}>Camera</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.uploadOption} onPress={handleImagePicker}>
                <View style={styles.headerIconContainer}>
                  <MaterialIcon name="image" size={24} color="#007AFF" />
                </View>
                <Text style={styles.uploadOptionText}>Gallery</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.uploadOption} onPress={handleDocumentPicker}>
                <View style={styles.headerIconContainer}>
                  <MaterialIcon name="file-document" size={24} color="#007AFF" />
                </View>
                <Text style={styles.uploadOptionText}>Document</Text>
              </TouchableOpacity>
            </MotiView>
          </>
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
        presentationStyle="pageSheet"
        onRequestClose={() => setShowProfileSheet(false)}
      >
        <BlurView intensity={100} style={styles.profileSheetContainer}>
          <SafeAreaView style={styles.profileSheetContent}>
            {/* Header */}
            <View style={styles.profileSheetHeader}>
              <TouchableOpacity
                style={styles.profileSheetCloseButton}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setShowProfileSheet(false);
                }}
              >
                <MaterialIcon name="close" size={24} color={tokens.colors.onSurface} />
              </TouchableOpacity>
              <Text style={styles.profileSheetTitle}>Contact Info</Text>
              <View style={styles.profileSheetHeaderSpacer} />
            </View>

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

            {/* Action Buttons */}
            <View style={styles.profileSheetActions}>
              <TouchableOpacity 
                style={styles.profileSheetActionButton}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  Alert.alert('Audio Call', `Calling ${userName}...`);
                }}
              >
                <View style={[styles.profileSheetActionIcon, { backgroundColor: '#34C759' }]}>
                  <MaterialIcon name="phone" size={24} color="#FFFFFF" />
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
                  <MaterialIcon name="videocam" size={24} color="#FFFFFF" />
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
                  <MaterialIcon name="search" size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.profileSheetActionText}>Search</Text>
              </TouchableOpacity>
            </View>

            {/* Info Sections */}
            <ScrollView style={styles.profileSheetScroll} showsVerticalScrollIndicator={false}>
              {/* Chat Actions */}
              <View style={styles.profileSheetSection}>
                <Text style={styles.profileSheetSectionTitle}>Chat Actions</Text>
                
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
                
                <TouchableOpacity 
                  style={styles.profileSheetInfoItem}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    Alert.alert('Search Chat', 'Search in conversation...');
                  }}
                >
                  <MaterialIcon name="search" size={20} color={tokens.colors.primary} />
                  <View style={styles.profileSheetInfoContent}>
                    <Text style={styles.profileSheetInfoLabel}>Search in Chat</Text>
                  </View>
                  <MaterialIcon name="chevron-right" size={16} color={tokens.colors.onSurface60} />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.profileSheetInfoItem}
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

              {/* Contact Details */}
              <View style={styles.profileSheetSection}>
                <Text style={styles.profileSheetSectionTitle}>About</Text>
                
                <TouchableOpacity 
                  style={styles.profileSheetInfoItem}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setShowProfileSheet(false);
                    // Navigate to ContactBioEdit screen
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
              </View>

              {/* Contact Details */}
              <View style={styles.profileSheetSection}>
                <Text style={styles.profileSheetSectionTitle}>Contact Details</Text>
                <TouchableOpacity 
                  style={styles.profileSheetInfoItem}
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
                
                <TouchableOpacity 
                  style={styles.profileSheetInfoItem}
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
                
                <TouchableOpacity 
                  style={styles.profileSheetInfoItem}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    Alert.alert('Location', 'View location details');
                  }}
                >
                  <MaterialIcon name="location-on" size={20} color={tokens.colors.onSurface60} />
                  <View style={styles.profileSheetInfoContent}>
                    <Text style={styles.profileSheetInfoLabel}>Location</Text>
                    <Text style={styles.profileSheetInfoValue}>San Francisco, CA</Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Preferences */}
              <View style={styles.profileSheetSection}>
                <Text style={styles.profileSheetSectionTitle}>Chat Preferences</Text>
                
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
                
                <TouchableOpacity 
                  style={styles.profileSheetInfoItem}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    Alert.alert('Custom Ringtone', 'Choose a ringtone for this contact');
                  }}
                >
                  <MaterialIcon name="music-note" size={20} color={tokens.colors.onSurface60} />
                  <View style={styles.profileSheetInfoContent}>
                    <Text style={styles.profileSheetInfoLabel}>Custom Ringtone</Text>
                    <Text style={styles.profileSheetInfoSubtext}>Default</Text>
                  </View>
                  <MaterialIcon name="chevron-right" size={16} color={tokens.colors.onSurface60} />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.profileSheetInfoItem}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    Alert.alert('Wallpaper', 'Set chat wallpaper');
                  }}
                >
                  <MaterialIcon name="wallpaper" size={20} color={tokens.colors.onSurface60} />
                  <View style={styles.profileSheetInfoContent}>
                    <Text style={styles.profileSheetInfoLabel}>Wallpaper</Text>
                    <Text style={styles.profileSheetInfoSubtext}>None</Text>
                  </View>
                  <MaterialIcon name="chevron-right" size={16} color={tokens.colors.onSurface60} />
                </TouchableOpacity>
              </View>

              {/* Security */}
              <View style={styles.profileSheetSection}>
                <Text style={styles.profileSheetSectionTitle}>Security</Text>
                
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
                
                <TouchableOpacity 
                  style={styles.profileSheetInfoItem}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    Alert.alert('Disappearing Messages', 'Set messages to disappear after a certain time');
                  }}
                >
                  <MaterialIcon name="timer" size={20} color={tokens.colors.onSurface60} />
                  <View style={styles.profileSheetInfoContent}>
                    <Text style={styles.profileSheetInfoLabel}>Disappearing Messages</Text>
                    <Text style={styles.profileSheetInfoSubtext}>Off</Text>
                  </View>
                  <MaterialIcon name="chevron-right" size={16} color={tokens.colors.onSurface60} />
                </TouchableOpacity>
              </View>

              {/* Export & Backup */}
              <View style={styles.profileSheetSection}>
                <Text style={styles.profileSheetSectionTitle}>Data & Storage</Text>
                
                <TouchableOpacity 
                  style={styles.profileSheetInfoItem}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    Alert.alert('Export Chat', 'Export chat history to email or save to files');
                  }}
                >
                  <MaterialIcon name="download" size={20} color={tokens.colors.primary} />
                  <View style={styles.profileSheetInfoContent}>
                    <Text style={styles.profileSheetInfoLabel}>Export Chat</Text>
                  </View>
                  <MaterialIcon name="chevron-right" size={16} color={tokens.colors.onSurface60} />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.profileSheetInfoItem}
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

              {/* Contact Management */}
              <View style={styles.profileSheetSection}>
                <Text style={styles.profileSheetSectionTitle}>Contact Management</Text>
                
                {!isContactSaved ? (
                  // Show "Add to Contacts" for new contacts
                  <TouchableOpacity 
                    style={styles.profileSheetInfoItem}
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
                      <Text style={styles.profileSheetInfoSubtext}>Save this contact to your address book</Text>
                    </View>
                    <MaterialIcon name="chevron-right" size={16} color={tokens.colors.onSurface60} />
                  </TouchableOpacity>
                ) : (
                  // Show "Edit Contact" for saved contacts
                  <TouchableOpacity 
                    style={styles.profileSheetInfoItem}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      Alert.alert('Edit Contact', 'Edit contact information and settings');
                    }}
                  >
                    <MaterialIcon name="edit" size={20} color={tokens.colors.onSurface60} />
                    <View style={styles.profileSheetInfoContent}>
                      <Text style={styles.profileSheetInfoLabel}>Edit Contact</Text>
                      <Text style={styles.profileSheetInfoSubtext}>Modify contact details</Text>
                    </View>
                    <MaterialIcon name="chevron-right" size={16} color={tokens.colors.onSurface60} />
                  </TouchableOpacity>
                )}
                
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
                    <Text style={styles.profileSheetInfoSubtext}>Send contact info to others</Text>
                  </View>
                  <MaterialIcon name="chevron-right" size={16} color={tokens.colors.onSurface60} />
                </TouchableOpacity>
                
                {isContactSaved && (
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
                )}
              </View>

              {/* Privacy Settings */}
              <View style={styles.profileSheetSection}>
                <Text style={styles.profileSheetSectionTitle}>Privacy & Support</Text>
                
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
                
                <TouchableOpacity 
                  style={styles.profileSheetInfoItem}
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
              </View>
            </ScrollView>
          </SafeAreaView>
        </BlurView>
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
    // Removed all styling - now handled by headerIconContainer
    width: 30, // iOS plus button size
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8, // Space between plus and input
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
    paddingVertical: tokens.spacing.xl,
    paddingHorizontal: tokens.spacing.m,
  },
  profileSheetAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: tokens.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: tokens.spacing.m,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  profileSheetAvatarText: {
    fontSize: 48,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  profileSheetName: {
    ...tokens.typography.h2,
    color: tokens.colors.onSurface,
    fontWeight: '600',
    marginBottom: tokens.spacing.xs,
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
    paddingHorizontal: tokens.spacing.xl,
    paddingVertical: tokens.spacing.l,
    borderBottomWidth: 0.5,
    borderBottomColor: tokens.colors.separator,
  },
  profileSheetActionButton: {
    alignItems: 'center',
    minWidth: 60,
  },
  profileSheetActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: tokens.spacing.s,
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
    paddingHorizontal: tokens.spacing.m,
    paddingVertical: tokens.spacing.l,
  },
  profileSheetSectionTitle: {
    ...tokens.typography.h3,
    color: tokens.colors.onSurface,
    fontWeight: '600',
    fontSize: 18,
    marginBottom: tokens.spacing.m,
  },
  profileSheetInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: tokens.spacing.m,
    borderBottomWidth: 0.5,
    borderBottomColor: tokens.colors.separator,
  },
  profileSheetInfoContent: {
    marginLeft: tokens.spacing.m,
    flex: 1,
  },
  profileSheetInfoLabel: {
    ...tokens.typography.body,
    color: tokens.colors.onSurface,
    fontWeight: '500',
    marginBottom: 2,
  },
  profileSheetInfoValue: {
    ...tokens.typography.caption,
    color: tokens.colors.onSurface60,
  },
  profileSheetInfoSubtext: {
    ...tokens.typography.caption,
    color: tokens.colors.onSurface60,
    fontSize: 13,
  },
  // Bio and Save Contact Styles
  newContactNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.primary + '15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 8,
  },
  newContactNoticeText: {
    ...tokens.typography.caption,
    color: tokens.colors.primary,
    fontWeight: '600',
    marginLeft: 4,
  },
  bioSection: {
    marginTop: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  bioText: {
    ...tokens.typography.body,
    color: tokens.colors.onSurface60,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  saveContactBanner: {
    backgroundColor: tokens.colors.primary + '10',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: tokens.colors.primary + '20',
    paddingVertical: 12,
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
});

export default ChatRoomScreen;
