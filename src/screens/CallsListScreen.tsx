import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  Animated
} from 'react-native';
import { Text } from 'react-native-paper';
import { MotiView } from 'moti';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as Haptics from 'expo-haptics';

import { tokens } from '../theme/tokens';
import { CallsStackParamList } from '../navigation/types';
import { DynamicHeader, BirdCard, Avatar, MaterialIcon } from '../components';

type CallsListNavigationProp = StackNavigationProp<CallsStackParamList, 'CallsList'>;

interface CallItem {
  id: string;
  name: string;
  avatar: string;
  type: 'outgoing' | 'incoming' | 'missed';
  timestamp: Date;
  duration?: string;
}

export const CallsListScreen: React.FC = () => {
  const navigation = useNavigation<CallsListNavigationProp>();
  
  const [calls, setCalls] = useState<CallItem[]>([
    {
      id: '1',
      name: 'Emma Wilson',
      avatar: 'https://i.pravatar.cc/150?img=1',
      type: 'outgoing',
      timestamp: new Date(Date.now() - 3600000), // 1 hour ago
      duration: '12:34',
    },
    {
      id: '2',
      name: 'Alex Chen',
      avatar: 'https://i.pravatar.cc/150?img=2',
      type: 'incoming',
      timestamp: new Date(Date.now() - 7200000), // 2 hours ago
      duration: '05:21',
    },
    {
      id: '3',
      name: 'Sarah Johnson',
      avatar: 'https://i.pravatar.cc/150?img=3',
      type: 'missed',
      timestamp: new Date(Date.now() - 10800000), // 3 hours ago
    },
    {
      id: '4',
      name: 'Mike Davis',
      avatar: 'https://i.pravatar.cc/150?img=4',
      type: 'outgoing',
      timestamp: new Date(Date.now() - 14400000), // 4 hours ago
      duration: '23:45',
    },
    {
      id: '5',
      name: 'Lisa Brown',
      avatar: 'https://i.pravatar.cc/150?img=5',
      type: 'incoming',
      timestamp: new Date(Date.now() - 86400000), // 1 day ago
      duration: '01:12',
    },
    {
      id: '6',
      name: 'David Wilson',
      avatar: 'https://i.pravatar.cc/150?img=6',
      type: 'missed',
      timestamp: new Date(Date.now() - 172800000), // 2 days ago
    },
    {
      id: '7',
      name: 'Anna Taylor',
      avatar: 'https://i.pravatar.cc/150?img=7',
      type: 'outgoing',
      timestamp: new Date(Date.now() - 259200000), // 3 days ago
      duration: '08:33',
    },
    {
      id: '8',
      name: 'James Miller',
      avatar: 'https://i.pravatar.cc/150?img=8',
      type: 'incoming',
      timestamp: new Date(Date.now() - 345600000), // 4 days ago
      duration: '15:07',
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
    navigation.navigate('CallScreen', { 
      contactName: call.name,
      contactAvatar: call.avatar,
      isIncoming: false,
      callId: call.id,
      isVideo: false
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleDelete = (callId: string) => {
    setCalls(prev => prev.filter(call => call.id !== callId));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  };

  const renderCallItem = ({ item }: { item: CallItem }) => {
    const icon = getCallIcon(item.type);
    
    return (
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 300 }}
      >
        <BirdCard
          onPress={() => handleCallPress(item)}
        >
          <View style={styles.callRow}>
            <View style={styles.leftSection}>
              <Avatar
                source={item.avatar}
                name={item.name}
                size={48}
              />
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
                  name="call" 
                  size={24} 
                  color={tokens.colors.success} 
                />
              </TouchableOpacity>
            </View>
          </View>
        </BirdCard>
      </MotiView>
    );
  };

  return (
    <View style={styles.container}>
      <DynamicHeader 
        title="Calls"
        showBackButton={false}
      />
      
      <FlatList
        data={calls}
        renderItem={renderCallItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.bg,
  },
  listContainer: {
    padding: tokens.spacing.m,
    paddingBottom: tokens.spacing.xl,
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
    padding: tokens.spacing.s,
    borderRadius: tokens.radius.m,
  },
});
