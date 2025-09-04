import React, { useState, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  ImageBackground, 
  Dimensions, 
  TouchableOpacity,
  Animated
} from 'react-native';
import { Text, FAB, Searchbar } from 'react-native-paper';
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
  },
  {
    id: '2',
    name: 'Bob Smith',
    lastMessage: 'Can we meet tomorrow?',
    timestamp: '1:45 PM',
    unreadCount: 0,
    avatar: 'https://i.pravatar.cc/150?img=2',
    isPinned: true,
  },
  {
    id: '3',
    name: 'Carol Williams',
    lastMessage: 'Thanks for the help!',
    timestamp: '12:20 PM',
    unreadCount: 1,
    avatar: 'https://i.pravatar.cc/150?img=3',
    isPinned: false,
  },
  {
    id: '4',
    name: 'David Brown',
    lastMessage: 'See you later 👋',
    timestamp: '11:15 AM',
    unreadCount: 0,
    avatar: 'https://i.pravatar.cc/150?img=4',
    isPinned: false,
  },
  {
    id: '5',
    name: 'Emma Davis',
    lastMessage: 'Got the files, reviewing now',
    timestamp: '10:30 AM',
    unreadCount: 2,
    avatar: 'https://i.pravatar.cc/150?img=5',
    isPinned: false,
  },
];

export const ChatsListScreen: React.FC = () => {
  const navigation = useNavigation<ChatsListNavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [scrollOffset, setScrollOffset] = useState(0);
  const scrollY = useRef(new Animated.Value(0)).current;
  const searchAnimation = useRef(new Animated.Value(0)).current;

  // Add listener to track scroll offset for dynamic header
  React.useEffect(() => {
    const listener = scrollY.addListener(({ value }) => {
      setScrollOffset(value);
    });

    return () => {
      scrollY.removeListener(listener);
    };
  }, [scrollY]);

  const filteredChats = mockChats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedChats = filteredChats.filter(chat => chat.isPinned);
  const regularChats = filteredChats.filter(chat => !chat.isPinned);

  const handleChatPress = (chatId: string, chatName: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('ChatRoom', { chatId, userName: chatName });
  };

  const handleSearchPress = () => {
    setIsSearchVisible(!isSearchVisible);
    Animated.timing(searchAnimation, {
      toValue: isSearchVisible ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const handleNewChatPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // TODO: Navigate to new chat screen
  };

  const handleFABPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // TODO: Navigate to new message screen
  };

  const renderChatRow = (chat: typeof mockChats[0]) => (
    <MotiView
      key={chat.id}
      from={{ scale: 1 }}
      animate={{ scale: 1 }}
      transition={{ type: 'timing', duration: 100 }}
      style={styles.chatRowContainer}
    >
      <BirdCard
        style={styles.chatRow}
        onPress={() => handleChatPress(chat.id, chat.name)}
      >
        <View style={styles.chatContent}>
          <Avatar
            source={chat.avatar}
            name={chat.name}
            size={48}
          />
          
          <View style={styles.chatInfo}>
            <View style={styles.chatHeader}>
              <Text style={styles.chatName}>{chat.name}</Text>
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
      </BirdCard>
    </MotiView>
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
            <Text style={styles.sectionTitle}>Chats</Text>
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
        scrollOffset={scrollOffset}
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
      <Animated.View
        style={[
          styles.searchContainer,
          {
            height: searchAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 60],
            }),
            opacity: searchAnimation,
          },
        ]}
      >
        <Searchbar
          placeholder="Search messages..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
          iconColor={tokens.colors.onSurface60}
        />
      </Animated.View>

      {/* Chat List */}
      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {renderSectionHeaders()}
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

      {/* FAB */}
      <MotiView
        from={{ scale: 0, rotate: '0deg' }}
        animate={{ scale: 1, rotate: '45deg' }}
        transition={{
          type: 'spring',
          damping: 12,
          stiffness: 150,
          delay: 300,
        }}
        style={styles.fabContainer}
      >
        <FAB
          icon="pencil"
          onPress={handleFABPress}
          style={[styles.fab, { backgroundColor: tokens.colors.primary }]}
          customSize={56}
        />
      </MotiView>
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
    paddingHorizontal: tokens.spacing.s,
    overflow: 'hidden',
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
    padding: tokens.spacing.xs,
    paddingTop: 14, // Slightly reduced spacing from header to first element
    paddingBottom: tokens.spacing.s + 56, // Reduced bottom space for FAB
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
    fontSize: 16,
    color: tokens.colors.onSurface,
    fontWeight: '600',
  },
  chatRow: {
    marginBottom: 0,
  },
  chatContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: tokens.spacing.s,
  },
  chatInfo: {
    flex: 1,
    marginLeft: tokens.spacing.s,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.spacing.xs / 2,
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
    alignItems: 'center',
  },
  lastMessage: {
    ...tokens.typography.body,
    color: tokens.colors.onSurface60,
    flex: 1,
    marginRight: tokens.spacing.xs,
  },
  unreadBadge: {
    backgroundColor: tokens.colors.primary,
    borderRadius: 12,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    ...tokens.typography.caption,
    color: tokens.colors.onSurface,
    fontSize: 11,
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
  fabContainer: {
    position: 'absolute',
    right: tokens.spacing.m,
    bottom: tokens.spacing.m,
  },
  fab: {
    elevation: tokens.elevation.fab,
  },
});
