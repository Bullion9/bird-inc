import React, { useState, useRef } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, FlatList, ImageBackground, Dimensions, Animated } from 'react-native';
import { Text, FAB, Searchbar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as Haptics from 'expo-haptics';

import { tokens } from '../theme/tokens';
import { ChatsStackParamList } from '../navigation/types';
import { DynamicHeader, MaterialIcon, Avatar } from '../components';

type GroupsNavigationProp = StackNavigationProp<ChatsStackParamList, 'Groups'>;

const { height: screenHeight } = Dimensions.get('window');

interface Group {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  lastMessage: string;
  lastMessageTime: string;
  avatar: string;
  isAdmin: boolean;
  unreadCount?: number;
}

const mockGroups: Group[] = [
  {
    id: '1',
    name: 'Family Group',
    description: 'Stay connected with family',
    memberCount: 8,
    lastMessage: 'Mom: Dinner at 7 PM tonight',
    lastMessageTime: '2:30 PM',
    avatar: 'https://picsum.photos/200/200?random=1',
    isAdmin: true,
    unreadCount: 3,
  },
  {
    id: '2',
    name: 'Work Team',
    description: 'Project discussions and updates',
    memberCount: 12,
    lastMessage: 'Sarah: Meeting moved to 3 PM',
    lastMessageTime: '1:45 PM',
    avatar: 'https://picsum.photos/200/200?random=2',
    isAdmin: false,
    unreadCount: 1,
  },
  {
    id: '3',
    name: 'College Friends',
    description: 'The gang from university',
    memberCount: 15,
    lastMessage: 'Mike: Anyone up for a reunion?',
    lastMessageTime: '11:20 AM',
    avatar: 'https://picsum.photos/200/200?random=3',
    isAdmin: false,
  },
  {
    id: '4',
    name: 'Fitness Buddies',
    description: 'Workout motivation and tips',
    memberCount: 6,
    lastMessage: 'Alex: Great workout today!',
    lastMessageTime: 'Yesterday',
    avatar: 'https://picsum.photos/200/200?random=4',
    isAdmin: true,
  },
  {
    id: '5',
    name: 'Book Club',
    description: 'Monthly book discussions',
    memberCount: 9,
    lastMessage: 'Emma: Next book suggestions?',
    lastMessageTime: 'Tuesday',
    avatar: 'https://picsum.photos/200/200?random=5',
    isAdmin: false,
    unreadCount: 2,
  },
];

export const GroupsScreen: React.FC = () => {
  const navigation = useNavigation<GroupsNavigationProp>();
  const [scrollOffset, setScrollOffset] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [groups, setGroups] = useState(mockGroups);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  const filterOptions = [
    { id: 'all', label: 'All Groups', icon: 'group' },
    { id: 'admin', label: 'Admin Groups', icon: 'admin_panel_settings' },
    { id: 'unread', label: 'Unread Messages', icon: 'mark_as_unread' },
    { id: 'recent', label: 'Recent Activity', icon: 'schedule' },
  ];

  const getFilteredGroups = () => {
    let filtered = groups;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(group =>
        group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply selected filter
    switch (selectedFilter) {
      case 'admin':
        filtered = filtered.filter(group => group.isAdmin);
        break;
      case 'unread':
        filtered = filtered.filter(group => group.unreadCount && group.unreadCount > 0);
        break;
      case 'recent':
        // Sort by recent activity (groups with messages today)
        filtered = filtered.filter(group => 
          group.lastMessageTime.includes('PM') || group.lastMessageTime.includes('AM')
        );
        break;
      default:
        // 'all' - no additional filtering
        break;
    }

    return filtered;
  };

  const filteredGroups = getFilteredGroups();

  const handleGroupPress = (group: Group) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('GroupDetails', { 
      groupId: group.id, 
      groupName: group.name 
    });
  };

  const handleCreateGroup = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('CreateGroup');
  };

  const renderGroupItem = ({ item }: { item: Group }) => (
    <TouchableOpacity
      style={styles.groupItem}
      onPress={() => handleGroupPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.groupItemContent}>
        <View style={styles.avatarContainer}>
          <Avatar
            size={56}
            source={item.avatar}
            name={item.name}
          />
          {item.unreadCount && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unreadCount}</Text>
            </View>
          )}
        </View>
        
        <View style={styles.groupInfo}>
          <View style={styles.groupHeader}>
            <Text style={styles.groupName} numberOfLines={1}>
              {item.name}
            </Text>
            <View style={styles.groupMeta}>
              {item.isAdmin && (
                <View style={styles.adminBadge}>
                  <MaterialIcon name="star" size={12} color={tokens.colors.secondary} />
                </View>
              )}
              <Text style={styles.memberCount}>
                {item.memberCount} members
              </Text>
            </View>
          </View>
          
          <Text style={styles.groupDescription} numberOfLines={1}>
            {item.description}
          </Text>
          
          <View style={styles.lastMessageContainer}>
            <Text style={styles.lastMessage} numberOfLines={1}>
              {item.lastMessage}
            </Text>
            <Text style={styles.lastMessageTime}>
              {item.lastMessageTime}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
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
        <View style={styles.backgroundImage}>
          {/* Create a subtle pattern with dots */}
          {Array.from({ length: 20 }).map((_, row) =>
            Array.from({ length: 10 }).map((_, col) => (
              <View
                key={`${row}-${col}`}
                style={[
                  styles.backgroundDot,
                  {
                    top: row * 60 + (col % 2) * 30,
                    left: col * 40,
                  },
                ]}
              />
            ))
          )}
        </View>
      </Animated.View>

      <DynamicHeader 
        title="Groups"
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
        scrollY={scrollOffset}
        rightIcons={[
          {
            icon: 'filter_list',
            onPress: () => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowFilters(!showFilters);
            },
          },
          {
            icon: 'search',
            onPress: () => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              // Could focus search or toggle search bar
            },
          },
        ]}
      />
      
      <View style={styles.content}>
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Search groups..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchbar}
            inputStyle={styles.searchInput}
            iconColor={tokens.colors.onSurface60}
            placeholderTextColor={tokens.colors.onSurface60}
          />
        </View>

        {/* Filter Options */}
        {showFilters && (
          <View style={styles.filterContainer}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterScrollContent}
            >
              {filterOptions.map((filter) => (
                <TouchableOpacity
                  key={filter.id}
                  style={[
                    styles.filterChip,
                    selectedFilter === filter.id && styles.filterChipSelected
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedFilter(filter.id);
                  }}
                >
                  <MaterialIcon 
                    name={filter.icon} 
                    size={16} 
                    color={selectedFilter === filter.id ? tokens.colors.onSurface : tokens.colors.onSurface60} 
                  />
                  <Text style={[
                    styles.filterChipText,
                    selectedFilter === filter.id && styles.filterChipTextSelected
                  ]}>
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Results Count */}
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsText}>
            {filteredGroups.length} {filteredGroups.length === 1 ? 'group' : 'groups'}
            {selectedFilter !== 'all' && (
              <Text style={styles.resultsFilter}>
                {' '}• {filterOptions.find(f => f.id === selectedFilter)?.label}
              </Text>
            )}
          </Text>
        </View>

        <Animated.FlatList
          data={filteredGroups}
          renderItem={renderGroupItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { 
              useNativeDriver: false,
              listener: (event: any) => {
                setScrollOffset(event.nativeEvent.contentOffset.y);
              }
            }
          )}
          scrollEventThrottle={16}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <MaterialIcon name="group" size={64} color={tokens.colors.onSurface38} />
              <Text style={styles.emptyTitle}>No groups found</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery 
                  ? 'Try adjusting your search terms'
                  : 'Create your first group to get started'
                }
              </Text>
            </View>
          )}
        />
      </View>

      <FAB
        icon="add"
        style={styles.fab}
        onPress={handleCreateGroup}
        color={tokens.colors.onSurface}
        customSize={56}
      />
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
    height: screenHeight * 1.3, // Extra height for parallax
    zIndex: 0,
  },
  backgroundImage: {
    flex: 1,
    backgroundColor: `${tokens.colors.primary}08`, // Very subtle iOS blue tint
  },
  backgroundPattern: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  backgroundDot: {
    position: 'absolute',
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  content: {
    flex: 1,
    paddingTop: 135, // Space for header
  },
  searchContainer: {
    paddingHorizontal: tokens.spacing.m,
    paddingBottom: tokens.spacing.m,
  },
  searchbar: {
    backgroundColor: tokens.colors.surface1,
    borderRadius: tokens.radius.m,
    elevation: 0,
  },
  searchInput: {
    color: tokens.colors.onSurface,
    fontSize: 12,
  },
  listContent: {
    paddingBottom: 80, // Space for FAB
  },
  groupItem: {
    backgroundColor: tokens.colors.surface1,
    marginHorizontal: tokens.spacing.m,
    marginBottom: tokens.spacing.s,
    borderRadius: tokens.radius.m,
    overflow: 'hidden',
  },
  groupItemContent: {
    flexDirection: 'row',
    padding: tokens.spacing.m,
    alignItems: 'flex-start',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: tokens.spacing.m,
  },
  unreadBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: tokens.colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: tokens.colors.surface1,
  },
  unreadText: {
    color: tokens.colors.onSurface,
    fontSize: 12,
    fontWeight: '600',
  },
  groupInfo: {
    flex: 1,
    gap: tokens.spacing.xs,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  groupName: {
    ...tokens.typography.body,
    color: tokens.colors.onSurface,
    fontWeight: '600',
    flex: 1,
    marginRight: tokens.spacing.s,
  },
  groupMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.xs,
  },
  adminBadge: {
    padding: 2,
  },
  memberCount: {
    ...tokens.typography.caption,
    color: tokens.colors.onSurface60,
    fontSize: 12,
  },
  groupDescription: {
    ...tokens.typography.caption,
    color: tokens.colors.onSurface60,
    fontSize: 12,
  },
  lastMessageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: tokens.spacing.xs / 2,
  },
  lastMessage: {
    ...tokens.typography.caption,
    color: tokens.colors.onSurface,
    fontSize: 12,
    flex: 1,
    marginRight: tokens.spacing.s,
  },
  lastMessageTime: {
    ...tokens.typography.caption,
    color: tokens.colors.onSurface60,
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: tokens.spacing.xl,
    paddingTop: 100,
  },
  emptyTitle: {
    ...tokens.typography.h2,
    color: tokens.colors.onSurface,
    marginTop: tokens.spacing.m,
    marginBottom: tokens.spacing.s,
  },
  emptySubtitle: {
    ...tokens.typography.body,
    color: tokens.colors.onSurface60,
    textAlign: 'center',
    lineHeight: 20,
  },
  fab: {
    position: 'absolute',
    bottom: tokens.spacing.l,
    right: tokens.spacing.m,
    backgroundColor: tokens.colors.primary,
    borderRadius: 28,
  },
  filterContainer: {
    paddingHorizontal: tokens.spacing.m,
    paddingBottom: tokens.spacing.s,
  },
  filterScrollContent: {
    paddingRight: tokens.spacing.m,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing.m,
    paddingVertical: tokens.spacing.s,
    marginRight: tokens.spacing.s,
    borderRadius: tokens.radius.l,
    backgroundColor: tokens.colors.surface1,
    borderWidth: 1,
    borderColor: tokens.colors.surface2,
  },
  filterChipSelected: {
    backgroundColor: tokens.colors.primary,
    borderColor: tokens.colors.primary,
  },
  filterChipText: {
    ...tokens.typography.caption,
    color: tokens.colors.onSurface60,
    marginLeft: tokens.spacing.xs,
    fontSize: 12,
  },
  filterChipTextSelected: {
    color: tokens.colors.onSurface,
    fontWeight: '600',
  },
  resultsContainer: {
    paddingHorizontal: tokens.spacing.m,
    paddingBottom: tokens.spacing.s,
  },
  resultsText: {
    ...tokens.typography.caption,
    color: tokens.colors.onSurface60,
    fontSize: 12,
  },
  resultsFilter: {
    color: tokens.colors.primary,
  },
});
