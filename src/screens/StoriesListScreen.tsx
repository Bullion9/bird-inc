import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  ScrollView
} from 'react-native';
import { Text } from 'react-native-paper';
import { MotiView } from 'moti';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as Haptics from 'expo-haptics';

import { tokens } from '../theme/tokens';
import { StoriesStackParamList } from '../navigation/types';
import { DynamicHeader, BirdCard, Avatar, MaterialIcon } from '../components';

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
      {!story.isViewed && <View style={styles.storyRing} />}
      <Avatar
        source={story.userAvatar}
        name={story.userName}
        size={56}
      />
    </View>
  );

  const renderStoryItem = ({ item }: { item: StoryItem }) => (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 300 }}
    >
      <BirdCard onPress={() => handleStoryPress(item)}>
        <View style={styles.storyRow}>
          <StoryAvatar story={item} />
          
          <View style={styles.storyInfo}>
            <Text style={styles.userName} numberOfLines={1}>
              {item.userName}
            </Text>
            <Text style={styles.timestamp}>
              {formatTimeAgo(item.timestamp)}
            </Text>
          </View>
        </View>
      </BirdCard>
    </MotiView>
  );

  return (
    <View style={styles.container}>
      <DynamicHeader 
        title="Stories"
        showBackButton={false}
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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
      </ScrollView>
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
  },
  avatarContainer: {
    position: 'relative',
    marginRight: tokens.spacing.m,
  },
  storyRing: {
    position: 'absolute',
    width: 64, // 56 + 4px border + 4px padding
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: tokens.colors.primary,
    top: -4,
    left: -4,
    zIndex: 1,
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
});
