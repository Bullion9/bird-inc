import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput, FlatList, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as Haptics from 'expo-haptics';

import { tokens } from '../theme/tokens';
import { SettingsStackParamList } from '../navigation/types';
import { DynamicHeader, MaterialIcon } from '../components';

type StickerMarketNavigationProp = StackNavigationProp<SettingsStackParamList, 'StickerMarket'>;

interface StickerPack {
  id: string;
  name: string;
  author: string;
  price: number;
  preview: string[];
  isOwned: boolean;
  downloads: number;
  rating: number;
  category: string;
}

const { width } = Dimensions.get('window');

export const StickerMarketScreen: React.FC = () => {
  const navigation = useNavigation<StickerMarketNavigationProp>();
  const [scrollOffset, setScrollOffset] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const categories = ['All', 'Cute', 'Funny', 'Anime', 'Memes', 'Animals', 'Food'];
  
  const stickerPacks: StickerPack[] = [
    {
      id: '1',
      name: 'Cute Cats',
      author: 'StickerStudio',
      price: 0,
      preview: ['🐱', '😺', '😸', '😹'],
      isOwned: true,
      downloads: 45231,
      rating: 4.8,
      category: 'Cute',
    },
    {
      id: '2',
      name: 'Funny Dogs',
      author: 'PetPacks',
      price: 1.99,
      preview: ['🐶', '🐕', '🦮', '🐕‍🦺'],
      isOwned: false,
      downloads: 32156,
      rating: 4.6,
      category: 'Funny',
    },
    {
      id: '3',
      name: 'Food Lovers',
      author: 'FoodieArt',
      price: 2.99,
      preview: ['🍕', '🍔', '🍟', '🌮'],
      isOwned: false,
      downloads: 28974,
      rating: 4.7,
      category: 'Food',
    },
    {
      id: '4',
      name: 'Anime Emotions',
      author: 'AnimeWorld',
      price: 3.99,
      preview: ['😊', '😭', '😤', '🥺'],
      isOwned: true,
      downloads: 67543,
      rating: 4.9,
      category: 'Anime',
    },
  ];

  const filteredPacks = stickerPacks.filter(pack => {
    const matchesSearch = pack.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pack.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || pack.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const downloadPack = (packId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    console.log('Download pack:', packId);
  };

  const previewPack = (packId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    console.log('Preview pack:', packId);
  };

  const renderStickerPack = ({ item }: { item: StickerPack }) => (
    <TouchableOpacity 
      style={styles.stickerPackCard}
      onPress={() => previewPack(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.packPreview}>
        <View style={styles.previewGrid}>
          {item.preview.map((emoji, index) => (
            <Text key={index} style={styles.previewEmoji}>{emoji}</Text>
          ))}
        </View>
      </View>
      
      <View style={styles.packInfo}>
        <Text style={styles.packName}>{item.name}</Text>
        <Text style={styles.packAuthor}>by {item.author}</Text>
        
        <View style={styles.packStats}>
          <View style={styles.statItem}>
            <MaterialIcon name="star" size={14} color="#FFD700" />
            <Text style={styles.statText}>{item.rating}</Text>
          </View>
          <View style={styles.statItem}>
            <MaterialIcon name="download" size={14} color={tokens.colors.onSurface60} />
            <Text style={styles.statText}>{item.downloads.toLocaleString()}</Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={[
            styles.downloadButton,
            item.isOwned && styles.ownedButton
          ]}
          onPress={() => downloadPack(item.id)}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.downloadButtonText,
            item.isOwned && styles.ownedButtonText
          ]}>
            {item.isOwned ? 'Owned' : item.price === 0 ? 'Free' : `$${item.price}`}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <DynamicHeader 
        title="Sticker Market"
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
        scrollY={scrollOffset}
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        onScroll={(event) => {
          setScrollOffset(event.nativeEvent.contentOffset.y);
        }}
        scrollEventThrottle={16}
      >
        {/* Search Bar */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <MaterialIcon name="search" size={20} color="rgba(142, 142, 147, 1)" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search sticker packs"
              placeholderTextColor="rgba(142, 142, 147, 1)"
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
              clearButtonMode="while-editing"
            />
          </View>
        </View>

        {/* Categories */}
        <View style={styles.categoriesSection}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryChip,
                  selectedCategory === category && styles.selectedCategoryChip
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedCategory(category);
                }}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.categoryChipText,
                  selectedCategory === category && styles.selectedCategoryChipText
                ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* My Stickers */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.sectionHeader}
            onPress={() => console.log('View my stickers')}
            activeOpacity={0.7}
          >
            <Text style={styles.sectionTitle}>My Stickers</Text>
            <MaterialIcon 
              name="chevron_right" 
              size={20} 
              color={tokens.colors.onSurface60} 
            />
          </TouchableOpacity>
          <View style={styles.cardGroup}>
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => console.log('Manage stickers')}
              activeOpacity={0.7}
            >
              <View style={styles.settingItemLeft}>
                <View style={styles.iconContainer}>
                  <MaterialIcon name="emoticon-happy" size={20} color="#FFFFFF" />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Manage My Stickers</Text>
                  <Text style={styles.settingSubtitle}>4 packs owned</Text>
                </View>
              </View>
              <MaterialIcon 
                name="chevron_right" 
                size={20} 
                color={tokens.colors.onSurface60} 
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Sticker Packs Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Browse Sticker Packs</Text>
          <FlatList
            data={filteredPacks}
            renderItem={renderStickerPack}
            numColumns={2}
            scrollEnabled={false}
            columnWrapperStyle={styles.packRow}
            contentContainerStyle={styles.packsGrid}
          />
        </View>

        {/* Create Stickers */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Create & Share</Text>
          <View style={styles.cardGroup}>
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => console.log('Create stickers')}
              activeOpacity={0.7}
            >
              <View style={styles.settingItemLeft}>
                <View style={styles.iconContainer}>
                  <MaterialIcon name="brush" size={20} color="#FFFFFF" />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Create Sticker Pack</Text>
                  <Text style={styles.settingSubtitle}>Make your own stickers</Text>
                </View>
              </View>
              <MaterialIcon 
                name="chevron_right" 
                size={20} 
                color={tokens.colors.onSurface60} 
              />
            </TouchableOpacity>
            
            <View style={styles.separator} />
            
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => console.log('Submit pack')}
              activeOpacity={0.7}
            >
              <View style={styles.settingItemLeft}>
                <View style={styles.iconContainer}>
                  <MaterialIcon name="upload" size={20} color="#FFFFFF" />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Submit to Market</Text>
                  <Text style={styles.settingSubtitle}>Share with the community</Text>
                </View>
              </View>
              <MaterialIcon 
                name="chevron_right" 
                size={20} 
                color={tokens.colors.onSurface60} 
              />
            </TouchableOpacity>
          </View>
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: tokens.spacing.m,
    paddingTop: 100,
    paddingBottom: tokens.spacing.xl,
  },
  searchSection: {
    marginHorizontal: tokens.spacing.xs,
    marginBottom: tokens.spacing.m,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(118, 118, 128, 0.12)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 7,
    minHeight: 32,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 6,
    fontFamily: 'System',
    paddingVertical: 0,
  },
  categoriesSection: {
    marginBottom: tokens.spacing.l,
  },
  categoriesContainer: {
    paddingHorizontal: tokens.spacing.m,
    gap: tokens.spacing.s,
  },
  categoryChip: {
    paddingHorizontal: tokens.spacing.m,
    paddingVertical: tokens.spacing.s,
    borderRadius: 20,
    backgroundColor: tokens.colors.surface2,
    marginRight: tokens.spacing.s,
  },
  selectedCategoryChip: {
    backgroundColor: tokens.colors.primary,
  },
  categoryChipText: {
    ...tokens.typography.caption,
    color: tokens.colors.onSurface60,
    fontWeight: '500',
    fontSize: 12,
  },
  selectedCategoryChipText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  section: {
    marginBottom: tokens.spacing.l,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: tokens.spacing.m,
    marginLeft: tokens.spacing.xs,
  },
  sectionTitle: {
    ...tokens.typography.caption,
    color: tokens.colors.onSurface60,
    textTransform: 'uppercase',
    fontWeight: '600',
    fontSize: 12,
    marginBottom: tokens.spacing.m,
    marginLeft: tokens.spacing.xs,
  },
  cardGroup: {
    backgroundColor: tokens.colors.cardBackground,
    borderRadius: tokens.radius.m,
    marginHorizontal: tokens.spacing.xs,
    overflow: 'hidden',
    ...tokens.elevation.small,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: tokens.spacing.m,
    paddingHorizontal: tokens.spacing.m,
    minHeight: 56,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: tokens.spacing.m,
  },
  iconContainer: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: tokens.colors.primary,
  },
  settingTextContainer: {
    flex: 1,
    gap: tokens.spacing.xs / 2,
  },
  settingTitle: {
    ...tokens.typography.body,
    color: tokens.colors.onSurface,
    fontWeight: '500',
  },
  settingSubtitle: {
    ...tokens.typography.caption,
    color: tokens.colors.onSurface60,
    fontSize: 12,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: tokens.colors.surface3,
    marginLeft: 52,
  },
  packsGrid: {
    marginHorizontal: tokens.spacing.xs,
  },
  packRow: {
    justifyContent: 'space-between',
    marginBottom: tokens.spacing.m,
  },
  stickerPackCard: {
    width: (width - 48) / 2,
    backgroundColor: tokens.colors.cardBackground,
    borderRadius: tokens.radius.m,
    padding: tokens.spacing.m,
    ...tokens.elevation.small,
  },
  packPreview: {
    height: 80,
    backgroundColor: tokens.colors.surface2,
    borderRadius: tokens.radius.s,
    marginBottom: tokens.spacing.s,
    padding: tokens.spacing.s,
  },
  previewGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  previewEmoji: {
    fontSize: 20,
  },
  packInfo: {
    gap: tokens.spacing.xs,
  },
  packName: {
    ...tokens.typography.body,
    color: tokens.colors.onSurface,
    fontWeight: '600',
    fontSize: 14,
  },
  packAuthor: {
    ...tokens.typography.caption,
    color: tokens.colors.onSurface60,
    fontSize: 11,
  },
  packStats: {
    flexDirection: 'row',
    gap: tokens.spacing.s,
    marginVertical: tokens.spacing.xs,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  statText: {
    ...tokens.typography.caption,
    color: tokens.colors.onSurface60,
    fontSize: 10,
  },
  downloadButton: {
    backgroundColor: tokens.colors.primary,
    paddingVertical: tokens.spacing.xs,
    paddingHorizontal: tokens.spacing.s,
    borderRadius: tokens.radius.s,
    alignItems: 'center',
    marginTop: tokens.spacing.xs,
  },
  ownedButton: {
    backgroundColor: tokens.colors.surface2,
  },
  downloadButtonText: {
    ...tokens.typography.caption,
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 12,
  },
  ownedButtonText: {
    color: tokens.colors.onSurface60,
  },
});
