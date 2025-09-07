import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Text } from 'react-native-paper';
import { MotiView } from 'moti';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as Haptics from 'expo-haptics';

import { tokens } from '../theme/tokens';
import { CallsStackParamList } from '../navigation/types';
import { DynamicHeader, Avatar, MaterialIcon } from '../components';

type FavoriteContactsNavigationProp = StackNavigationProp<CallsStackParamList, 'FavoriteContacts'>;

interface FavoriteContact {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
  dateAdded: Date;
}

export const FavoriteContactsScreen: React.FC = () => {
  const navigation = useNavigation<FavoriteContactsNavigationProp>();
  const [scrollOffset, setScrollOffset] = useState(0);

  // Mock favorite contacts data
  const [favoriteContacts] = useState<FavoriteContact[]>([
    {
      id: '1',
      name: 'Emma Wilson',
      phone: '+1 (555) 123-4567',
      avatar: 'https://i.pravatar.cc/150?img=1',
      dateAdded: new Date('2024-01-15'),
    },
    {
      id: '2',
      name: 'Alex Chen',
      phone: '+1 (555) 234-5678',
      avatar: 'https://i.pravatar.cc/150?img=2',
      dateAdded: new Date('2024-02-10'),
    },
    {
      id: '3',
      name: 'Sarah Johnson',
      phone: '+1 (555) 345-6789',
      avatar: 'https://i.pravatar.cc/150?img=3',
      dateAdded: new Date('2024-03-05'),
    },
    {
      id: '4',
      name: 'Mike Davis',
      phone: '+1 (555) 456-7890',
      avatar: 'https://i.pravatar.cc/150?img=4',
      dateAdded: new Date('2024-03-20'),
    },
    {
      id: '5',
      name: 'Lisa Brown',
      phone: '+1 (555) 567-8901',
      avatar: 'https://i.pravatar.cc/150?img=5',
      dateAdded: new Date('2024-04-01'),
    },
  ]);

  const handleCall = (contact: FavoriteContact) => {
    // Navigate to call screen or initiate call
    Alert.alert('Call', `Calling ${contact.name}`);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleVideoCall = (contact: FavoriteContact) => {
    // Navigate to video call screen
    Alert.alert('Video Call', `Video calling ${contact.name}`);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleContactDetails = (contact: FavoriteContact) => {
    navigation.navigate('ContactDetails', {
      contactId: contact.id,
      contactName: contact.name,
      contactAvatar: contact.avatar,
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleRemoveFavorite = (contact: FavoriteContact) => {
    Alert.alert(
      'Remove from Favorites',
      `Remove ${contact.name} from your favorites?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Removed', `${contact.name} removed from favorites`);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          }
        },
      ]
    );
  };

  const renderFavoriteContact = ({ item, index }: { item: FavoriteContact; index: number }) => (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 300, delay: index * 50 }}
    >
      <TouchableOpacity
        style={styles.contactRow}
        onPress={() => handleContactDetails(item)}
        onLongPress={() => handleRemoveFavorite(item)}
        activeOpacity={0.7}
      >
        <View style={styles.leftSection}>
          <Avatar
            source={item.avatar}
            name={item.name}
            size={56}
          />
        </View>
        
        <View style={styles.middleSection}>
          <Text style={styles.contactName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.phoneNumber} numberOfLines={1}>
            {item.phone}
          </Text>
        </View>
        
        <View style={styles.rightSection}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: 'rgba(52, 199, 89, 0.15)' }]}
            onPress={() => handleCall(item)}
          >
            <MaterialIcon name="phone" size={20} color="#34C759" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: 'rgba(0, 122, 255, 0.15)' }]}
            onPress={() => handleVideoCall(item)}
          >
            <MaterialIcon name="videocam" size={20} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
      {index < favoriteContacts.length - 1 && <View style={styles.separator} />}
    </MotiView>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <DynamicHeader
        title="Favorites"
        scrollY={scrollOffset}
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
        titleSize={18}
        rightIcons={[
          {
            icon: 'person_add',
            onPress: () => {
              Alert.alert('Add Favorite', 'Select a contact to add to favorites');
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
          }
        ]}
      />

      <View style={styles.content}>
        {favoriteContacts.length > 0 ? (
          <>
            {/* Favorites Count */}
            <View style={styles.headerInfo}>
              <Text style={styles.countText}>
                {favoriteContacts.length} favorite{favoriteContacts.length !== 1 ? 's' : ''}
              </Text>
            </View>

            {/* Favorites List */}
            <FlatList
              data={favoriteContacts}
              renderItem={renderFavoriteContact}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              onScroll={(event) => setScrollOffset(event.nativeEvent.contentOffset.y)}
              scrollEventThrottle={16}
            />
          </>
        ) : (
          /* Empty State */
          <View style={styles.emptyState}>
            <MotiView
              from={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', damping: 15, stiffness: 150 }}
            >
              <MaterialIcon
                name="favorite"
                size={64}
                color={tokens.colors.onSurface38}
              />
              <Text style={styles.emptyTitle}>No Favorites Yet</Text>
              <Text style={styles.emptySubtitle}>
                Add your most important contacts to favorites for quick access
              </Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => {
                  Alert.alert('Add Favorite', 'Select a contact to add to favorites');
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                <MaterialIcon name="person_add" size={20} color="#FFFFFF" />
                <Text style={styles.addButtonText}>Add Favorite</Text>
              </TouchableOpacity>
            </MotiView>
          </View>
        )}
      </View>
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
    paddingTop: 100, // Space for header
  },
  headerInfo: {
    paddingHorizontal: tokens.spacing.m,
    paddingVertical: tokens.spacing.s,
  },
  countText: {
    ...tokens.typography.caption,
    color: tokens.colors.onSurface60,
    textAlign: 'center',
  },
  listContent: {
    paddingHorizontal: tokens.spacing.m,
    paddingBottom: tokens.spacing.xl,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: tokens.spacing.m,
  },
  leftSection: {
    marginRight: tokens.spacing.m,
  },
  middleSection: {
    flex: 1,
    marginRight: tokens.spacing.m,
  },
  contactName: {
    ...tokens.typography.body,
    color: tokens.colors.onSurface,
    fontWeight: '600',
    marginBottom: 2,
  },
  phoneNumber: {
    ...tokens.typography.caption,
    color: tokens.colors.onSurface60,
  },
  rightSection: {
    flexDirection: 'row',
    gap: tokens.spacing.s,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginLeft: 68, // Align with text content
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing.xl,
  },
  emptyTitle: {
    ...tokens.typography.h2,
    color: tokens.colors.onSurface,
    marginTop: tokens.spacing.m,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...tokens.typography.body,
    color: tokens.colors.onSurface60,
    marginTop: tokens.spacing.s,
    textAlign: 'center',
    lineHeight: 20,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.primary,
    paddingHorizontal: tokens.spacing.m,
    paddingVertical: tokens.spacing.s,
    borderRadius: tokens.radius.m,
    marginTop: tokens.spacing.l,
    gap: tokens.spacing.s,
  },
  addButtonText: {
    ...tokens.typography.body,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
