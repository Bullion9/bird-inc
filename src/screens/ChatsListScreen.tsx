import React, { useState, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  ImageBackground, 
  Dimensions, 
  TouchableOpacity,
  Animated,
  Modal,
  Image,
  Alert
} from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { Text, Searchbar } from 'react-native-paper';
import { MotiView } from 'moti';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as Haptics from 'expo-haptics';

import { tokens } from '../theme/tokens';
import { DynamicHeader, BirdCard, Avatar, MaterialIcon } from '../components';
import { ChatsStackParamList } from '../navigation/types';

type ChatsListNavigationProp = StackNavigationProp<ChatsStackParamList, 'ChatsList'>;

const { height: screenHeight } = Dimensions.get('window');

// Mock data for chats
const mockChats = [
  {
    id: '1',
    name: 'Alice Johnson',
    lastMessage: 'Hey! How was your day?',
    timestamp: '2:30 PM',
    unreadCount: 3,
    avatar: 'https://i.pravatar.cc/150?img=1',
    isPinned: true,
    hasStory: true,
    storyViewed: false,
  },
  {
    id: '2',
    name: 'Bob Smith',
    lastMessage: 'Can we meet tomorrow?',
    timestamp: '1:45 PM',
    unreadCount: 0,
    avatar: 'https://i.pravatar.cc/150?img=2',
    isPinned: true,
    hasStory: false,
    storyViewed: false,
  },
  {
    id: '3',
    name: 'Carol Williams',
    lastMessage: 'Thanks for the help!',
    timestamp: '12:20 PM',
    unreadCount: 1,
    avatar: 'https://i.pravatar.cc/150?img=3',
    isPinned: false,
    hasStory: true,
    storyViewed: true,
  },
  {
    id: '4',
    name: 'David Brown',
    lastMessage: 'See you later 👋',
    timestamp: '11:15 AM',
    unreadCount: 0,
    avatar: 'https://i.pravatar.cc/150?img=4',
    isPinned: false,
    hasStory: false,
    storyViewed: false,
  },
  {
    id: '5',
    name: 'Emma Davis',
    lastMessage: 'Got the files, reviewing now',
    timestamp: '10:30 AM',
    unreadCount: 2,
    avatar: 'https://i.pravatar.cc/150?img=5',
    isPinned: false,
    hasStory: true,
    storyViewed: false,
  },
  {
    id: '6',
    name: 'Tech Team',
    lastMessage: 'Sarah: Sprint planning at 3 PM today',
    timestamp: '9:45 AM',
    unreadCount: 7,
    avatar: 'https://i.pravatar.cc/150?img=6',
    isPinned: true,
    hasStory: false,
    storyViewed: false,
  },
  {
    id: '7',
    name: 'Mom',
    lastMessage: 'Don\'t forget dinner this Sunday!',
    timestamp: '8:20 AM',
    unreadCount: 0,
    avatar: 'https://i.pravatar.cc/150?img=7',
    isPinned: false,
    hasStory: true,
    storyViewed: false,
  },
  {
    id: '8',
    name: 'Gaming Squad',
    lastMessage: 'Mike: Who\'s up for some Valorant tonight?',
    timestamp: 'Yesterday',
    unreadCount: 12,
    avatar: 'https://i.pravatar.cc/150?img=8',
    isPinned: false,
    hasStory: false,
    storyViewed: false,
  },
  {
    id: '9',
    name: 'Sarah Chen',
    lastMessage: 'Perfect! The design looks amazing 🎨',
    timestamp: 'Yesterday',
    unreadCount: 0,
    avatar: 'https://i.pravatar.cc/150?img=9',
    isPinned: false,
    hasStory: true,
    storyViewed: true,
  },
  {
    id: '10',
    name: 'Work Updates',
    lastMessage: 'Alex: New project requirements uploaded',
    timestamp: 'Yesterday',
    unreadCount: 4,
    avatar: 'https://i.pravatar.cc/150?img=10',
    isPinned: false,
    hasStory: false,
    storyViewed: false,
  },
  {
    id: '11',
    name: 'James Wilson',
    lastMessage: 'The coffee shop on 5th street is great!',
    timestamp: 'Monday',
    unreadCount: 0,
    avatar: 'https://i.pravatar.cc/150?img=11',
    isPinned: false,
    hasStory: true,
    storyViewed: false,
  },
  {
    id: '12',
    name: 'Lisa Rodriguez',
    lastMessage: 'Photo from the beach vacation 📸',
    timestamp: 'Monday',
    unreadCount: 1,
    avatar: 'https://i.pravatar.cc/150?img=12',
    isPinned: false,
    hasStory: true,
    storyViewed: true,
  },
  {
    id: '13',
    name: 'Family Group',
    lastMessage: 'Dad: BBQ this weekend, everyone invited!',
    timestamp: 'Sunday',
    unreadCount: 8,
    avatar: 'https://i.pravatar.cc/150?img=13',
    isPinned: false,
    hasStory: false,
    storyViewed: false,
  },
  {
    id: '14',
    name: 'Marcus Thompson',
    lastMessage: 'Great workout session today 💪',
    timestamp: 'Sunday',
    unreadCount: 0,
    avatar: 'https://i.pravatar.cc/150?img=14',
    isPinned: false,
    hasStory: true,
    storyViewed: false,
  },
  {
    id: '15',
    name: 'Book Club',
    lastMessage: 'Rachel: Next month we\'re reading sci-fi',
    timestamp: 'Friday',
    unreadCount: 3,
    avatar: 'https://i.pravatar.cc/150?img=15',
    isPinned: false,
    hasStory: false,
    storyViewed: false,
  },
  {
    id: '16',
    name: 'Netflix & Chill',
    lastMessage: 'Who\'s watching the new series? No spoilers!',
    timestamp: 'Friday',
    unreadCount: 15,
    avatar: 'https://i.pravatar.cc/150?img=16',
    isPinned: false,
    hasStory: true,
    storyViewed: true,
  },
  {
    id: '17',
    name: 'Dr. Amanda Kelly',
    lastMessage: 'Your appointment is confirmed for next week',
    timestamp: 'Thursday',
    unreadCount: 0,
    avatar: 'https://i.pravatar.cc/150?img=17',
    isPinned: false,
    hasStory: false,
    storyViewed: false,
  },
  {
    id: '18',
    name: 'Delivery Updates',
    lastMessage: 'Your package will arrive tomorrow between 2-5 PM',
    timestamp: 'Wednesday',
    unreadCount: 0,
    avatar: 'https://i.pravatar.cc/150?img=18',
    isPinned: false,
    hasStory: false,
    storyViewed: false,
  },
  {
    id: '19',
    name: 'Sophie Martinez',
    lastMessage: 'The concert was absolutely incredible! 🎵',
    timestamp: 'Tuesday',
    unreadCount: 2,
    avatar: 'https://i.pravatar.cc/150?img=19',
    isPinned: false,
    hasStory: true,
    storyViewed: false,
  },
  {
    id: '20',
    name: 'Fitness Buddies',
    lastMessage: 'Kevin: 6 AM run tomorrow, who\'s in?',
    timestamp: 'Tuesday',
    unreadCount: 6,
    avatar: 'https://i.pravatar.cc/150?img=20',
    isPinned: false,
    hasStory: false,
    storyViewed: false,
  },
  {
    id: '21',
    name: 'Ryan O\'Connor',
    lastMessage: 'Thanks for the restaurant recommendation!',
    timestamp: 'Monday',
    unreadCount: 0,
    avatar: 'https://i.pravatar.cc/150?img=21',
    isPinned: false,
    hasStory: true,
    storyViewed: true,
  },
  {
    id: '22',
    name: 'Travel Squad',
    lastMessage: 'Jenny: Found amazing deals for Tokyo trip',
    timestamp: 'Monday',
    unreadCount: 9,
    avatar: 'https://i.pravatar.cc/150?img=22',
    isPinned: false,
    hasStory: false,
    storyViewed: false,
  },
  {
    id: '23',
    name: 'Maya Patel',
    lastMessage: 'Your presentation slides look fantastic',
    timestamp: 'Last week',
    unreadCount: 1,
    avatar: 'https://i.pravatar.cc/150?img=23',
    isPinned: false,
    hasStory: true,
    storyViewed: false,
  },
  {
    id: '24',
    name: 'Study Group',
    lastMessage: 'Tom: Quiz review session at library 3 PM',
    timestamp: 'Last week',
    unreadCount: 4,
    avatar: 'https://i.pravatar.cc/150?img=24',
    isPinned: false,
    hasStory: false,
    storyViewed: false,
  },
  {
    id: '25',
    name: 'Elena Volkov',
    lastMessage: 'Happy birthday! Hope you have a wonderful day 🎉',
    timestamp: 'Last week',
    unreadCount: 0,
    avatar: 'https://i.pravatar.cc/150?img=25',
    isPinned: false,
    hasStory: true,
    storyViewed: true,
  },
  {
    id: '26',
    name: 'Photography Club',
    lastMessage: 'Alex: Golden hour shoot this weekend',
    timestamp: 'Last week',
    unreadCount: 11,
    avatar: 'https://i.pravatar.cc/150?img=26',
    isPinned: false,
    hasStory: false,
    storyViewed: false,
  },
  {
    id: '27',
    name: 'Carlos Rivera',
    lastMessage: 'The new coffee blend is amazing ☕',
    timestamp: 'Last week',
    unreadCount: 0,
    avatar: 'https://i.pravatar.cc/150?img=27',
    isPinned: false,
    hasStory: true,
    storyViewed: false,
  },
  {
    id: '28',
    name: 'Food Lovers',
    lastMessage: 'Nina: Anyone tried the new Thai place?',
    timestamp: 'Last week',
    unreadCount: 7,
    avatar: 'https://i.pravatar.cc/150?img=28',
    isPinned: false,
    hasStory: false,
    storyViewed: false,
  },
  {
    id: '29',
    name: 'Zoe Kim',
    lastMessage: 'Movie night was so much fun! Next time at my place',
    timestamp: '2 weeks ago',
    unreadCount: 1,
    avatar: 'https://i.pravatar.cc/150?img=29',
    isPinned: false,
    hasStory: true,
    storyViewed: true,
  },
  {
    id: '30',
    name: 'Weekend Warriors',
    lastMessage: 'Chris: Hiking trail was challenging but worth it',
    timestamp: '2 weeks ago',
    unreadCount: 5,
    avatar: 'https://i.pravatar.cc/150?img=30',
    isPinned: false,
    hasStory: false,
    storyViewed: false,
  },
  {
    id: '31',
    name: 'Hannah Foster',
    lastMessage: 'Your garden photos are stunning! 🌸',
    timestamp: '2 weeks ago',
    unreadCount: 0,
    avatar: 'https://i.pravatar.cc/150?img=31',
    isPinned: false,
    hasStory: true,
    storyViewed: false,
  },
  {
    id: '32',
    name: 'Language Exchange',
    lastMessage: 'Maria: Spanish conversation practice tomorrow',
    timestamp: '2 weeks ago',
    unreadCount: 3,
    avatar: 'https://i.pravatar.cc/150?img=32',
    isPinned: false,
    hasStory: false,
    storyViewed: false,
  },
  {
    id: '33',
    name: 'Daniel Cooper',
    lastMessage: 'The startup pitch went really well!',
    timestamp: '2 weeks ago',
    unreadCount: 2,
    avatar: 'https://i.pravatar.cc/150?img=33',
    isPinned: false,
    hasStory: true,
    storyViewed: true,
  },
  {
    id: '34',
    name: 'Art Enthusiasts',
    lastMessage: 'Sam: Museum exhibition opens this Friday',
    timestamp: '3 weeks ago',
    unreadCount: 8,
    avatar: 'https://i.pravatar.cc/150?img=34',
    isPinned: false,
    hasStory: false,
    storyViewed: false,
  },
  {
    id: '35',
    name: 'Priya Sharma',
    lastMessage: 'Yoga class was so relaxing today 🧘‍♀️',
    timestamp: '3 weeks ago',
    unreadCount: 0,
    avatar: 'https://i.pravatar.cc/150?img=35',
    isPinned: false,
    hasStory: true,
    storyViewed: false,
  },
  {
    id: '36',
    name: 'Tech Innovations',
    lastMessage: 'Luke: AI conference tickets are available',
    timestamp: '3 weeks ago',
    unreadCount: 12,
    avatar: 'https://i.pravatar.cc/150?img=36',
    isPinned: false,
    hasStory: false,
    storyViewed: false,
  },
];

// Separate component for each chat row to properly use hooks
const ChatRowItem: React.FC<{
  chat: typeof mockChats[0];
  onPress: (id: string, name: string) => void;
  onPin: (id: string) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
  onAvatarPress: (chat: any) => void;
}> = ({ chat, onPress, onPin, onArchive, onDelete, onAvatarPress }) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  // iOS-style icon background color function for swipe gestures
  const getIconBackgroundColor = (iconName: string): string => {
    const iconBackgrounds: { [key: string]: string } = {
      // Swipe gesture icons
      'push-pin': 'rgba(255, 149, 0, 0.15)',        // Orange blur for bookmark/pin
      'push-pin-outline': 'rgba(142, 142, 147, 0.15)', // Gray blur for unbookmark/unpin
      'archive-outline': 'rgba(88, 86, 214, 0.15)',    // Purple blur for archive
      'delete-outline': 'rgba(255, 69, 58, 0.15)',     // Red blur for delete
      // Pin icon for pinned chats
      'pin': 'rgba(255, 149, 0, 0.15)',            // Orange blur for pin
    };
    return iconBackgrounds[iconName] || 'rgba(255, 255, 255, 0.15)';
  };

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { 
      useNativeDriver: true,
      listener: (event: any) => {
        const { translationX } = event.nativeEvent;
        // Add visual feedback during swipe
        const progress = Math.min(Math.abs(translationX) / 100, 1);
        scale.setValue(1 - progress * 0.05); // Slight scale down during swipe
      }
    }
  );

  const onHandlerStateChange = (event: any) => {
    const { state, translationX } = event.nativeEvent;
    
    if (state === State.BEGAN) {
      // Start gesture feedback
      Animated.spring(scale, {
        toValue: 0.98,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }).start();
    }
    
    if (state === State.END || state === State.CANCELLED) {
      if (translationX > 80) {
        // Right swipe - pin/unpin
        onPin(chat.id);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } else if (translationX < -80 && translationX > -160) {
        // Left swipe (short) - archive
        onArchive(chat.id);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } else if (translationX < -160) {
        // Left swipe (long) - delete
        onDelete(chat.id);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }
      
      // Reset position and scale
      Animated.parallel([
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
          tension: 300,
          friction: 20,
        }),
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 300,
          friction: 10,
        })
      ]).start();
    }
  };

  return (
    <MotiView
      key={chat.id}
      from={{ scale: 1 }}
      animate={{ scale: 1 }}
      transition={{ type: 'timing', duration: 100 }}
      style={styles.chatRowContainer}
    >
      {/* Right swipe background - Pin */}
      <View style={styles.swipeBackgroundRight}>
        <Animated.View 
          style={[
            styles.swipeIndicatorRight,
            {
              opacity: translateX.interpolate({
                inputRange: [0, 80],
                outputRange: [0, 1],
                extrapolate: 'clamp',
              }),
              transform: [{
                scale: translateX.interpolate({
                  inputRange: [0, 80],
                  outputRange: [0.8, 1],
                  extrapolate: 'clamp',
                }),
              }],
            }
          ]}
        >
          <View style={[styles.swipeIconContainer, { backgroundColor: getIconBackgroundColor(chat.isPinned ? 'push-pin' : 'push-pin-outline') }]}>
            <MaterialIcon 
              name={chat.isPinned ? 'push-pin' : 'push-pin-outline'} 
              size={18} 
              color="#FFFFFF" 
            />
          </View>
        </Animated.View>
      </View>

      {/* Left swipe backgrounds - Archive & Delete */}
      <View style={styles.swipeBackgroundLeft}>
        {/* Archive indicator */}
        <Animated.View 
          style={[
            styles.swipeIndicatorArchive,
            {
              opacity: translateX.interpolate({
                inputRange: [-160, -80, 0],
                outputRange: [0, 1, 0],
                extrapolate: 'clamp',
              }),
              transform: [{
                scale: translateX.interpolate({
                  inputRange: [-160, -80, 0],
                  outputRange: [0.8, 1, 0.8],
                  extrapolate: 'clamp',
                }),
              }],
            }
          ]}
        >
          <View style={[styles.swipeIconContainer, { backgroundColor: getIconBackgroundColor('archive-outline') }]}>
            <MaterialIcon 
              name="archive-outline" 
              size={18} 
              color="#FFFFFF" 
            />
          </View>
        </Animated.View>

        {/* Delete indicator */}
        <Animated.View 
          style={[
            styles.swipeIndicatorDelete,
            {
              opacity: translateX.interpolate({
                inputRange: [-240, -160, -80],
                outputRange: [1, 1, 0],
                extrapolate: 'clamp',
              }),
              transform: [{
                scale: translateX.interpolate({
                  inputRange: [-240, -160, -80],
                  outputRange: [1, 1, 0.8],
                  extrapolate: 'clamp',
                }),
              }],
            }
          ]}
        >
          <View style={[styles.swipeIconContainer, { backgroundColor: getIconBackgroundColor('delete-outline') }]}>
            <MaterialIcon 
              name="delete-outline" 
              size={18} 
              color="#FFFFFF" 
            />
          </View>
        </Animated.View>
      </View>
      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
        activeOffsetX={10}
        failOffsetY={[-10, 10]}
      >
        <Animated.View style={{ 
          transform: [
            { translateX },
            { scale }
          ] 
        }}>
          <TouchableOpacity
            style={styles.chatRow}
            onPress={() => onPress(chat.id, chat.name)}
            onLongPress={() => onPin(chat.id)}
            delayLongPress={500}
          >
            <View style={styles.chatContent}>
              <TouchableOpacity 
                style={styles.avatarContainer}
                onPress={() => onAvatarPress(chat)}
                activeOpacity={0.7}
              >
                <Avatar
                  source={chat.avatar}
                  name={chat.name}
                  size={56}
                />
                {/* Simple green dot for unviewed stories */}
                {chat.hasStory && !chat.storyViewed && (
                  <View style={styles.storyIndicator} />
                )}
              </TouchableOpacity>
              
              <View style={styles.chatInfo}>
                <View style={styles.chatHeader}>
                  <View style={styles.chatNameContainer}>
                    <Text style={styles.chatName}>{chat.name}</Text>
                    {chat.isPinned && (
                      <View style={[styles.starIconContainer, { backgroundColor: getIconBackgroundColor('pin') }]}>
                        <MaterialIcon 
                          name="pin" 
                          size={12} 
                          color="#FFFFFF" 
                        />
                      </View>
                    )}
                  </View>
                  <Text style={styles.timestamp}>{chat.timestamp}</Text>
                </View>
                
                <View style={styles.chatFooter}>
                  <Text style={styles.lastMessage} numberOfLines={1}>
                    {chat.lastMessage}
                  </Text>
                  {chat.unreadCount > 0 && (
                    <MotiView
                      from={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: 'spring',
                        damping: 12,
                        stiffness: 150,
                        mass: 0.8,
                      }}
                      style={styles.unreadBadge}
                    >
                      <Text style={styles.unreadText}>{chat.unreadCount}</Text>
                    </MotiView>
                  )}
                </View>
              </View>
            </View>
            <View style={styles.separator} />
          </TouchableOpacity>
        </Animated.View>
      </PanGestureHandler>
    </MotiView>
  );
};

export const ChatsListScreen: React.FC = () => {
  const navigation = useNavigation<ChatsListNavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [chats, setChats] = useState(mockChats);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showContactActionsModal, setShowContactActionsModal] = useState(false);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const scrollY = useRef(new Animated.Value(0)).current;

  // Add listener to track scroll offset for dynamic header
  React.useEffect(() => {
    const listener = scrollY.addListener(({ value }) => {
      setScrollOffset(value);
    });

    return () => {
      scrollY.removeListener(listener);
    };
  }, [scrollY]);

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedChats = filteredChats.filter(chat => chat.isPinned);
  const regularChats = filteredChats.filter(chat => !chat.isPinned);

  const handleChatPress = (chatId: string, chatName: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Navigate to ChatRoom in the RootStack
    const rootNavigation = navigation.getParent()?.getParent();
    if (rootNavigation) {
      rootNavigation.navigate('ChatRoom', { chatId, userName: chatName });
    }
  };

  const handleSearchPress = () => {
    setIsSearchVisible(!isSearchVisible);
    if (isSearchVisible) {
      setSearchQuery(''); // Clear search when closing
    }
  };

  const handleNewChatPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Show contact actions modal with options
    setShowContactActionsModal(true);
  };

  const handleAddContact = () => {
    setShowContactActionsModal(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Navigate to AddContact screen - use root navigation to switch stacks
    const parentNav = navigation.getParent();
    if (parentNav) {
      parentNav.navigate('CallsStack', { screen: 'AddContact' });
    }
  };

  const handleImportContacts = () => {
    setShowContactActionsModal(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('ImportContacts');
  };

  const handleCreateGroup = () => {
    setShowContactActionsModal(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Navigate to CreateGroup screen for new chat/group creation
    navigation.navigate('CreateGroup');
  };

  const handlePinChat = (chatId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    setChats(prevChats => 
      prevChats.map(chat => 
        chat.id === chatId 
          ? { ...chat, isPinned: !chat.isPinned }
          : chat
      )
    );
  };

  const handleArchiveChat = (chatId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // TODO: Implement archive functionality
    console.log('Archive chat:', chatId);
    // For now, we'll just show it's archived
    setChats(prevChats => 
      prevChats.map(chat => 
        chat.id === chatId 
          ? { ...chat, isArchived: true }
          : chat
      )
    );
  };

  const handleDeleteChat = (chatId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    // TODO: Show confirmation dialog, then delete
    console.log('Delete chat:', chatId);
    setChats(prevChats => 
      prevChats.filter(chat => chat.id !== chatId)
    );
  };

  const handleAvatarPress = (chat: any) => {
    setSelectedChat(chat);
    setShowAvatarModal(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const renderChatRow = (chat: typeof mockChats[0]) => (
    <ChatRowItem
      key={chat.id}
      chat={chat}
      onPress={handleChatPress}
      onPin={handlePinChat}
      onArchive={handleArchiveChat}
      onDelete={handleDeleteChat}
      onAvatarPress={handleAvatarPress}
    />
  );

  const renderSectionHeaders = () => {
    const hasPinned = pinnedChats.length > 0;
    const hasRegular = regularChats.length > 0;
    
    if (!hasPinned && !hasRegular) return null;
    
    return (
      <View style={styles.sectionHeaderCard}>
        {hasPinned && (
          <View style={[styles.sectionHeaderItem, { marginRight: hasRegular ? tokens.spacing.s : 0 }]}>
            <Text style={styles.sectionTitle}>Pinned</Text>
          </View>
        )}
        {hasRegular && (
          <View style={styles.sectionHeaderItem}>
            <Text style={styles.sectionTitle}>Groups</Text>
          </View>
        )}
      </View>
    );
  };

  const renderSection = (chats: typeof mockChats) => {
    if (chats.length === 0) return null;
    
    return (
      <View style={styles.section}>
        {chats.map(renderChatRow)}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Parallax Background */}
      <Animated.View
        style={[
          styles.backgroundContainer,
          {
            transform: [
              {
                translateY: scrollY.interpolate({
                  inputRange: [0, screenHeight],
                  outputRange: [0, screenHeight * 0.1], // 10% parallax speed
                  extrapolate: 'clamp',
                }),
              },
            ],
          },
        ]}
      >
        <ImageBackground
          source={{
            uri: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxwYXR0ZXJuIGlkPSJmZWF0aGVyIiB4PSIwIiB5PSIwIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPgogICAgICA8cGF0aCBkPSJNMjAgMEwyNSAxMEwyMCAyMEwxNSAxMFoiIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPgogICAgPC9wYXR0ZXJuPgogIDwvZGVmcz4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2ZlYXRoZXIpIi8+Cjwvc3ZnPgo='
          }}
          style={styles.backgroundImage}
          resizeMode="repeat"
        />
      </Animated.View>

      {/* Header */}
      <DynamicHeader
        title="Messages"
        scrollY={scrollOffset}
        titleSize={20}
        rightIcons={[
          { 
            icon: 'magnify', 
            onPress: handleSearchPress 
          },
          { 
            icon: 'message-plus', 
            onPress: handleNewChatPress 
          },
        ]}
      />

      {/* Search Bar */}
      {isSearchVisible && (
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Search messages..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            inputStyle={styles.searchInput}
            iconColor={tokens.colors.onSurface60}
            autoFocus={true}
          />
        </View>
      )}

      {/* Chat List */}
      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          isSearchVisible && { paddingTop: 160 } // Extra space when search is open
        ]}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* Large Title */}
        <MotiView 
          style={styles.largeTitleContainer}
          animate={{
            opacity: scrollOffset < 40 ? 1 : Math.max(0, (60 - scrollOffset) / 20),
            translateY: scrollOffset < 40 ? 0 : Math.min(scrollOffset * 0.3, 20),
          }}
          transition={{
            type: 'timing',
            duration: 200,
          }}
        >
          <Text style={styles.largeTitle}>Messages</Text>
        </MotiView>

        {/* Filter Navigation */}
        <View style={styles.filterContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScrollContent}
          >
            <TouchableOpacity 
              style={[styles.filterChip, styles.filterChipActive]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              activeOpacity={0.8}
            >
              <Text style={[styles.filterChipText, styles.filterChipTextActive]}>All</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.filterChip}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.filterChipText}>Personal</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.filterChip}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                navigation.navigate('Groups');
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.filterChipText}>Groups</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.filterChip}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.filterChipText}>Unread</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {renderSection(pinnedChats)}
        {renderSection(regularChats)}
        
        {filteredChats.length === 0 && searchQuery.length > 0 && (
          <View style={styles.emptyState}>
            <MaterialIcon
              name="message-text-outline"
              size={64}
              color={tokens.colors.onSurface38}
            />
            <Text style={styles.emptyText}>No messages found</Text>
            <Text style={styles.emptySubtext}>
              Try searching with different keywords
            </Text>
          </View>
        )}
      </Animated.ScrollView>

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
            <Text style={styles.modalTitle}>{selectedChat?.name || ''}</Text>
            <View style={styles.modalHeaderSpacer} />
          </View>

          {/* Avatar Image */}
          <View style={styles.modalImageContainer}>
            {selectedChat?.avatar ? (
              <Image
                source={{ uri: selectedChat.avatar }}
                style={styles.modalImage}
                resizeMode="contain"
              />
            ) : (
              <View style={styles.modalPlaceholder}>
                <Text style={styles.modalPlaceholderText}>
                  {selectedChat?.name.charAt(0).toUpperCase() || ''}
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
                if (selectedChat) {
                  handleChatPress(selectedChat.id, selectedChat.name);
                }
              }}
            >
              <MaterialIcon name="message" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.modalActionButton}
              onPress={() => {
                setShowAvatarModal(false);
                // Handle call action
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }}
            >
              <MaterialIcon name="phone" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.modalActionButton}
              onPress={() => {
                setShowAvatarModal(false);
                // Handle video call action
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }}
            >
              <MaterialIcon name="videocam" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Contact Actions Modal */}
      <Modal
        visible={showContactActionsModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowContactActionsModal(false)}
      >
        <View style={styles.modalContainer}>
          {/* Background Overlay */}
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowContactActionsModal(false)}
          />
          
          {/* Modal Content */}
          <View style={styles.contactActionsModal}>
            <View style={styles.contactActionsHeader}>
              <Text style={styles.contactActionsTitle}>Add Contacts</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowContactActionsModal(false)}
              >
                <MaterialIcon name="close" size={24} color={tokens.colors.onSurface60} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.contactActionsContent}>
              {/* Add Contact */}
              <TouchableOpacity
                style={styles.contactActionItem}
                onPress={handleAddContact}
                activeOpacity={0.7}
              >
                <View style={[styles.contactActionIcon, { backgroundColor: '#34C759' }]}>
                  <MaterialIcon name="person_add" size={24} color="#FFFFFF" />
                </View>
                <View style={styles.contactActionText}>
                  <Text style={styles.contactActionTitle}>Add Contact</Text>
                  <Text style={styles.contactActionSubtitle}>Add a new contact manually or by QR code</Text>
                </View>
                <MaterialIcon name="chevron_right" size={20} color={tokens.colors.onSurface38} />
              </TouchableOpacity>

              {/* Import Contacts */}
              <TouchableOpacity
                style={styles.contactActionItem}
                onPress={handleImportContacts}
                activeOpacity={0.7}
              >
                <View style={[styles.contactActionIcon, { backgroundColor: '#007AFF' }]}>
                  <MaterialIcon name="download" size={24} color="#FFFFFF" />
                </View>
                <View style={styles.contactActionText}>
                  <Text style={styles.contactActionTitle}>Import Contacts</Text>
                  <Text style={styles.contactActionSubtitle}>Import from phone, email, or social accounts</Text>
                </View>
                <MaterialIcon name="chevron_right" size={20} color={tokens.colors.onSurface38} />
              </TouchableOpacity>

              {/* Create Group */}
              <TouchableOpacity
                style={styles.contactActionItem}
                onPress={handleCreateGroup}
                activeOpacity={0.7}
              >
                <View style={[styles.contactActionIcon, { backgroundColor: '#FF9500' }]}>
                  <MaterialIcon name="account-multiple-plus" size={24} color="#FFFFFF" />
                </View>
                <View style={styles.contactActionText}>
                  <Text style={styles.contactActionTitle}>Create Group</Text>
                  <Text style={styles.contactActionSubtitle}>Start a new group chat with multiple contacts</Text>
                </View>
                <MaterialIcon name="chevron_right" size={20} color={tokens.colors.onSurface38} />
              </TouchableOpacity>
            </View>
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
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  backgroundImage: {
    flex: 1,
    opacity: 0.05,
  },
  searchContainer: {
    position: 'absolute',
    top: 100, // Below the dynamic header
    left: 0,
    right: 0,
    paddingHorizontal: tokens.spacing.s,
    paddingVertical: tokens.spacing.xs,
    backgroundColor: tokens.colors.bg,
    zIndex: 999,
  },
  searchBar: {
    backgroundColor: tokens.colors.surface1,
    elevation: 0,
  },
  searchInput: {
    color: tokens.colors.onSurface,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: tokens.spacing.xs,
    paddingTop: 100, // Space for header
    paddingBottom: tokens.spacing.xl, // Bottom padding
  },
  section: {
    marginBottom: 0,
  },
  chatRowContainer: {
    // Container for animated chat rows
  },
  sectionHeaderCard: {
    flexDirection: 'row',
    backgroundColor: tokens.colors.surface1,
    borderRadius: tokens.radius.m,
    padding: tokens.spacing.xs / 2,
    marginBottom: tokens.spacing.xs,
    marginHorizontal: 0,
  },
  sectionHeaderItem: {
    flex: 1,
    backgroundColor: tokens.colors.surface2,
    borderRadius: tokens.radius.s,
    paddingVertical: tokens.spacing.xs,
    paddingHorizontal: tokens.spacing.s,
    alignItems: 'center',
  },
  sectionTitle: {
    ...tokens.typography.h2,
    fontSize: 12,
    color: tokens.colors.onSurface,
    fontWeight: '600',
  },
  chatRow: {
    marginBottom: 0,
    backgroundColor: 'transparent',
    borderRadius: tokens.radius.m,
    marginHorizontal: tokens.spacing.xs,
    marginVertical: 2,
  },
  chatContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: tokens.spacing.s,
  },
  avatarContainer: {
    position: 'relative',
    transform: [{ scale: 1.15 }], // Enlarge avatar by 15%
  },
  storyIndicator: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 12,
    height: 12,
    backgroundColor: tokens.colors.secondary, // Green color
    borderRadius: 6, // Perfect circle
    borderWidth: 2,
    borderColor: tokens.colors.bg,
  },
  chatInfo: {
    flex: 1,
    marginLeft: tokens.spacing.m,
    justifyContent: 'center',
  },
  separator: {
    height: 1,
    backgroundColor: tokens.colors.onSurface,
    opacity: 0.1,
    marginLeft: 80, // Align with text content, accounting for avatar width
    marginRight: tokens.spacing.s,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.spacing.xs / 2,
  },
  chatNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: tokens.spacing.xs / 2,
  },
  chatName: {
    ...tokens.typography.h2,
    color: tokens.colors.onSurface,
    flex: 1,
  },
  timestamp: {
    ...tokens.typography.caption,
    color: tokens.colors.onSurface60,
  },
  chatFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: tokens.spacing.xs / 2,
  },
  lastMessage: {
    ...tokens.typography.body,
    color: tokens.colors.onSurface60,
    flex: 1,
    marginRight: tokens.spacing.xs,
  },
  unreadBadge: {
    backgroundColor: tokens.colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginLeft: tokens.spacing.xs,
    flexShrink: 0,
  },
  unreadText: {
    ...tokens.typography.caption,
    color: tokens.colors.onSurface,
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: tokens.spacing.xl,
  },
  emptyText: {
    ...tokens.typography.h2,
    color: tokens.colors.onSurface60,
    marginTop: tokens.spacing.m,
  },
  emptySubtext: {
    ...tokens.typography.body,
    color: tokens.colors.onSurface38,
    marginTop: tokens.spacing.xs,
  },
  largeTitleContainer: {
    paddingHorizontal: tokens.spacing.s,
    paddingTop: tokens.spacing.xl,
    paddingBottom: tokens.spacing.m,
  },
  largeTitle: {
    ...tokens.typography.largeTitle, // iOS Large Title style
    color: tokens.colors.onSurface,
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginTop: tokens.spacing.m,
  },
  filterContainer: {
    paddingVertical: tokens.spacing.s,
    paddingBottom: tokens.spacing.m,
  },
  filterScrollContent: {
    paddingHorizontal: tokens.spacing.m,
  },
  filterChip: {
    backgroundColor: tokens.colors.surface2,
    paddingHorizontal: tokens.spacing.m,
    paddingVertical: tokens.spacing.s,
    borderRadius: 20,
    marginRight: tokens.spacing.s,
    minHeight: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterChipActive: {
    backgroundColor: tokens.colors.primary,
  },
  filterChipText: {
    ...tokens.typography.caption,
    color: tokens.colors.onSurface60,
    fontWeight: '500',
    fontSize: 12,
  },
  filterChipTextActive: {
    color: tokens.colors.onSurface,
    fontWeight: '600',
  },
  swipeBackground: {
    position: 'absolute',
    left: tokens.spacing.m,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'flex-start',
    width: 60,
    zIndex: 0,
  },
  swipeIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: tokens.colors.surface2,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: tokens.spacing.s,
  },
  swipeBackgroundRight: {
    position: 'absolute',
    left: tokens.spacing.m,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'flex-start',
    width: 80,
    zIndex: 0,
  },
  swipeBackgroundLeft: {
    position: 'absolute',
    right: tokens.spacing.m,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'flex-end',
    width: 200,
    zIndex: 0,
    flexDirection: 'row',
    paddingRight: tokens.spacing.s,
  },
  swipeIndicatorRight: {
    width: 40,
    height: 40,
    borderRadius: 20,
    // backgroundColor removed - now handled by swipeIconContainer
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: tokens.spacing.s,
  },
  swipeIndicatorArchive: {
    width: 40,
    height: 40,
    borderRadius: 20,
    // backgroundColor removed - now handled by swipeIconContainer
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: tokens.spacing.s,
  },
  swipeIndicatorDelete: {
    width: 40,
    height: 40,
    borderRadius: 20,
    // backgroundColor removed - now handled by swipeIconContainer
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: tokens.spacing.s,
  },
  swipeIconText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#FFFFFF',
  },
  swipeIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  starIconContainer: {
    width: 18,
    height: 18,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
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
  // Contact Actions Modal styles
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  contactActionsModal: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: tokens.colors.surface1,
    borderTopLeftRadius: tokens.radius.l,
    borderTopRightRadius: tokens.radius.l,
    paddingBottom: 34, // Safe area padding for iPhone
    maxHeight: '70%',
  },
  contactActionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: tokens.spacing.m,
    paddingVertical: tokens.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.separator,
  },
  contactActionsTitle: {
    ...tokens.typography.h3,
    color: tokens.colors.onSurface,
    fontWeight: '600',
  },
  contactActionsContent: {
    padding: tokens.spacing.m,
  },
  contactActionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: tokens.spacing.m,
    paddingHorizontal: tokens.spacing.s,
    marginBottom: tokens.spacing.s,
    borderRadius: tokens.radius.m,
    backgroundColor: tokens.colors.surface2,
  },
  contactActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: tokens.spacing.m,
  },
  contactActionText: {
    flex: 1,
  },
  contactActionTitle: {
    ...tokens.typography.headline,
    color: tokens.colors.onSurface,
    fontWeight: '600',
    marginBottom: 2,
  },
  contactActionSubtitle: {
    ...tokens.typography.footnote,
    color: tokens.colors.onSurface60,
  },
});
