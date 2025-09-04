import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  View, 
  StyleSheet, 
  FlatList, 
  TextInput,
  KeyboardAvoidingView, 
  Platform,
  Animated,
  TouchableOpacity,
  Modal,
  Pressable,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView
} from 'react-native';
import { Text, IconButton, Surface } from 'react-native-paper';
import { MotiView } from 'moti';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
// Temporarily comment out gesture handler to test hooks
// import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';

import { tokens } from '../theme/tokens';
import { ChatsStackParamList } from '../navigation/types';
import { DynamicHeader, BirdCard, Avatar, AnimatedFloatingLabel, MaterialIcon, MediaViewer } from '../components';

type ChatRoomNavigationProp = StackNavigationProp<ChatsStackParamList, 'ChatRoom'>;
type ChatRoomRouteProp = RouteProp<ChatsStackParamList, 'ChatRoom'>;

interface Message {
  id: string;
  text: string;
  timestamp: Date;
  isOwn: boolean;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  reactions: string[];
  replyTo?: string;
  imageUri?: string;
  imageCaption?: string;
}

const reactionEmojis = ['👍', '❤️', '😂', '😮', '😢', '😡'];

export const ChatRoomScreen: React.FC = () => {
  const navigation = useNavigation<ChatRoomNavigationProp>();
  const route = useRoute<ChatRoomRouteProp>();
  const { userName } = route.params;
  const scrollYRef = useRef(0);
  const [scrollPosition, setScrollPosition] = React.useState(0);
  
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(true); // Demo typing indicator
  const [showReactions, setShowReactions] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [mediaViewerVisible, setMediaViewerVisible] = useState(false);
  const [selectedMediaUri, setSelectedMediaUri] = useState<string>('');
  const [selectedMediaCaption, setSelectedMediaCaption] = useState<string>('');
  const [isShaking, setIsShaking] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(userName);
  const [editedAbout, setEditedAbout] = useState("Passionate about technology and innovation. Love exploring new ideas and connecting with people.");
  const animatedScrollPosition = useRef(new Animated.Value(0)).current;

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    scrollYRef.current = currentScrollY;
    setScrollPosition(currentScrollY);
  }, []);
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hey! How are you doing?',
      timestamp: new Date(Date.now() - 7200000), // 2 hours ago
      isOwn: false,
      status: 'read',
      reactions: ['👍'],
    },
    {
      id: '2',
      text: "I'm doing great! Thanks for asking 😊",
      timestamp: new Date(Date.now() - 7000000),
      isOwn: true,
      status: 'read',
      reactions: [],
    },
    {
      id: '3',
      text: 'Want to grab coffee this weekend?',
      timestamp: new Date(Date.now() - 6800000),
      isOwn: false,
      status: 'read',
      reactions: ['☕', '❤️'],
    },
    {
      id: '4',
      text: 'Absolutely! I know this amazing new place downtown',
      timestamp: new Date(Date.now() - 6600000),
      isOwn: true,
      status: 'read',
      reactions: [],
    },
    {
      id: '5',
      text: 'Perfect! What time works for you? I was thinking around 10 AM?',
      timestamp: new Date(Date.now() - 6400000),
      isOwn: false,
      status: 'read',
      reactions: [],
    },
    {
      id: '6',
      text: 'That sounds perfect! See you there 👋',
      timestamp: new Date(Date.now() - 6200000),
      isOwn: true,
      status: 'read',
      reactions: ['👋'],
    },
    {
      id: '6.5',
      text: 'Check out this cool cafe I found!',
      imageUri: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400',
      imageCaption: 'This new coffee shop downtown looks amazing!',
      timestamp: new Date(Date.now() - 6100000),
      isOwn: false,
      status: 'read',
      reactions: ['😍', '☕'],
    },
    {
      id: '7',
      text: 'By the way, did you see the new movie that came out last week?',
      timestamp: new Date(Date.now() - 3600000), // 1 hour ago
      isOwn: false,
      status: 'read',
      reactions: [],
    },
    {
      id: '8',
      text: 'Not yet! Is it good? I was planning to watch it this weekend',
      timestamp: new Date(Date.now() - 3400000),
      isOwn: true,
      status: 'read',
      reactions: [],
    },
    {
      id: '9',
      text: 'It\'s amazing! The plot twists are incredible. No spoilers though 🤐',
      timestamp: new Date(Date.now() - 3200000),
      isOwn: false,
      status: 'read',
      reactions: ['😂', '🤐'],
    },
    {
      id: '10',
      text: 'Haha thanks for not spoiling it! Maybe we can discuss it after coffee on Saturday?',
      timestamp: new Date(Date.now() - 3000000),
      isOwn: true,
      status: 'read',
      reactions: [],
    },
    {
      id: '11',
      text: 'Deal! I love discussing movies. This one really made me think',
      timestamp: new Date(Date.now() - 2800000),
      isOwn: false,
      status: 'read',
      reactions: [],
    },
    {
      id: '12',
      text: 'Same here! I love films that challenge your perspective',
      timestamp: new Date(Date.now() - 2600000),
      isOwn: true,
      status: 'read',
      reactions: ['🎬'],
    },
    {
      id: '13',
      text: 'Oh, and bring your camera! The coffee shop has this gorgeous wall mural',
      timestamp: new Date(Date.now() - 1800000), // 30 min ago
      isOwn: false,
      status: 'read',
      reactions: [],
    },
    {
      id: '14',
      text: 'Good idea! I\'ve been wanting to take more photos lately 📸',
      timestamp: new Date(Date.now() - 1600000),
      isOwn: true,
      status: 'read',
      reactions: ['📸'],
    },
    {
      id: '14.5',
      text: 'Here\'s a preview of my latest shot!',
      imageUri: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
      imageCaption: 'Golden hour at the park yesterday - loving these warm tones!',
      timestamp: new Date(Date.now() - 1500000),
      isOwn: true,
      status: 'read',
      reactions: ['😍', '📸', '🌅'],
    },
    {
      id: '15',
      text: 'Perfect! It\'s going to be such a fun day. Can\'t wait! 🌟',
      timestamp: new Date(Date.now() - 1400000),
      isOwn: false,
      status: 'read',
      reactions: ['🌟', '❤️'],
    },
    {
      id: '16',
      text: 'Me too! Thanks for planning this out 😊',
      timestamp: new Date(Date.now() - 900000), // 15 min ago
      isOwn: true,
      status: 'read',
      reactions: [],
    },
  ]);
  
  const flatListRef = useRef<FlatList>(null);

  // Typing indicator animation
  const TypingIndicator = () => (
    <View style={styles.typingContainer}>
      <View style={styles.typingBubble}>
        <View style={styles.typingDots}>
          {[0, 1, 2].map((index) => (
            <MotiView
              key={index}
              style={styles.typingDot}
              from={{ translateY: 0 }}
              animate={{ translateY: -4 }}
              transition={{
                type: 'timing',
                duration: 600,
                delay: index * 200,
                repeatReverse: true,
                loop: true,
              }}
            />
          ))}
        </View>
      </View>
    </View>
  );

  const handleSend = () => {
    if (!message.trim()) return;
    
    // Trigger shake animation
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 200); // 2 loops * 100ms each
    
    const newMessage: Message = {
      id: Date.now().toString(),
      text: message.trim(),
      timestamp: new Date(),
      isOwn: true,
      status: 'sending',
      reactions: [],
      replyTo: replyTo || undefined,
    };
    
    setMessages(prev => [...prev, newMessage]);
    setMessage('');
    setReplyTo(null);
    
    // Simulate message status updates
    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === newMessage.id ? { ...msg, status: 'sent' } : msg
        )
      );
    }, 1000);

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleImagePress = (imageUri: string, caption?: string) => {
    setSelectedMediaUri(imageUri);
    setSelectedMediaCaption(caption || '');
    setMediaViewerVisible(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const closeMediaViewer = () => {
    setMediaViewerVisible(false);
    setSelectedMediaUri('');
    setSelectedMediaCaption('');
  };

  const handleVideoCall = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Navigate to CallsStack -> VideoCall
    const parentNavigation = navigation.getParent();
    parentNavigation?.navigate('CallsStack', {
      screen: 'VideoCall',
      params: {
        contactId: route.params.chatId,
        contactName: userName,
        contactAvatar: 'https://via.placeholder.com/150',
        isIncoming: false,
      }
    });
  };

  const handleVoiceCall = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Navigate to CallsStack -> CallScreen
    const parentNavigation = navigation.getParent();
    parentNavigation?.navigate('CallsStack', {
      screen: 'CallScreen',
      params: {
        contactName: userName,
        contactAvatar: 'https://via.placeholder.com/150',
        isIncoming: false,
        isVideo: false,
      }
    });
  };

  // Message component with swipe and long press (temporarily simplified)
  const MessageItem = ({ item }: { item: Message }) => {
    const onLongPress = () => {
      setSelectedMessageId(item.id);
      setShowReactions(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    };

    return (
      <MotiView
        from={{ opacity: 0, translateY: 20, scale: 0.9 }}
        animate={{ opacity: 1, translateY: 0, scale: 1 }}
        transition={{ type: 'timing', duration: 300 }}
        style={[
          styles.messageContainer,
          item.isOwn ? styles.ownMessage : styles.otherMessage,
        ]}
      >
        {!item.isOwn && (
          <View style={styles.messageAvatar}>
            <Avatar
              source="https://i.pravatar.cc/150?img=1"
              name={userName}
              size={40}
            />
          </View>
        )}
        <Pressable onLongPress={onLongPress} style={{ flex: 1 }}>
          <Surface style={[
            styles.messageBubble,
            item.isOwn ? styles.ownBubble : styles.otherBubble,
          ]}>
            {item.replyTo && (
              <View style={styles.replyIndicator}>
                <Text style={styles.replyText}>Replying to message</Text>
              </View>
            )}
            {item.text && (
              <Text style={[
                styles.messageText,
                item.isOwn ? styles.ownText : styles.otherText,
              ]}>
                {item.text}
              </Text>
            )}
            {item.imageUri && (
              <TouchableOpacity 
                onPress={() => handleImagePress(item.imageUri!, item.imageCaption)}
                style={styles.imageContainer}
              >
                <Image
                  source={{ uri: item.imageUri }}
                  style={styles.messageImage}
                  resizeMode="cover"
                />
                {item.imageCaption && (
                  <View style={styles.imageCaptionOverlay}>
                    <Text style={styles.imageCaptionText} numberOfLines={2}>
                      {item.imageCaption}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            )}
            <Text style={[
              styles.timestamp,
              item.isOwn ? styles.ownTimestamp : styles.otherTimestamp,
            ]}>
              {item.timestamp.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
              })}
            </Text>
            {item.reactions.length > 0 && (
              <View style={styles.reactionsContainer}>
                {item.reactions.map((emoji, index) => (
                  <Text key={index} style={styles.reaction}>
                    {emoji}
                  </Text>
                ))}
              </View>
            )}
          </Surface>
        </Pressable>
      </MotiView>
    );
  };

  // Reactions modal
  const ReactionsModal = () => (
    <Modal
      visible={showReactions}
      transparent
      animationType="fade"
      onRequestClose={() => setShowReactions(false)}
    >
      <Pressable 
        style={styles.modalOverlay}
        onPress={() => setShowReactions(false)}
      >
        <MotiView
          style={styles.reactionsModal}
          from={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 15 }}
        >
          {reactionEmojis.map((emoji, index) => (
            <TouchableOpacity
              key={emoji}
              style={styles.reactionButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowReactions(false);
                // Add reaction logic here
              }}
            >
              <Text style={styles.reactionEmoji}>{emoji}</Text>
            </TouchableOpacity>
          ))}
        </MotiView>
      </Pressable>
    </Modal>
  );

  // Profile modal
  const ProfileModal = () => {
    const insets = useSafeAreaInsets();
    const [profileScrollY, setProfileScrollY] = useState(0); // Start at 0 to show static content
    
    return (
      <Modal
        visible={showProfileModal}
        transparent={false}
        animationType="slide"
        onRequestClose={() => setShowProfileModal(false)}
      >
        <View style={styles.fullPageModal}>
          {/* Use DynamicHeader with contact info in static state, user name when scrolling */}
          <DynamicHeader
            title={userName}
            subtitle="Last seen recently"
            staticContent={
              <Text style={styles.headerContactPhone}>Contact Info</Text>
            }
            showBackButton
            onBackPress={() => {
              console.log('Profile modal back button pressed');
              setShowProfileModal(false);
            }}
            scrollY={profileScrollY}
          />

          {/* Scrollable content that starts below the header */}
          <ScrollView 
            style={[styles.profileScrollContainer, { marginTop: 60 + insets.top }]} // Same as ChatsListScreen
            contentContainerStyle={styles.scrollContentContainer}
            showsVerticalScrollIndicator={false}
            onScroll={(event) => {
              const offsetY = event.nativeEvent.contentOffset.y;
              setProfileScrollY(offsetY);
            }}
            scrollEventThrottle={16}
          >
            <MotiView
              from={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'timing', duration: 300 }}
              style={styles.fullPageContent}
            >
              {/* Large Profile Header */}
              <View style={styles.fullPageProfileHeader}>
                <Avatar
                  source={`https://i.pravatar.cc/150?img=${userName.length % 10}`}
                  name={userName}
                  size={120}
                />
                {isEditing ? (
                  <TextInput
                    style={styles.editableProfileName}
                    value={editedName}
                    onChangeText={setEditedName}
                    placeholder="Enter name"
                    textAlign="center"
                    multiline={false}
                  />
                ) : (
                  <Text style={styles.fullPageProfileName}>{editedName}</Text>
                )}
                <Text style={styles.fullPageProfileStatus}>Last seen recently</Text>
                
                {/* Edit/Save button in profile section */}
                <TouchableOpacity 
                  style={styles.profileEditButton}
                  onPress={() => {
                    console.log('Edit button pressed, current isEditing:', isEditing);
                    if (isEditing) {
                      // Save changes
                      console.log('Saving changes...');
                      setIsEditing(false);
                    } else {
                      // Enter edit mode
                      console.log('Entering edit mode...');
                      setIsEditing(true);
                    }
                  }}
                >
                  <Text style={styles.profileEditButtonText}>
                    {isEditing ? 'Save Changes' : 'Edit Profile'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Quick Action Buttons - Call, Video, Info */}
              <View style={styles.quickActions}>
                <TouchableOpacity style={styles.quickActionButton}>
                  <View style={styles.quickActionIconContainer}>
                    <MaterialIcon name="phone" size={28} color="#4CAF50" />
                  </View>
                  <Text style={styles.quickActionText}>Call</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.quickActionButton}>
                  <View style={styles.quickActionIconContainer}>
                    <MaterialIcon name="videocam" size={28} color="#2196F3" />
                  </View>
                  <Text style={styles.quickActionText}>Video</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.quickActionButton}>
                  <View style={styles.quickActionIconContainer}>
                    <MaterialIcon name="account-box" size={28} color="#FF9800" />
                  </View>
                  <Text style={styles.quickActionText}>Info</Text>
                </TouchableOpacity>
              </View>

          {/* Profile Details - iOS Style Grouped Cards */}
          <View style={styles.profileDetailsContainer}>
            {/* Contact Info Card */}
            <View style={styles.iosCard}>
              <View style={styles.iosCardItem}>
                <MaterialIcon name="phone" size={20} color={tokens.colors.primary} />
                <Text style={styles.iosCardText}>+1 (555) 123-4567</Text>
              </View>
              <View style={styles.iosCardSeparator} />
              <View style={styles.iosCardItem}>
                <MaterialIcon name="email" size={20} color={tokens.colors.primary} />
                <Text style={styles.iosCardText}>{userName.toLowerCase().replace(' ', '.')}@example.com</Text>
              </View>
            </View>

            {/* Details Card */}
            <View style={styles.iosCard}>
              <View style={styles.iosCardItem}>
                <MaterialIcon name="calendar" size={20} color={tokens.colors.primary} />
                <Text style={styles.iosCardText}>Member since 2023</Text>
              </View>
              <View style={styles.iosCardSeparator} />
              <View style={styles.iosCardItem}>
                <MaterialIcon name="map-marker" size={20} color={tokens.colors.primary} />
                <Text style={styles.iosCardText}>San Francisco, CA</Text>
              </View>
            </View>
          </View>

          {/* Activity Status - iOS Style Card */}
          <View style={styles.profileDetailsContainer}>
            <View style={styles.iosCard}>
              <View style={styles.iosCardItem}>
                <MaterialIcon name="circle" size={12} color="#4CAF50" />
                <Text style={styles.iosCardText}>Active now</Text>
              </View>
              <View style={styles.iosCardSeparator} />
              <View style={styles.iosCardItem}>
                <MaterialIcon name="message-text" size={16} color={tokens.colors.onSurface60} />
                <Text style={[styles.iosCardText, { color: tokens.colors.onSurface60 }]}>Usually replies within an hour</Text>
              </View>
            </View>
          </View>

          {/* Shared Media - iOS Style */}
          <View style={styles.profileDetailsContainer}>
            <View style={styles.iosCard}>
              <View style={styles.iosCardItem}>
                <MaterialIcon name="image" size={20} color={tokens.colors.primary} />
                <Text style={styles.iosCardText}>Shared Media</Text>
                <TouchableOpacity>
                  <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.mediaGrid}>
              {[1, 2, 3, 4].map((item) => (
                <View key={item} style={styles.mediaItem}>
                  <View style={styles.mediaPlaceholder}>
                    <MaterialIcon name="image" size={24} color={tokens.colors.onSurface60} />
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Mutual Connections - iOS Style */}
          <View style={styles.profileDetailsContainer}>
            <View style={styles.iosCard}>
              <View style={styles.iosCardItem}>
                <MaterialIcon name="account-multiple" size={20} color={tokens.colors.primary} />
                <Text style={styles.iosCardText}>Mutual Connections</Text>
                <Text style={styles.mutualCount}>12 mutual</Text>
              </View>
            </View>
            <View style={styles.mutualAvatars}>
              {[1, 2, 3, 4, 5].map((item) => (
                <View key={item} style={styles.mutualAvatar}>
                  <Avatar
                    source={`https://i.pravatar.cc/150?img=${item + 10}`}
                    name={`Friend ${item}`}
                    size={40}
                  />
                </View>
              ))}
              <View style={styles.moreMutual}>
                <Text style={styles.moreText}>+7</Text>
              </View>
            </View>
          </View>

          {/* About Section - iOS Style */}
          <View style={styles.profileDetailsContainer}>
            <View style={styles.iosCard}>
              <View style={styles.iosCardItem}>
                <MaterialIcon name="account-details" size={20} color={tokens.colors.primary} />
                <View style={{ flex: 1, marginLeft: tokens.spacing.m }}>
                  <Text style={[styles.iosCardText, { marginLeft: 0, marginBottom: 4 }]}>About</Text>
                  {isEditing ? (
                    <TextInput
                      style={styles.editableAboutText}
                      value={editedAbout}
                      onChangeText={setEditedAbout}
                      placeholder="Tell people about yourself"
                      multiline={true}
                      textAlignVertical="top"
                    />
                  ) : (
                    <Text style={[styles.iosCardText, { marginLeft: 0, color: tokens.colors.onSurface60, fontSize: 14 }]}>
                      {editedAbout || 'Available'}
                    </Text>
                  )}
                </View>
              </View>
            </View>
          </View>

          {/* Quick Stats */}
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>Quick Stats</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <MaterialIcon name="message-text" size={20} color={tokens.colors.primary} />
                <Text style={styles.statNumber}>1,247</Text>
                <Text style={styles.statLabel}>Messages</Text>
              </View>
              <View style={styles.statItem}>
                <MaterialIcon name="image" size={20} color={tokens.colors.primary} />
                <Text style={styles.statNumber}>89</Text>
                <Text style={styles.statLabel}>Photos</Text>
              </View>
              <View style={styles.statItem}>
                <MaterialIcon name="calendar" size={20} color={tokens.colors.primary} />
                <Text style={styles.statNumber}>2 years</Text>
                <Text style={styles.statLabel}>Friends</Text>
              </View>
            </View>
          </View>

          {/* Social Links */}
          <View style={styles.socialSection}>
            <Text style={styles.sectionTitle}>Social Links</Text>
            <View style={styles.socialLinks}>
              <TouchableOpacity style={styles.socialButton}>
                <MaterialIcon name="instagram" size={24} color="#E4405F" />
                <Text style={styles.socialText}>Instagram</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton}>
                <MaterialIcon name="twitter" size={24} color="#1DA1F2" />
                <Text style={styles.socialText}>Twitter</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton}>
                <MaterialIcon name="linkedin" size={24} color="#0077B5" />
                <Text style={styles.socialText}>LinkedIn</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Quick Settings */}
          <View style={styles.profileSettings}>
            <TouchableOpacity style={styles.profileSettingItem}>
              <MaterialIcon name="bell-off" size={20} color={tokens.colors.onSurface60} />
              <Text style={styles.profileSettingText}>Mute notifications</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.profileSettingItem}>
              <MaterialIcon name="block-helper" size={20} color={tokens.colors.error} />
              <Text style={[styles.profileSettingText, { color: tokens.colors.error }]}>Block user</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.profileSettingItem}>
              <MaterialIcon name="report" size={20} color={tokens.colors.error} />
              <Text style={[styles.profileSettingText, { color: tokens.colors.error }]}>Report user</Text>
            </TouchableOpacity>
          </View>
        </MotiView>
        </ScrollView>
      </View>
    </Modal>
    );
  };

  // Input toolbar
  const InputToolbar = () => {
    const hasText = message.length > 0;

    return (
      <MotiView
        animate={{
          translateX: isShaking ? [-4, 4, -4, 4, 0] : 0,
        }}
        transition={{
          type: 'timing',
          duration: 200,
        }}
      >
        <Surface style={styles.inputToolbar}>
        {replyTo && (
          <View style={styles.replyStrip}>
            <Text style={styles.replyStripText}>Replying to message</Text>
            <TouchableOpacity onPress={() => setReplyTo(null)}>
              <MaterialIcon name="close" size={16} color={tokens.colors.onSurface60} />
            </TouchableOpacity>
          </View>
        )}
        
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.toolbarButton}>
            <MaterialIcon name="attachment" size={24} color={tokens.colors.onSurface60} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.toolbarButton}>
            <MaterialIcon name="emoticon-outline" size={24} color={tokens.colors.onSurface60} />
          </TouchableOpacity>
          
          <TextInput
            style={styles.textInput}
            placeholder="Message"
            placeholderTextColor={tokens.colors.onSurface38}
            value={message}
            onChangeText={setMessage}
            multiline
            maxLength={1000}
            blurOnSubmit={false}
            returnKeyType="default"
            enablesReturnKeyAutomatically={false}
          />
          
          <MotiView
            animate={{
              scale: hasText ? 1 : 0.8,
              backgroundColor: hasText ? tokens.colors.primary : tokens.colors.surface3,
            }}
            transition={{ type: 'spring', damping: 15 }}
            style={styles.sendButtonContainer}
          >
            <TouchableOpacity 
              style={styles.sendButton}
              onPress={handleSend}
            >
              <MaterialIcon 
                name={hasText ? "send" : "microphone"} 
                size={20} 
                color={hasText ? '#FFFFFF' : tokens.colors.onSurface60} 
              />
            </TouchableOpacity>
          </MotiView>
        </View>
      </Surface>
      </MotiView>
    );
  };

  // Scroll to bottom button
  const ScrollToBottomButton = () => (
    <MotiView
      style={styles.scrollToBottomContainer}
      animate={{
        opacity: showScrollToBottom ? 1 : 0,
        scale: showScrollToBottom ? 1 : 0.8,
      }}
      transition={{ type: 'spring', damping: 15 }}
    >
      <TouchableOpacity
        style={styles.scrollToBottomButton}
        onPress={() => {
          flatListRef.current?.scrollToEnd({ animated: true });
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
      >
        <MaterialIcon 
          name="keyboard_arrow_down" 
          size={24} 
          color={tokens.colors.onSurface} 
        />
      </TouchableOpacity>
    </MotiView>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <DynamicHeader
        title={userName}
        showBackButton
        onBackPress={() => {
          console.log('Main ChatRoom back button pressed');
          navigation.goBack();
        }}
        onTitlePress={() => setShowProfileModal(true)}
        scrollY={scrollPosition}
        rightIcons={[
          { icon: 'phone', onPress: handleVoiceCall },
          { icon: 'video', onPress: handleVideoCall },
        ]}
      />

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={MessageItem}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContainer}
        onScroll={(event) => {
          handleScroll(event);
          const offsetY = event.nativeEvent.contentOffset.y;
          const contentHeight = event.nativeEvent.contentSize.height;
          const scrollViewHeight = event.nativeEvent.layoutMeasurement.height;
          
          setShowScrollToBottom(
            offsetY < contentHeight - scrollViewHeight - 100
          );
        }}
        scrollEventThrottle={16}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={isTyping ? TypingIndicator : null}
      />

      <ScrollToBottomButton />
      <InputToolbar />
      <ReactionsModal />
      <ProfileModal />
      
      <MediaViewer
        visible={mediaViewerVisible}
        onClose={closeMediaViewer}
        mediaUri={selectedMediaUri}
        caption={selectedMediaCaption}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.bg,
  },
  messagesList: {
    flex: 1,
  },
  messagesContainer: {
    padding: tokens.spacing.m,
    paddingBottom: tokens.spacing.l,
    paddingTop: 120, // Increased from 80 to 120 to push messages below header
  },
  messageContainer: {
    marginVertical: tokens.spacing.xs,
    maxWidth: '75%',
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  ownMessage: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  otherMessage: {
    alignSelf: 'flex-start',
  },
  messageAvatar: {
    marginHorizontal: tokens.spacing.s,
    alignSelf: 'flex-end',
  },
  messageBubble: {
    padding: tokens.spacing.s,
    borderRadius: tokens.radius.m,
    elevation: 1,
    flex: 1,
  },
  ownBubble: {
    backgroundColor: tokens.colors.primary,
    borderBottomRightRadius: tokens.spacing.xs,
  },
  otherBubble: {
    backgroundColor: tokens.colors.surface2,
    borderBottomLeftRadius: tokens.spacing.xs,
  },
  messageText: {
    ...tokens.typography.body,
    lineHeight: 20,
  },
  ownText: {
    color: '#FFFFFF',
  },
  otherText: {
    color: tokens.colors.onSurface,
  },
  timestamp: {
    ...tokens.typography.caption,
    marginTop: tokens.spacing.xs,
    fontSize: 11,
  },
  ownTimestamp: {
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'right',
  },
  otherTimestamp: {
    color: tokens.colors.onSurface38,
  },
  replyIndicator: {
    borderLeftWidth: 3,
    borderLeftColor: tokens.colors.primary,
    paddingLeft: tokens.spacing.s,
    marginBottom: tokens.spacing.xs,
  },
  replyText: {
    ...tokens.typography.caption,
    color: tokens.colors.onSurface60,
    fontStyle: 'italic',
  },
  reactionsContainer: {
    flexDirection: 'row',
    marginTop: tokens.spacing.xs,
    flexWrap: 'wrap',
  },
  reaction: {
    fontSize: 16,
    marginRight: tokens.spacing.xs,
    backgroundColor: tokens.colors.surface3,
    paddingHorizontal: tokens.spacing.s,
    paddingVertical: 2,
    borderRadius: tokens.radius.s,
  },
  // Typing indicator
  typingContainer: {
    alignSelf: 'flex-start',
    marginVertical: tokens.spacing.xs,
    marginLeft: tokens.spacing.m,
  },
  typingBubble: {
    backgroundColor: tokens.colors.surface2,
    borderRadius: tokens.radius.l,
    borderBottomLeftRadius: tokens.spacing.s,
    padding: tokens.spacing.m,
    paddingVertical: tokens.spacing.s,
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: tokens.colors.onSurface60,
    marginHorizontal: 2,
  },
  // Input toolbar
  inputToolbar: {
    backgroundColor: tokens.colors.surface2,
    minHeight: 56,
    paddingHorizontal: tokens.spacing.m,
    paddingVertical: tokens.spacing.s,
    elevation: 8,
  },
  replyStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: tokens.spacing.s,
    paddingHorizontal: tokens.spacing.m,
    backgroundColor: tokens.colors.surface3,
    borderRadius: tokens.radius.s,
    marginBottom: tokens.spacing.s,
  },
  replyStripText: {
    ...tokens.typography.caption,
    color: tokens.colors.onSurface60,
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: tokens.spacing.s,
  },
  toolbarButton: {
    padding: tokens.spacing.s,
    borderRadius: tokens.radius.m,
  },
  textInput: {
    flex: 1,
    backgroundColor: tokens.colors.bg,
    borderRadius: tokens.radius.l,
    paddingHorizontal: tokens.spacing.m,
    paddingVertical: tokens.spacing.s,
    marginHorizontal: tokens.spacing.s,
    minHeight: 40,
    maxHeight: 120,
    color: tokens.colors.onSurface,
    ...tokens.typography.body,
    textAlignVertical: 'top',
  },
  sendButtonContainer: {
    borderRadius: 20, // tokens.radius.full equivalent
    padding: tokens.spacing.s,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20, // tokens.radius.full equivalent
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Reactions modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reactionsModal: {
    backgroundColor: tokens.colors.surface2,
    borderRadius: tokens.radius.l,
    flexDirection: 'row',
    paddingHorizontal: tokens.spacing.m,
    paddingVertical: tokens.spacing.s,
    gap: tokens.spacing.s,
  },
  reactionButton: {
    padding: tokens.spacing.s,
    borderRadius: tokens.radius.m,
  },
  reactionEmoji: {
    fontSize: 24,
  },
  // Scroll to bottom button
  scrollToBottomContainer: {
    position: 'absolute',
    bottom: 80,
    right: tokens.spacing.m,
  },
  scrollToBottomButton: {
    width: 48,
    height: 48,
    backgroundColor: tokens.colors.surface2,
    borderRadius: 24, // tokens.radius.full equivalent
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  // Image message styles
  imageContainer: {
    marginTop: tokens.spacing.s,
    borderRadius: tokens.radius.m,
    overflow: 'hidden',
    position: 'relative',
  },
  messageImage: {
    width: 200,
    height: 150,
    borderRadius: tokens.radius.m,
  },
  imageCaptionOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: tokens.spacing.s,
    paddingVertical: tokens.spacing.xs,
  },
  imageCaptionText: {
    color: '#FFFFFF',
    ...tokens.typography.caption,
    fontSize: 12,
  },
  // Profile modal styles
  profileModal: {
    backgroundColor: tokens.colors.surface1,
    borderTopLeftRadius: tokens.radius.xl,
    borderTopRightRadius: tokens.radius.xl,
    marginTop: 'auto',
    paddingTop: tokens.spacing.l,
    paddingHorizontal: tokens.spacing.l,
    paddingBottom: tokens.spacing.xl,
    maxHeight: '80%',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: tokens.spacing.l,
  },
  profileInfo: {
    marginLeft: tokens.spacing.m,
    flex: 1,
  },
  profileName: {
    ...tokens.typography.h2,
    color: tokens.colors.onSurface,
    fontWeight: '600',
  },
  profileStatus: {
    ...tokens.typography.body,
    color: tokens.colors.onSurface60,
    marginTop: 2,
  },
  profileDetails: {
    marginBottom: tokens.spacing.l,
  },
  profileDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: tokens.spacing.s,
  },
  profileDetailText: {
    ...tokens.typography.body,
    color: tokens.colors.onSurface,
    marginLeft: tokens.spacing.m,
  },
  profileSettings: {
    paddingTop: tokens.spacing.s, // Reduced padding
  },
  profileSettingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: tokens.spacing.m,
  },
  profileSettingText: {
    ...tokens.typography.body,
    color: tokens.colors.onSurface,
    marginLeft: tokens.spacing.m,
  },
  // Full page modal styles
  fullPageModal: {
    flex: 1,
    backgroundColor: tokens.colors.bg,
  },
  profileScrollContainer: {
    flex: 1,
  },
  scrollContentContainer: {
    flexGrow: 1,
    paddingBottom: tokens.spacing.m, // Reduced from xl to m
  },
  fullPageContent: {
    paddingHorizontal: tokens.spacing.l,
    paddingTop: tokens.spacing.l,
  },
  fullPageProfileHeader: {
    alignItems: 'center',
    marginBottom: tokens.spacing.xl,
  },
  fullPageProfileName: {
    ...tokens.typography.h1,
    color: tokens.colors.onSurface,
    fontWeight: '700',
    marginTop: tokens.spacing.m,
    textAlign: 'center',
  },
  fullPageProfileStatus: {
    ...tokens.typography.body,
    color: tokens.colors.onSurface60,
    marginTop: tokens.spacing.xs,
    textAlign: 'center',
  },
  // Header contact info styles
  headerContactInfo: {
    alignItems: 'center',
    paddingVertical: tokens.spacing.s,
  },
  headerContactName: {
    ...tokens.typography.body,
    color: tokens.colors.onSurface,
    fontWeight: '600',
    fontSize: 18,
    textAlign: 'center',
  },
  headerContactStatus: {
    ...tokens.typography.caption,
    color: tokens.colors.onSurface60,
    textAlign: 'center',
    marginTop: 2,
  },
  headerContactPhone: {
    ...tokens.typography.body,
    color: tokens.colors.primary,
    textAlign: 'center',
    marginTop: 2,
    fontSize: 18,
    fontWeight: '600',
  },
  // New profile features styles
  sectionTitle: {
    ...tokens.typography.h2,
    color: tokens.colors.onSurface,
    fontWeight: '600',
    marginBottom: tokens.spacing.m,
  },
  activitySection: {
    marginBottom: tokens.spacing.l,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: tokens.spacing.xs,
  },
  activityText: {
    ...tokens.typography.body,
    color: '#4CAF50',
    marginLeft: tokens.spacing.s,
    fontWeight: '500',
  },
  activitySubtext: {
    ...tokens.typography.caption,
    color: tokens.colors.onSurface60,
    marginLeft: tokens.spacing.s,
  },
  mediaSection: {
    marginBottom: tokens.spacing.l,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.spacing.m,
  },
  seeAllText: {
    ...tokens.typography.caption,
    color: tokens.colors.primary,
    fontWeight: '500',
  },
  mediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tokens.spacing.s,
  },
  mediaItem: {
    width: '23%',
    aspectRatio: 1,
  },
  mediaPlaceholder: {
    flex: 1,
    backgroundColor: tokens.colors.surface2,
    borderRadius: tokens.radius.s,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Additional profile features styles
  mutualSection: {
    marginBottom: tokens.spacing.l,
  },
  mutualCount: {
    ...tokens.typography.caption,
    color: tokens.colors.primary,
    fontWeight: '500',
  },
  mutualAvatars: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mutualAvatar: {
    marginRight: -8,
  },
  moreMutual: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: tokens.colors.surface2,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  moreText: {
    ...tokens.typography.caption,
    color: tokens.colors.onSurface,
    fontWeight: '600',
  },
  aboutSection: {
    marginBottom: tokens.spacing.l,
  },
  aboutText: {
    ...tokens.typography.body,
    color: tokens.colors.onSurface,
    lineHeight: 20,
    marginBottom: tokens.spacing.m,
  },
  interestTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tokens.spacing.s,
  },
  tag: {
    backgroundColor: tokens.colors.surface2,
    borderRadius: tokens.radius.l,
    paddingHorizontal: tokens.spacing.m,
    paddingVertical: tokens.spacing.xs,
  },
  tagText: {
    ...tokens.typography.caption,
    color: tokens.colors.primary,
    fontWeight: '500',
  },
  statsSection: {
    marginBottom: tokens.spacing.l,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    ...tokens.typography.h2,
    color: tokens.colors.onSurface,
    fontWeight: '700',
    marginTop: tokens.spacing.xs,
  },
  statLabel: {
    ...tokens.typography.caption,
    color: tokens.colors.onSurface60,
    marginTop: 2,
  },
  socialSection: {
    marginBottom: tokens.spacing.l,
  },
  socialLinks: {
    gap: tokens.spacing.m,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.surface2,
    borderRadius: tokens.radius.m,
    paddingHorizontal: tokens.spacing.m,
    paddingVertical: tokens.spacing.s,
  },
  socialText: {
    ...tokens.typography.body,
    color: tokens.colors.onSurface,
    marginLeft: tokens.spacing.s,
    fontWeight: '500',
  },
    // Quick Actions Styles
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: tokens.spacing.xl,
    paddingVertical: tokens.spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.surface2,
    marginBottom: tokens.spacing.l,
    backgroundColor: 'transparent',
  },
  quickActionButton: {
    alignItems: 'center',
    paddingVertical: tokens.spacing.m,
    paddingHorizontal: tokens.spacing.s,
    borderRadius: tokens.radius.l,
    minWidth: 80,
    backgroundColor: 'transparent',
  },
  quickActionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: tokens.colors.surface2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: tokens.spacing.s,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  quickActionText: {
    ...tokens.typography.caption,
    color: tokens.colors.onSurface,
    fontWeight: '600',
    fontSize: 13,
    textAlign: 'center',
  },
  quickActionButtonDanger: {
    alignItems: 'center',
    paddingVertical: tokens.spacing.s,
    paddingHorizontal: tokens.spacing.s,
    backgroundColor: '#DC3545', // Red/danger color
    borderRadius: tokens.radius.l,
    minWidth: 60,
    flex: 1,
    marginHorizontal: 2,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  quickActionTextDanger: {
    ...tokens.typography.caption,
    color: '#FFFFFF',
    fontWeight: '600',
    marginTop: tokens.spacing.xs,
  },
  // Header Edit Button Styles
  profileEditButton: {
    backgroundColor: tokens.colors.primary,
    borderRadius: tokens.radius.m,
    paddingHorizontal: tokens.spacing.l,
    paddingVertical: tokens.spacing.s,
    marginTop: tokens.spacing.m,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  profileEditButtonText: {
    ...tokens.typography.body,
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
  },
  // Editable fields styles
  editableProfileName: {
    ...tokens.typography.h1,
    color: tokens.colors.onSurface,
    fontWeight: '700',
    marginTop: tokens.spacing.m,
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.primary,
    paddingBottom: tokens.spacing.xs,
    minWidth: 200,
  },
  editableAboutText: {
    ...tokens.typography.body,
    color: tokens.colors.onSurface,
    lineHeight: 20,
    marginBottom: tokens.spacing.m,
    borderWidth: 1,
    borderColor: tokens.colors.primary,
    borderRadius: tokens.radius.s,
    padding: tokens.spacing.m,
    minHeight: 80,
  },
  // iOS-style profile cards
  profileDetailsContainer: {
    marginBottom: tokens.spacing.l,
    gap: tokens.spacing.m,
  },
  iosCard: {
    backgroundColor: tokens.colors.surface1,
    borderRadius: 12, // iOS-style rounded corners
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  iosCardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    minHeight: 48,
  },
  iosCardText: {
    ...tokens.typography.body,
    color: tokens.colors.onSurface,
    marginLeft: tokens.spacing.m,
    flex: 1,
  },
  iosCardSeparator: {
    height: 0.5,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginLeft: 52, // Align with text
  },
});
