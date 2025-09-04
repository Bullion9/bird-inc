import React, { useState, useRef, useEffect } from 'react';
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
  Image
} from 'react-native';
import { Text, IconButton, Surface } from 'react-native-paper';
import { MotiView } from 'moti';
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
  const scrollY = useRef(new Animated.Value(0)).current;

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
        onBackPress={() => navigation.goBack()}
        rightIcons={[
          { icon: 'phone', onPress: () => {} },
          { icon: 'video', onPress: () => {} },
        ]}
      />

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={MessageItem}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContainer}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { 
            useNativeDriver: false,
            listener: (event: any) => {
              const offsetY = event.nativeEvent.contentOffset.y;
              const contentHeight = event.nativeEvent.contentSize.height;
              const scrollViewHeight = event.nativeEvent.layoutMeasurement.height;
              
              setShowScrollToBottom(
                offsetY < contentHeight - scrollViewHeight - 100
              );
            }
          }
        )}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={isTyping ? TypingIndicator : null}
      />

      <ScrollToBottomButton />
      <InputToolbar />
      <ReactionsModal />
      
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
});
