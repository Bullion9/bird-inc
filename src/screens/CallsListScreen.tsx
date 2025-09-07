import React, { useState, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  Animated,
  ImageBackground,
  Dimensions
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
  timestamp: Date;
  duration?: string;
  hasStory?: boolean;
  storyViewed?: boolean;
}

export const CallsListScreen: React.FC = () => {
  const navigation = useNavigation<CallsListNavigationProp>();
  const [scrollOffset, setScrollOffset] = useState(0);
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
  
  const [calls, setCalls] = useState<CallItem[]>([
    {
      id: '1',
      name: 'Emma Wilson',
      avatar: 'https://i.pravatar.cc/150?img=1',
      type: 'outgoing',
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
      timestamp: new Date(Date.now() - 10800000), // 3 hours ago
      hasStory: true,
      storyViewed: true,
    },
    {
      id: '4',
      name: 'Mike Davis',
      avatar: 'https://i.pravatar.cc/150?img=4',
      type: 'outgoing',
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
      timestamp: new Date(Date.now() - 172800000), // 2 days ago
      hasStory: true,
      storyViewed: true,
    },
    {
      id: '7',
      name: 'Anna Taylor',
      avatar: 'https://i.pravatar.cc/150?img=7',
      type: 'outgoing',
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
      timestamp: new Date(Date.now() - 518400000), // 6 days ago
      hasStory: true,
      storyViewed: false,
    },
    {
      id: '11',
      name: 'Maya Singh',
      avatar: 'https://i.pravatar.cc/150?img=11',
      type: 'incoming',
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
      timestamp: new Date(Date.now() - 864000000), // 10 days ago
      hasStory: false,
      storyViewed: false,
    },
    {
      id: '15',
      name: 'Priya Sharma',
      avatar: 'https://i.pravatar.cc/150?img=15',
      type: 'outgoing',
      timestamp: new Date(Date.now() - 950400000), // 11 days ago
      duration: '22:08',
      hasStory: true,
      storyViewed: true,
    },
  ]);

  const getCallTypeText = (type: CallItem['type']) => {
    switch (type) {
      case 'outgoing':
        return 'Outgoing';
      case 'incoming':
        return 'Incoming';
      case 'missed':
        return 'Missed';
      default:
        return '';
    }
  };

  const getCallIcon = (type: CallItem['type']) => {
    switch (type) {
      case 'outgoing':
        return { name: 'call_made', color: tokens.colors.success };
      case 'incoming':
        return { name: 'call_received', color: tokens.colors.success };
      case 'missed':
        return { name: 'call_received', color: tokens.colors.error };
      default:
        return { name: 'call', color: tokens.colors.success };
    }
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

  const handleDelete = (callId: string) => {
    setCalls(prev => prev.filter(call => call.id !== callId));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  };

  const renderCallItem = ({ item, index }: { item: CallItem; index: number }) => {
    const icon = getCallIcon(item.type);
    
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
            activeOpacity={0.7}
          >
            <View style={styles.leftSection}>
              <View style={styles.avatarContainer}>
                <Avatar
                  source={item.avatar}
                  name={item.name}
                  size={48}
                />
                {/* Simple green dot for unviewed stories */}
                {item.hasStory && !item.storyViewed && (
                  <View style={styles.storyIndicator} />
                )}
              </View>
            </View>
            
            <View style={styles.middleSection}>
              <Text style={styles.contactName} numberOfLines={1}>
                {item.name}
              </Text>
              <View style={styles.callInfo}>
                <MaterialIcon 
                  name={icon.name} 
                  size={16} 
                  color={icon.color} 
                />
                <Text style={[
                  styles.callType,
                  item.type === 'missed' && styles.missedCallType
                ]}>
                  {getCallTypeText(item.type)}
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
                style={styles.callButton}
                onPress={() => handleCallPress(item)}
              >
                <MaterialIcon 
                  name="phone" 
                  size={24} 
                  color={tokens.colors.onSurface60} 
                />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.callButton}
                onPress={() => handleVideoCallPress(item)}
              >
                <MaterialIcon 
                  name="video" 
                  size={24} 
                  color={tokens.colors.primary} 
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
            icon: 'phone',
            onPress: () => handleCallPress({
              id: 'test-voice',
              name: 'Test Voice Call',
              avatar: 'https://i.pravatar.cc/150?img=1',
              type: 'outgoing',
              timestamp: new Date()
            })
          },
          {
            icon: 'video',
            onPress: handleTestVideoCall
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

        {/* Call List */}
        {calls.map((item, index) => (
          <React.Fragment key={item.id}>
            {renderCallItem({ item, index })}
          </React.Fragment>
        ))}
      </Animated.ScrollView>
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
    paddingHorizontal: tokens.spacing.xs,
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
  },
  leftSection: {
    marginRight: tokens.spacing.m,
  },
  middleSection: {
    flex: 1,
    gap: tokens.spacing.xs,
  },
  rightSection: {
    marginLeft: tokens.spacing.m,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 0,
  },
  contactName: {
    ...tokens.typography.body,
    color: tokens.colors.onSurface,
    fontWeight: '600',
  },
  callInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.xs,
  },
  callType: {
    ...tokens.typography.caption,
    color: tokens.colors.onSurface60,
  },
  missedCallType: {
    color: tokens.colors.error,
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
    padding: 6,
    borderRadius: tokens.radius.m,
  },
  avatarContainer: {
    position: 'relative',
    transform: [{ scale: 1.15 }],
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
    marginLeft: 72, // Align with text content
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
});
