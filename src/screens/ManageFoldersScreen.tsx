import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as Haptics from 'expo-haptics';

import { tokens } from '../theme/tokens';
import { SettingsStackParamList } from '../navigation/types';
import { DynamicHeader, MaterialIcon } from '../components';

type ManageFoldersNavigationProp = StackNavigationProp<SettingsStackParamList, 'ManageFolders'>;

interface Folder {
  id: string;
  name: string;
  chatCount: number;
  color: string;
  isDefault: boolean;
}

export const ManageFoldersScreen: React.FC = () => {
  const navigation = useNavigation<ManageFoldersNavigationProp>();
  const [scrollOffset, setScrollOffset] = useState(0);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [folders, setFolders] = useState<Folder[]>([
    {
      id: '1',
      name: 'All Chats',
      chatCount: 24,
      color: tokens.colors.primary,
      isDefault: true,
    },
    {
      id: '2',
      name: 'Work',
      chatCount: 8,
      color: '#FF6B35',
      isDefault: false,
    },
    {
      id: '3',
      name: 'Family',
      chatCount: 5,
      color: '#34C759',
      isDefault: false,
    },
    {
      id: '4',
      name: 'Friends',
      chatCount: 11,
      color: '#AF52DE',
      isDefault: false,
    },
  ]);

  const createFolder = () => {
    if (!newFolderName.trim()) {
      Alert.alert('Error', 'Please enter a folder name');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    const newFolder: Folder = {
      id: Date.now().toString(),
      name: newFolderName.trim(),
      chatCount: 0,
      color: getRandomColor(),
      isDefault: false,
    };

    setFolders(prev => [...prev, newFolder]);
    setNewFolderName('');
    setShowCreateFolder(false);
  };

  const deleteFolder = (folderId: string) => {
    const folder = folders.find(f => f.id === folderId);
    if (!folder || folder.isDefault) return;

    Alert.alert(
      'Delete Folder',
      `Are you sure you want to delete "${folder.name}"? Chats in this folder will be moved to "All Chats".`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            setFolders(prev => prev.filter(f => f.id !== folderId));
          }
        }
      ]
    );
  };

  const editFolder = (folderId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    console.log('Edit folder:', folderId);
  };

  const getRandomColor = () => {
    const colors = ['#FF6B35', '#34C759', '#AF52DE', '#FF3B30', '#007AFF', '#FF9500'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  return (
    <View style={styles.container}>
      <DynamicHeader 
        title="Manage Folders"
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
        {/* Create Folder Section */}
        {showCreateFolder ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Create New Folder</Text>
            <View style={styles.cardGroup}>
              <View style={styles.createFolderContainer}>
                <TextInput
                  style={styles.folderNameInput}
                  value={newFolderName}
                  onChangeText={setNewFolderName}
                  placeholder="Folder name"
                  placeholderTextColor={tokens.colors.onSurface38}
                  autoFocus
                />
                <View style={styles.createFolderButtons}>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.cancelButton]}
                    onPress={() => {
                      setShowCreateFolder(false);
                      setNewFolderName('');
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.createButtonAction]}
                    onPress={createFolder}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.createButtonText}>Create</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.addFolderButton}
            onPress={() => setShowCreateFolder(true)}
            activeOpacity={0.7}
          >
            <MaterialIcon name="add" size={24} color="#FFFFFF" />
            <Text style={styles.addFolderButtonText}>Create New Folder</Text>
          </TouchableOpacity>
        )}

        {/* Folders List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chat Folders</Text>
          <View style={styles.cardGroup}>
            {folders.map((folder, index) => (
              <React.Fragment key={folder.id}>
                <View style={styles.folderItem}>
                  <View style={styles.folderItemLeft}>
                    <View style={[styles.folderIcon, { backgroundColor: folder.color }]}>
                      <MaterialIcon 
                        name={folder.isDefault ? "chat" : "folder"} 
                        size={20} 
                        color="#FFFFFF" 
                      />
                    </View>
                    <View style={styles.folderInfo}>
                      <Text style={styles.folderName}>{folder.name}</Text>
                      <Text style={styles.folderCount}>
                        {folder.chatCount} {folder.chatCount === 1 ? 'chat' : 'chats'}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.folderActions}>
                    {!folder.isDefault && (
                      <>
                        <TouchableOpacity 
                          onPress={() => editFolder(folder.id)}
                          style={styles.folderActionButton}
                          activeOpacity={0.7}
                        >
                          <MaterialIcon 
                            name="edit" 
                            size={20} 
                            color={tokens.colors.onSurface60} 
                          />
                        </TouchableOpacity>
                        <TouchableOpacity 
                          onPress={() => deleteFolder(folder.id)}
                          style={styles.folderActionButton}
                          activeOpacity={0.7}
                        >
                          <MaterialIcon 
                            name="delete" 
                            size={20} 
                            color={tokens.colors.error} 
                          />
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                </View>
                {index < folders.length - 1 && <View style={styles.separator} />}
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* Folder Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Folder Settings</Text>
          <View style={styles.cardGroup}>
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => console.log('Auto-organize chats')}
              activeOpacity={0.7}
            >
              <View style={styles.settingItemLeft}>
                <View style={styles.iconContainer}>
                  <MaterialIcon name="auto-fix" size={20} color="#FFFFFF" />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Auto-organize Chats</Text>
                  <Text style={styles.settingSubtitle}>Automatically sort chats into folders</Text>
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
              onPress={() => console.log('Folder order')}
              activeOpacity={0.7}
            >
              <View style={styles.settingItemLeft}>
                <View style={styles.iconContainer}>
                  <MaterialIcon name="reorder-horizontal" size={20} color="#FFFFFF" />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Folder Order</Text>
                  <Text style={styles.settingSubtitle}>Customize folder arrangement</Text>
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
  section: {
    marginBottom: tokens.spacing.l,
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
  addFolderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.colors.primary,
    paddingVertical: tokens.spacing.m,
    paddingHorizontal: tokens.spacing.m,
    marginHorizontal: tokens.spacing.xs,
    marginBottom: tokens.spacing.l,
    borderRadius: tokens.radius.m,
    gap: tokens.spacing.s,
  },
  addFolderButtonText: {
    ...tokens.typography.body,
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  createFolderContainer: {
    padding: tokens.spacing.m,
    gap: tokens.spacing.m,
  },
  folderNameInput: {
    ...tokens.typography.body,
    color: tokens.colors.onSurface,
    fontSize: 16,
    paddingVertical: tokens.spacing.m,
    paddingHorizontal: tokens.spacing.m,
    backgroundColor: tokens.colors.surface2,
    borderRadius: tokens.radius.s,
    borderWidth: 1,
    borderColor: tokens.colors.surface3,
  },
  createFolderButtons: {
    flexDirection: 'row',
    gap: tokens.spacing.m,
  },
  actionButton: {
    flex: 1,
    paddingVertical: tokens.spacing.m,
    paddingHorizontal: tokens.spacing.l,
    borderRadius: tokens.radius.s,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: tokens.colors.surface2,
  },
  createButtonAction: {
    backgroundColor: tokens.colors.primary,
  },
  cancelButtonText: {
    ...tokens.typography.body,
    color: tokens.colors.onSurface60,
    fontWeight: '600',
  },
  createButtonText: {
    ...tokens.typography.body,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  folderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: tokens.spacing.m,
    paddingHorizontal: tokens.spacing.m,
    minHeight: 64,
  },
  folderItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: tokens.spacing.m,
  },
  folderIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  folderInfo: {
    flex: 1,
    gap: tokens.spacing.xs / 2,
  },
  folderName: {
    ...tokens.typography.body,
    color: tokens.colors.onSurface,
    fontWeight: '600',
  },
  folderCount: {
    ...tokens.typography.caption,
    color: tokens.colors.onSurface60,
    fontSize: 12,
  },
  folderActions: {
    flexDirection: 'row',
    gap: tokens.spacing.s,
  },
  folderActionButton: {
    padding: tokens.spacing.s,
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
});
