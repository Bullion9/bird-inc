import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  Dimensions,
  TouchableOpacity,
  StatusBar,
  Image
} from 'react-native';
import { Text } from 'react-native-paper';
import { MotiView } from 'moti';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { tokens } from '../theme/tokens';
import { StoriesStackParamList } from '../navigation/types';
import { Avatar, MaterialIcon } from '../components';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

type StoryViewerNavigationProp = StackNavigationProp<StoriesStackParamList, 'StoryViewer'>;
type StoryViewerRouteProp = RouteProp<StoriesStackParamList, 'StoryViewer'>;

interface Story {
  id: string;
  userName: string;
  userAvatar: string;
  content: string;
  timestamp: Date;
}

export const StoryViewerScreen: React.FC = () => {
  const navigation = useNavigation<StoryViewerNavigationProp>();
  const route = useRoute<StoryViewerRouteProp>();
  const { storyId } = route.params;
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const progressRef = useRef<NodeJS.Timeout | null>(null);
  
  // Demo stories data
  const stories: Story[] = [
    {
      id: '1',
      userName: 'Emma Wilson',
      userAvatar: 'https://i.pravatar.cc/150?img=1',
      content: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=800&fit=crop',
      timestamp: new Date(Date.now() - 7200000),
    },
    {
      id: '2',
      userName: 'Alex Chen',
      userAvatar: 'https://i.pravatar.cc/150?img=2',
      content: 'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=400&h=800&fit=crop',
      timestamp: new Date(Date.now() - 3600000),
    },
    {
      id: '3',
      userName: 'Sarah Johnson',
      userAvatar: 'https://i.pravatar.cc/150?img=3',
      content: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=800&fit=crop',
      timestamp: new Date(Date.now() - 10800000),
    },
  ];

  const currentStory = stories[currentIndex];

  useEffect(() => {
    if (!isPaused) {
      startProgress();
    } else {
      stopProgress();
    }

    return () => stopProgress();
  }, [currentIndex, isPaused]);

  const startProgress = () => {
    setProgress(0);
    let progressValue = 0;
    
    progressRef.current = setInterval(() => {
      progressValue += 2; // 2% every 100ms = 5 seconds total
      setProgress(progressValue);
      
      if (progressValue >= 100) {
        nextStory();
      }
    }, 100);
  };

  const stopProgress = () => {
    if (progressRef.current) {
      clearInterval(progressRef.current);
    }
  };

  const nextStory = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setProgress(0);
    } else {
      handleClose();
    }
  };

  const prevStory = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setProgress(0);
    }
  };

  const handleClose = () => {
    stopProgress();
    navigation.goBack();
  };

  const handleTap = (x: number) => {
    const tapZone = screenWidth / 3;
    
    if (x < tapZone) {
      // Left tap - previous story
      prevStory();
    } else if (x > tapZone * 2) {
      // Right tap - next story
      nextStory();
    }
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleLongPress = () => {
    setIsPaused(!isPaused);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return `${Math.floor(diffInHours * 60)}m`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h`;
    } else {
      return `${Math.floor(diffInHours / 24)}d`;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      
      {/* Background Image */}
      <Image
        source={{ uri: currentStory.content }}
        style={styles.backgroundImage}
        resizeMode="cover"
      />
      
      {/* Overlay */}
      <View style={styles.overlay} />
      
      {/* Progress Bars */}
      <SafeAreaView edges={['top']} style={styles.progressContainer}>
        <View style={styles.progressBars}>
          {stories.map((_, index) => (
            <View key={index} style={styles.progressBarTrack}>
              <MotiView
                style={[
                  styles.progressBarFill,
                  {
                    width: index < currentIndex ? '100%' : 
                           index === currentIndex ? `${progress}%` : '0%'
                  }
                ]}
                animate={{
                  width: index < currentIndex ? '100%' : 
                         index === currentIndex ? `${progress}%` : '0%'
                }}
                transition={{ type: 'timing', duration: 100 }}
              />
            </View>
          ))}
        </View>
      </SafeAreaView>
      
      {/* Header */}
      <SafeAreaView edges={['top']} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.userInfo}>
            <Avatar
              source={currentStory.userAvatar}
              name={currentStory.userName}
              size={40}
            />
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{currentStory.userName}</Text>
              <Text style={styles.timestamp}>{formatTimeAgo(currentStory.timestamp)}</Text>
            </View>
          </View>
          
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <MaterialIcon name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
      
      {/* Tap Areas */}
      <View style={styles.tapAreas}>
        <TouchableOpacity
          style={styles.leftTapArea}
          onPress={() => handleTap(screenWidth * 0.2)}
          onLongPress={handleLongPress}
        />
        <TouchableOpacity
          style={styles.rightTapArea}
          onPress={() => handleTap(screenWidth * 0.8)}
          onLongPress={handleLongPress}
        />
      </View>
      
      {/* Pause Indicator */}
      {isPaused && (
        <MotiView
          from={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          style={styles.pauseIndicator}
        >
          <MaterialIcon name="pause" size={32} color="#FFFFFF" />
        </MotiView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  backgroundImage: {
    position: 'absolute',
    width: screenWidth,
    height: screenHeight,
  },
  overlay: {
    position: 'absolute',
    width: screenWidth,
    height: screenHeight,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  progressContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  progressBars: {
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: tokens.spacing.m,
    paddingTop: tokens.spacing.s,
  },
  progressBarTrack: {
    flex: 1,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 1,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing.m,
    paddingTop: tokens.spacing.l,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.s,
  },
  userDetails: {
    gap: 2,
  },
  userName: {
    ...tokens.typography.body,
    color: '#FFFFFF',
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  timestamp: {
    ...tokens.typography.caption,
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  closeButton: {
    padding: tokens.spacing.s,
    borderRadius: tokens.radius.m,
  },
  tapAreas: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
  },
  leftTapArea: {
    flex: 1,
  },
  rightTapArea: {
    flex: 2,
  },
  pauseIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -20 }, { translateY: -20 }],
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
