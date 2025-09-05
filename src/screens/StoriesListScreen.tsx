import React, { useState, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  ScrollView,
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
import { StoriesStackParamList } from '../navigation/types';
import { DynamicHeader, Avatar, MaterialIcon } from '../components';

type StoriesListNavigationProp = StackNavigationProp<StoriesStackParamList, 'StoriesList'>;

interface StoryItem {
  id: string;
  userName: string;
  userAvatar: string;
  timestamp: Date;
  isViewed: boolean;
}

export const StoriesListScreen: React.FC = () => {
  const navigation = useNavigation<StoriesListNavigationProp>();
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
  
  const [stories, setStories] = useState<StoryItem[]>([
    {
      id: '1',
      userName: 'Emma Wilson',
      userAvatar: 'https://i.pravatar.cc/150?img=1',
      timestamp: new Date(Date.now() - 7200000), // 2 hours ago
      isViewed: false,
    },
    {
      id: '2',
      userName: 'Alex Chen',
      userAvatar: 'https://i.pravatar.cc/150?img=2',
      timestamp: new Date(Date.now() - 3600000), // 1 hour ago
      isViewed: true,
    },
    {
      id: '3',
      userName: 'Sarah Johnson',
      userAvatar: 'https://i.pravatar.cc/150?img=3',
      timestamp: new Date(Date.now() - 10800000), // 3 hours ago
      isViewed: false,
    },
    {
      id: '4',
      userName: 'Mike Davis',
      userAvatar: 'https://i.pravatar.cc/150?img=4',
      timestamp: new Date(Date.now() - 14400000), // 4 hours ago
      isViewed: true,
    },
    {
      id: '5',
      userName: 'Lisa Brown',
      userAvatar: 'https://i.pravatar.cc/150?img=5',
      timestamp: new Date(Date.now() - 18000000), // 5 hours ago
      isViewed: false,
    },
    {
      id: '6',
      userName: 'David Wilson',
      userAvatar: 'https://i.pravatar.cc/150?img=6',
      timestamp: new Date(Date.now() - 21600000), // 6 hours ago
      isViewed: true,
    },
    {
      id: '7',
      userName: 'Anna Taylor',
      userAvatar: 'https://i.pravatar.cc/150?img=7',
      timestamp: new Date(Date.now() - 28800000), // 8 hours ago
      isViewed: false,
    },
    {
      id: '8',
      userName: 'James Miller',
      userAvatar: 'https://i.pravatar.cc/150?img=8',
      timestamp: new Date(Date.now() - 86400000), // 1 day ago
      isViewed: true,
    },
    {
      id: '9',
      userName: 'Sophie Garcia',
      userAvatar: 'https://i.pravatar.cc/150?img=9',
      timestamp: new Date(Date.now() - 32400000), // 9 hours ago
      isViewed: false,
    },
    {
      id: '10',
      userName: 'Ryan Thompson',
      userAvatar: 'https://i.pravatar.cc/150?img=10',
      timestamp: new Date(Date.now() - 36000000), // 10 hours ago
      isViewed: true,
    },
    {
      id: '11',
      userName: 'Maya Singh',
      userAvatar: 'https://i.pravatar.cc/150?img=11',
      timestamp: new Date(Date.now() - 43200000), // 12 hours ago
      isViewed: false,
    },
    {
      id: '12',
      userName: 'Carlos Rodriguez',
      userAvatar: 'https://i.pravatar.cc/150?img=12',
      timestamp: new Date(Date.now() - 50400000), // 14 hours ago
      isViewed: true,
    },
    {
      id: '13',
      userName: 'Elena Petrov',
      userAvatar: 'https://i.pravatar.cc/150?img=13',
      timestamp: new Date(Date.now() - 57600000), // 16 hours ago
      isViewed: false,
    },
    {
      id: '14',
      userName: 'Kevin O\'Brien',
      userAvatar: 'https://i.pravatar.cc/150?img=14',
      timestamp: new Date(Date.now() - 64800000), // 18 hours ago
      isViewed: true,
    },
    {
      id: '15',
      userName: 'Priya Sharma',
      userAvatar: 'https://i.pravatar.cc/150?img=15',
      timestamp: new Date(Date.now() - 72000000), // 20 hours ago
      isViewed: false,
    },
  ]);

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return `${diffInMinutes} m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} d ago`;
    }
  };

  const handleStoryPress = (story: StoryItem) => {
    // Mark story as viewed
    setStories(prev => 
      prev.map(s => 
        s.id === story.id ? { ...s, isViewed: true } : s
      )
    );
    
    navigation.navigate('StoryViewer', { storyId: story.id });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleAddStory = () => {
    // Navigate to camera or story creation
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // TODO: Implement story creation
  };

  const MyStoryButton = () => (
    <TouchableOpacity style={styles.myStoryButton} onPress={handleAddStory}>
      <MotiView
        from={{ scale: 1 }}
        animate={{ scale: 1 }}
        style={styles.myStoryContainer}
      >
        <View style={styles.dashedBorder}>
          <MaterialIcon name="add" size={32} color={tokens.colors.primary} />
        </View>
        <Text style={styles.myStoryText}>My Story</Text>
      </MotiView>
    </TouchableOpacity>
  );

  const StoryAvatar = ({ story }: { story: StoryItem }) => (
    <View style={styles.avatarContainer}>
      <View style={[
        styles.avatarBorder,
        {
          borderColor: story.isViewed ? 'rgba(156, 163, 175, 0.6)' : '#3B82F6',
          borderWidth: 2,
        }
      ]}>
        <View style={{ transform: [{ scale: 1.15 }] }}>
          <Avatar
            source={story.userAvatar}
            name={story.userName}
            size={56}
          />
        </View>
      </View>
    </View>
  );

  const renderStoryItem = ({ item, index }: { item: StoryItem; index: number }) => (
    <>
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 300 }}
      >
        <TouchableOpacity 
          style={styles.storyRow}
          onPress={() => handleStoryPress(item)}
          activeOpacity={0.7}
        >
          <StoryAvatar story={item} />
          
          <View style={styles.storyInfo}>
            <Text style={styles.userName} numberOfLines={1}>
              {item.userName}
            </Text>
            <Text style={styles.timestamp}>
              {formatTimeAgo(item.timestamp)}
            </Text>
          </View>
        </TouchableOpacity>
      </MotiView>
      {index < stories.length - 1 && <View style={styles.listSeparator} />}
    </>
  );

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
            uri: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxwYXR0ZXJuIGlkPSJzdG9yaWVzIiB4PSIwIiB5PSIwIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPgogICAgICA8cGF0aCBkPSJNMjAgNUwxOCAyMEwyMiAyMFoiIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNCIvPgogICAgPC9wYXR0ZXJuPgogIDwvZGVmcz4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI3N0b3JpZXMpIi8+Cjwvc3ZnPgo='
          }}
          style={styles.backgroundImage}
          resizeMode="repeat"
        />
      </Animated.View>

      {/* Header */}
      <DynamicHeader 
        title="Stories"
        scrollY={scrollOffset}
        showBackButton={false}
      />
      
      <Animated.ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* Large Title */}
        <View style={styles.largeTitleContainer}>
          <MotiView
            animate={{
              opacity: Math.max(0, Math.min(1, (60 - scrollOffset) / 20)),
              translateY: Math.min(20, scrollOffset / 3),
            }}
            transition={{ type: 'timing', duration: 200 }}
          >
            <Text style={styles.largeTitle}>Stories</Text>
          </MotiView>
        </View>

        {/* My Story Section */}
        <View style={styles.myStorySection}>
          <MyStoryButton />
        </View>
        
        {/* Stories List */}
        <View style={styles.storiesSection}>
          <FlatList
            data={stories}
            renderItem={renderStoryItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.bg,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 100, // Space for header
    paddingBottom: 100, // Space for bottom
  },
  largeTitleContainer: {
    paddingHorizontal: tokens.spacing.s,
    paddingTop: tokens.spacing.m,
    paddingBottom: tokens.spacing.s,
  },
  largeTitle: {
    ...tokens.typography.h1,
    color: tokens.colors.onSurface,
    fontSize: 12,
    fontWeight: '400',
    letterSpacing: -0.5,
  },
  myStorySection: {
    paddingHorizontal: tokens.spacing.m,
    paddingVertical: tokens.spacing.l,
  },
  myStoryButton: {
    alignItems: 'center',
  },
  myStoryContainer: {
    alignItems: 'center',
    gap: tokens.spacing.s,
  },
  dashedBorder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: tokens.colors.primary,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: tokens.colors.surface1,
  },
  myStoryText: {
    ...tokens.typography.caption,
    color: tokens.colors.onSurface,
    fontWeight: '600',
  },
  storiesSection: {
    paddingHorizontal: tokens.spacing.m,
    paddingBottom: tokens.spacing.xl,
  },
  storyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: tokens.spacing.s,
    paddingHorizontal: tokens.spacing.s,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: tokens.spacing.m,
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyInfo: {
    flex: 1,
    gap: tokens.spacing.xs,
  },
  userName: {
    ...tokens.typography.body,
    color: tokens.colors.onSurface,
    fontWeight: '600',
  },
  timestamp: {
    ...tokens.typography.caption,
    color: tokens.colors.onSurface60,
  },
  avatarBorder: {
    borderRadius: 30,
    padding: 2,
    backgroundColor: 'transparent',
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
