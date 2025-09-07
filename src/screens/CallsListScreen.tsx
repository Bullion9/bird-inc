import React, { useState, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  Animated,
  ImageBackground,
  Dimensions,
  TextInput,
  Modal,
  Image
} from 'react-native';
import { Text } from 'react-native-paper';
import { MotiView } from 'moti';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as Haptics from 'expo-haptics';

import { tokens } from '../theme/tokens';
import { CallsStackParamList } from '../navigation/types';
import { DynamicHeader, Avatar, MaterialIcon } from '../components';

type CallsListNavigationProp = StackNavigationProp<CallsStackParamList, 'CallsList'>;

interface CallItem {
  id: string;
  name: string;
  avatar: string;
  type: 'outgoing' | 'incoming' | 'missed';
  callType: 'audio' | 'video'; // New field to distinguish call types
  timestamp: Date;
  duration?: string;
  hasStory?: boolean;
  storyViewed?: boolean;
}

export const CallsListScreen: React.FC = () => {
  const navigation = useNavigation<CallsListNavigationProp>();
  const [scrollOffset, setScrollOffset] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState<CallItem | null>(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  const screenHeight = Dimensions.get('window').height;
  
  // Add listener to track scroll offset for dynamic header
  React.useEffect(() => {
    const listener = scrollY.addListener(({ value }) => {
      setScrollOffset(value);
    });

    return () => {
      scrollY.removeListener(listener);
    };
  }, [scrollY]);

  // iOS-style icon background colors
  const getIconBackgroundColor = (iconName: string, callType?: string): string => {
    // Use neutral background for call direction icons since the icon itself will be colored
    const iconBackgrounds: { [key: string]: string } = {
      call_made: 'rgba(255, 255, 255, 0.1)',     // Neutral background for outgoing calls
      call_received: 'rgba(255, 255, 255, 0.1)', // Neutral background for received calls
      phone: 'rgba(0, 122, 255, 0.15)',          // Blue blur for phone calls
      video: 'rgba(255, 149, 0, 0.15)',          // Orange blur for video calls
    };
    return iconBackgrounds[iconName] || 'rgba(255, 255, 255, 0.15)';
  };
  
  // Get icon color based on call type
  const getCallIconColor = (callType: CallItem['type']): string => {
    switch (callType) {
      case 'missed':
        return '#FF453A'; // Red for missed calls
      case 'incoming':
        return '#34C759'; // Green for received calls
      case 'outgoing':
        return '#007AFF'; // Blue for outgoing calls
      default:
        return '#FFFFFF'; // White default
    }
  };

  const [calls, setCalls] = useState<CallItem[]>([
    {
      id: '1',
      name: 'Emma Wilson',
      avatar: 'https://i.pravatar.cc/150?img=1',
      type: 'outgoing',
      callType: 'video',
      timestamp: new Date(Date.now() - 3600000), // 1 hour ago
      duration: '12:34',
      hasStory: true,
      storyViewed: false,
    },
    {
      id: '2',
      name: 'Alex Chen',
      avatar: 'https://i.pravatar.cc/150?img=2',
      type: 'incoming',
      callType: 'audio',
      timestamp: new Date(Date.now() - 7200000), // 2 hours ago
      duration: '05:21',
      hasStory: false,
      storyViewed: false,
    },
    {
      id: '3',
      name: 'Sarah Johnson',
      avatar: 'https://i.pravatar.cc/150?img=3',
      type: 'missed',
      callType: 'video',
      timestamp: new Date(Date.now() - 10800000), // 3 hours ago
      hasStory: true,
      storyViewed: true,
    },
    {
      id: '4',
      name: 'Mike Davis',
      avatar: 'https://i.pravatar.cc/150?img=4',
      type: 'outgoing',
      callType: 'audio',
      timestamp: new Date(Date.now() - 14400000), // 4 hours ago
      duration: '23:45',
      hasStory: true,
      storyViewed: false,
    },
    {
      id: '5',
      name: 'Lisa Brown',
      avatar: 'https://i.pravatar.cc/150?img=5',
      type: 'incoming',
      callType: 'video',
      timestamp: new Date(Date.now() - 86400000), // 1 day ago
      duration: '01:12',
      hasStory: false,
      storyViewed: false,
    },
    {
      id: '6',
      name: 'David Wilson',
      avatar: 'https://i.pravatar.cc/150?img=6',
      type: 'missed',
      callType: 'audio',
      timestamp: new Date(Date.now() - 172800000), // 2 days ago
      hasStory: true,
      storyViewed: true,
    },
    {
      id: '7',
      name: 'Anna Taylor',
      avatar: 'https://i.pravatar.cc/150?img=7',
      type: 'outgoing',
      callType: 'video',
      timestamp: new Date(Date.now() - 259200000), // 3 days ago
      duration: '08:33',
      hasStory: true,
      storyViewed: false,
    },
    {
      id: '8',
      name: 'James Miller',
      avatar: 'https://i.pravatar.cc/150?img=8',
      type: 'incoming',
      callType: 'audio',
      timestamp: new Date(Date.now() - 345600000), // 4 days ago
      duration: '15:07',
      hasStory: false,
      storyViewed: false,
    },
    {
      id: '9',
      name: 'Sophie Garcia',
      avatar: 'https://i.pravatar.cc/150?img=9',
      type: 'outgoing',
      callType: 'video',
      timestamp: new Date(Date.now() - 432000000), // 5 days ago
      duration: '06:42',
      hasStory: true,
      storyViewed: true,
    },
    {
      id: '10',
      name: 'Ryan Thompson',
      avatar: 'https://i.pravatar.cc/150?img=10',
      type: 'missed',
      callType: 'audio',
      timestamp: new Date(Date.now() - 518400000), // 6 days ago
      hasStory: true,
      storyViewed: false,
    },
    {
      id: '11',
      name: 'Maya Singh',
      avatar: 'https://i.pravatar.cc/150?img=11',
      type: 'incoming',
      callType: 'video',
      timestamp: new Date(Date.now() - 604800000), // 1 week ago
      duration: '18:23',
      hasStory: false,
      storyViewed: false,
    },
    {
      id: '12',
      name: 'Carlos Rodriguez',
      avatar: 'https://i.pravatar.cc/150?img=12',
      type: 'outgoing',
      callType: 'audio',
      timestamp: new Date(Date.now() - 691200000), // 8 days ago
      duration: '03:17',
      hasStory: true,
      storyViewed: true,
    },
    {
      id: '13',
      name: 'Elena Petrov',
      avatar: 'https://i.pravatar.cc/150?img=13',
      type: 'incoming',
      callType: 'video',
      timestamp: new Date(Date.now() - 777600000), // 9 days ago
      duration: '11:55',
      hasStory: true,
      storyViewed: false,
    },
    {
      id: '14',
      name: 'Kevin O\'Brien',
      avatar: 'https://i.pravatar.cc/150?img=14',
      type: 'missed',
      callType: 'audio',
      timestamp: new Date(Date.now() - 864000000), // 10 days ago
      hasStory: false,
      storyViewed: false,
    },
    {
      id: '15',
      name: 'Priya Sharma',
      avatar: 'https://i.pravatar.cc/150?img=15',
      type: 'outgoing',
      callType: 'video',
      timestamp: new Date(Date.now() - 950400000), // 11 days ago
      duration: '22:08',
      hasStory: true,
      storyViewed: true,
    },
  ]);

  // Filter calls based on search query
  const filteredCalls = calls.filter(call =>
    call.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCallTypeText = (type: CallItem['type']) => {
    switch (type) {
      case 'outgoing':
        return 'Outgoing';
      case 'incoming':
        return 'Incoming';
      case 'missed':
        return ''; // Don't show "Missed" text, use red name instead
      default:
        return '';
    }
  };

  const getCallIcon = (type: CallItem['type'], callType: CallItem['callType']) => {
    const baseIcon = callType === 'video' ? 'videocam' : 'call';
    
    switch (type) {
      case 'outgoing':
        return { name: 'call_made', color: tokens.colors.success };
      case 'incoming':
        return { name: 'call_received', color: tokens.colors.success };
      case 'missed':
        return { name: 'call_received', color: tokens.colors.error };
      default:
        return { name: baseIcon, color: tokens.colors.success };
    }
  };

  const getCallTypeIcon = (callType: CallItem['callType']) => {
    return callType === 'video' ? 'videocam' : 'call';
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const handleCallPress = (call: CallItem) => {
    console.log('Navigating to CallScreen with params:', { 
      contactName: call.name,
      contactAvatar: call.avatar,
      isIncoming: false,
      callId: call.id,
      isVideo: false
    });
    navigation.navigate('CallScreen', { 
      contactName: call.name,
      contactAvatar: call.avatar,
      isIncoming: false,
      callId: call.id,
      isVideo: false
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleTestVideoCall = () => {
    // Navigate to video call with test data
    navigation.navigate('VideoCall', {
      contactId: 'test-contact',
      contactName: 'Test Contact',
      contactAvatar: 'https://i.pravatar.cc/150?img=1',
      isIncoming: false
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleVideoCallPress = (call: CallItem) => {
    console.log('Navigating to VideoCall with params:', { 
      contactId: call.id,
      contactName: call.name,
      contactAvatar: call.avatar,
      isIncoming: false
    });
    navigation.navigate('VideoCall', { 
      contactId: call.id,
      contactName: call.name,
      contactAvatar: call.avatar,
      isIncoming: false
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleContactDetails = (call: CallItem) => {
    navigation.navigate('ContactDetails', {
      contactId: call.id,
      contactName: call.name,
      contactAvatar: call.avatar,
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleAvatarPress = (call: CallItem) => {
    setSelectedContact(call);
    setShowAvatarModal(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const renderCallItem = ({ item, index }: { item: CallItem; index: number }) => {
    const icon = getCallIcon(item.type, item.callType);
    const callTypeIcon = getCallTypeIcon(item.callType);
    
    return (
      <>
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 300 }}
        >
          <TouchableOpacity
            style={styles.callRow}
            onPress={() => handleCallPress(item)}
            onLongPress={() => handleContactDetails(item)}
            activeOpacity={0.7}
          >
            <View style={styles.leftSection}>
              <TouchableOpacity 
                style={styles.avatarContainer}
                onPress={() => handleAvatarPress(item)}
                activeOpacity={0.7}
              >
                <Avatar
                  source={item.avatar}
                  name={item.name}
                  size={48}
                />
                {/* Simple green dot for unviewed stories */}
                {item.hasStory && !item.storyViewed && (
                  <View style={styles.storyIndicator} />
                )}
              </TouchableOpacity>
            </View>
            
            <View style={styles.middleSection}>
              <TouchableOpacity 
                onPress={() => handleContactDetails(item)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.contactName,
                  item.type === 'missed' && styles.missedContactName
                ]} numberOfLines={1}>
                  {item.name}
                </Text>
              </TouchableOpacity>
              <View style={styles.callInfo}>
                <View style={[styles.callIconContainer, { backgroundColor: getIconBackgroundColor(icon.name, item.type) }]}>
                  <MaterialIcon 
                    name={icon.name} 
                    size={16} 
                    color={getCallIconColor(item.type)}
                  />
                </View>
                <View style={[styles.callTypeIconContainer, { backgroundColor: getIconBackgroundColor(callTypeIcon) }]}>
                  <MaterialIcon 
                    name={callTypeIcon} 
                    size={14} 
                    color="#FFFFFF"
                  />
                </View>
                <Text style={styles.callType}>
                  {getCallTypeText(item.type)}{getCallTypeText(item.type) && ' '}{item.callType === 'video' ? 'Video' : 'Call'}
                </Text>
                {item.duration && (
                  <>
                    <Text style={styles.separator}>•</Text>
                    <Text style={styles.duration}>{item.duration}</Text>
                  </>
                )}
              </View>
              <Text style={styles.timestamp}>
                {formatTime(item.timestamp)}
              </Text>
            </View>
            
            <View style={styles.rightSection}>
              <TouchableOpacity
                style={[styles.callButton, { 
                  backgroundColor: getIconBackgroundColor(
                    item.callType === 'video' ? 'video' : 'phone'
                  ) 
                }]}
                onPress={() => {
                  if (item.callType === 'video') {
                    handleVideoCallPress(item);
                  } else {
                    handleCallPress(item);
                  }
                }}
              >
                <MaterialIcon 
                  name={item.callType === 'video' ? 'video' : 'phone'} 
                  size={24} 
                  color="#FFFFFF"
                />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </MotiView>
        {index < calls.length - 1 && <View style={styles.listSeparator} />}
      </>
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
            uri: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxwYXR0ZXJuIGlkPSJjYWxsIiB4PSIwIiB5PSIwIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPgogICAgICA8Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSI0IiBmaWxsPSIjZmZmZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDMiLz4KICAgIDwvcGF0dGVybj4KICA8L2RlZnM+CiAgPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNjYWxsKSIvPgo8L3N2Zz4K'
          }}
          style={styles.backgroundImage}
          resizeMode="repeat"
        />
      </Animated.View>

      {/* Header */}
      <DynamicHeader 
        title="Recent"
        scrollY={scrollOffset}
        showBackButton={false}
        titleSize={20}
        rightIcons={[
          {
            icon: 'favorite',
            onPress: () => {
              navigation.navigate('FavoriteContacts');
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
          },
          {
            icon: 'settings',
            onPress: () => {
              navigation.navigate('CallSettings');
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
          }
        ]}
      />
      
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
        {/* Large Title - Rewritten */}
        <View style={styles.titleSection}>
          <Text style={styles.pageTitle}>Recent</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <MaterialIcon 
              name="search" 
              size={20} 
              color="rgba(142, 142, 147, 0.6)" 
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search calls..."
              placeholderTextColor="rgba(142, 142, 147, 0.6)"
              value={searchQuery}
              onChangeText={setSearchQuery}
              clearButtonMode="while-editing"
            />
          </View>
        </View>

        {/* Call List */}
        {filteredCalls.length > 0 ? (
          filteredCalls.map((item, index) => (
            <React.Fragment key={item.id}>
              {renderCallItem({ item, index })}
            </React.Fragment>
          ))
        ) : searchQuery.length > 0 ? (
          <View style={styles.noResultsContainer}>
            <MaterialIcon 
              name="search_off" 
              size={48} 
              color="rgba(142, 142, 147, 0.5)" 
            />
            <Text style={styles.noResultsText}>No calls found</Text>
            <Text style={styles.noResultsSubtext}>Try searching for a different name</Text>
          </View>
        ) : (
          filteredCalls.map((item, index) => (
            <React.Fragment key={item.id}>
              {renderCallItem({ item, index })}
            </React.Fragment>
          ))
        )}

        {/* Add Contact Section - Only show when not searching */}
        {/* Removed - moved to FAB */}
      </Animated.ScrollView>

      {/* Floating Action Button */}
      <MotiView
        from={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 15, stiffness: 150, delay: 500 }}
        style={styles.fab}
      >
        <TouchableOpacity
          style={styles.fabButton}
          onPress={() => {
            // Navigate to add contact screen
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.navigate('AddContact');
          }}
          activeOpacity={0.8}
        >
          <MaterialIcon 
            name="person_add" 
            size={24} 
            color="#FFFFFF" 
          />
        </TouchableOpacity>
      </MotiView>

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
            <Text style={styles.modalTitle}>{selectedContact?.name || ''}</Text>
            <View style={styles.modalHeaderSpacer} />
          </View>

          {/* Avatar Image */}
          <View style={styles.modalImageContainer}>
            {selectedContact?.avatar ? (
              <Image
                source={{ uri: selectedContact.avatar }}
                style={styles.modalImage}
                resizeMode="contain"
              />
            ) : (
              <View style={styles.modalPlaceholder}>
                <Text style={styles.modalPlaceholderText}>
                  {selectedContact?.name.charAt(0).toUpperCase() || ''}
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
                if (selectedContact) {
                  // Navigate to chat/message
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                }
              }}
            >
              <MaterialIcon name="message" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.modalActionButton}
              onPress={() => {
                setShowAvatarModal(false);
                if (selectedContact) {
                  handleCallPress(selectedContact);
                }
              }}
            >
              <MaterialIcon name="phone" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.modalActionButton}
              onPress={() => {
                setShowAvatarModal(false);
                if (selectedContact) {
                  handleVideoCallPress(selectedContact);
                }
              }}
            >
              <MaterialIcon name="videocam" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalActionButton}
              onPress={() => {
                setShowAvatarModal(false);
                if (selectedContact) {
                  handleContactDetails(selectedContact);
                }
              }}
            >
              <MaterialIcon name="info" size={24} color="#FFFFFF" />
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
    paddingHorizontal: tokens.spacing.s, // Reduced from xs to s for tighter layout
    paddingTop: 100, // Space for header - same as ChatsListScreen
    paddingBottom: tokens.spacing.xl, // Bottom padding
  },
  largeTitleContainer: {
    paddingHorizontal: tokens.spacing.s,
    paddingTop: tokens.spacing.xl,
    paddingBottom: tokens.spacing.m,
    marginTop: 20, // Extra top margin to push text down
  },
  largeTitle: {
    ...tokens.typography.h1,
    color: tokens.colors.onSurface,
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginTop: 30, // Even more top margin
  },
  titleSection: {
    paddingHorizontal: tokens.spacing.s,
    paddingTop: tokens.spacing.xl,
    paddingBottom: tokens.spacing.m,
  },
  pageTitle: {
    ...tokens.typography.largeTitle, // iOS Large Title style
    fontSize: 36,
    fontWeight: '700',
    color: tokens.colors.onSurface,
    letterSpacing: -0.5,
    marginTop: tokens.spacing.m,
    marginBottom: 0,
    paddingTop: 0,
    paddingBottom: 0,
  },
  callRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: tokens.spacing.s,
    paddingHorizontal: tokens.spacing.s, // Add horizontal padding
  },
  leftSection: {
    marginRight: tokens.spacing.s, // Reduced margin
  },
  middleSection: {
    flex: 1,
    gap: tokens.spacing.xs,
  },
  rightSection: {
    marginLeft: tokens.spacing.s, // Reduced margin
    flexDirection: 'row',
    alignItems: 'center',
    gap: 0,
  },
  contactName: {
    ...tokens.typography.body,
    color: tokens.colors.onSurface,
    fontWeight: '600',
  },
  missedContactName: {
    color: '#FF453A', // Red color for missed calls
  },
  callInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.xs,
  },
  callIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  callTypeIconContainer: {
    width: 20,
    height: 20,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  callType: {
    ...tokens.typography.caption,
    color: tokens.colors.onSurface60,
  },
  separator: {
    ...tokens.typography.caption,
    color: tokens.colors.onSurface38,
  },
  duration: {
    ...tokens.typography.caption,
    color: tokens.colors.onSurface60,
  },
  timestamp: {
    ...tokens.typography.caption,
    color: tokens.colors.onSurface38,
    fontSize: 12,
  },
  callButton: {
    width: 36, // Reduced from 40
    height: 36, // Reduced from 40
    borderRadius: 10, // Reduced from 12
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 2, // Reduced from 4
  },
  avatarContainer: {
    position: 'relative',
    transform: [{ scale: 1.0 }], // Reduced from 1.15 to make it smaller
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
  listSeparator: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginLeft: 60, // Reduced from 72 to align with smaller avatar
    marginRight: 16,
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
    opacity: 0.8,
  },
  searchContainer: {
    paddingHorizontal: tokens.spacing.m,
    paddingBottom: tokens.spacing.m,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.surface1,
    borderRadius: tokens.radius.m,
    paddingHorizontal: tokens.spacing.m,
    paddingVertical: tokens.spacing.s,
  },
  searchInput: {
    flex: 1,
    marginLeft: tokens.spacing.s,
    ...tokens.typography.body,
    color: tokens.colors.onSurface,
    fontSize: 16,
  },
  noResultsContainer: {
    alignItems: 'center',
    paddingVertical: tokens.spacing.xl,
    paddingHorizontal: tokens.spacing.m,
  },
  noResultsText: {
    ...tokens.typography.body,
    color: tokens.colors.onSurface,
    fontWeight: '600',
    marginTop: tokens.spacing.m,
  },
  noResultsSubtext: {
    ...tokens.typography.caption,
    color: tokens.colors.onSurface60,
    marginTop: tokens.spacing.xs,
  },
  fab: {
    position: 'absolute',
    bottom: 32,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  fabButton: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
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
    gap: 24,
  },
  modalActionButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
