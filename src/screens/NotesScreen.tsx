import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as Haptics from 'expo-haptics';

import { tokens } from '../theme/tokens';
import { SettingsStackParamList } from '../navigation/types';
import { DynamicHeader, MaterialIcon } from '../components';

type NotesNavigationProp = StackNavigationProp<SettingsStackParamList, 'Notes'>;

interface Note {
  id: string;
  title: string;
  content: string;
  date: string;
  isPinned: boolean;
}

export const NotesScreen: React.FC = () => {
  const navigation = useNavigation<NotesNavigationProp>();
  const [scrollOffset, setScrollOffset] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [notes, setNotes] = useState<Note[]>([
    {
      id: '1',
      title: 'Meeting Notes',
      content: 'Discussed project timeline and deliverables...',
      date: '2025-01-15',
      isPinned: true,
    },
    {
      id: '2',
      title: 'Shopping List',
      content: 'Milk, bread, eggs, apples...',
      date: '2025-01-14',
      isPinned: false,
    },
    {
      id: '3',
      title: 'Recipe Ideas',
      content: 'Pasta with herbs, grilled chicken...',
      date: '2025-01-13',
      isPinned: true,
    },
  ]);

  const getIconColor = (iconName: string): string => {
    const colorMap: Record<string, string> = {
      // Notes - bright colors for visibility
      'add': '#34C759',
    };
    
    return colorMap[iconName] || '#007AFF';
  };

  const getIconBackgroundColor = (iconName: string): string => {
    // iOS Settings-style solid background colors
    const backgroundColorMap: Record<string, string> = {
      'search': '#8E8E93',           // Gray background
      'add': '#34C759',              // Green background
      'pin': '#FF9500',              // Orange background
      'pin_active': '#FF453A',       // Red background for pinned
      'delete': '#FF453A',           // Red background
      'note': '#5856D6',             // Purple background
    };
    return backgroundColorMap[iconName] || '#007AFF';
  };

  const createNewNote = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Here you would navigate to a note editor
    console.log('Create new note');
  };

  const togglePin = (noteId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setNotes(prev => prev.map(note => 
      note.id === noteId ? { ...note, isPinned: !note.isPinned } : note
    ));
  };

  const deleteNote = (noteId: string) => {
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            setNotes(prev => prev.filter(note => note.id !== noteId));
          }
        }
      ]
    );
  };

  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedNotes = filteredNotes.filter(note => note.isPinned);
  const regularNotes = filteredNotes.filter(note => !note.isPinned);

  return (
    <View style={styles.container}>
      <DynamicHeader 
        title="Notes"
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
            <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor('search') }]}>
              <MaterialIcon name="search" size={20} color="#FFFFFF" />
            </View>
            <TextInput
              style={styles.searchInput}
              placeholder="Search notes"
              placeholderTextColor="rgba(142, 142, 147, 1)"
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
              clearButtonMode="while-editing"
            />
          </View>
        </View>

        {/* Create Note Button */}
        <TouchableOpacity 
          style={styles.createButton}
          onPress={createNewNote}
          activeOpacity={0.7}
        >
          <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor('add') }]}>
            <MaterialIcon name="add" size={24} color="#FFFFFF" />
          </View>
          <Text style={styles.createButtonText}>Create New Note</Text>
        </TouchableOpacity>

        {/* Pinned Notes */}
        {pinnedNotes.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pinned</Text>
            <View style={styles.cardGroup}>
              {pinnedNotes.map((note, index) => (
                <React.Fragment key={note.id}>
                  <TouchableOpacity 
                    style={styles.noteItem}
                    onPress={() => console.log('Edit note:', note.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.noteContent}>
                      <View style={styles.noteHeader}>
                        <Text style={styles.noteTitle}>{note.title}</Text>
                        <TouchableOpacity 
                          onPress={() => togglePin(note.id)}
                          style={styles.pinButton}
                        >
                          <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor('pin_active') }]}>
                            <MaterialIcon 
                              name="pin" 
                              size={16} 
                              color="#FFFFFF" 
                            />
                          </View>
                        </TouchableOpacity>
                      </View>
                      <Text style={styles.notePreview}>{note.content}</Text>
                      <Text style={styles.noteDate}>{note.date}</Text>
                    </View>
                    <TouchableOpacity 
                      onPress={() => deleteNote(note.id)}
                      style={styles.deleteButton}
                    >
                      <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor('delete') }]}>
                        <MaterialIcon 
                          name="delete" 
                          size={20} 
                          color="#FFFFFF" 
                        />
                      </View>
                    </TouchableOpacity>
                  </TouchableOpacity>
                  {index < pinnedNotes.length - 1 && <View style={styles.separator} />}
                </React.Fragment>
              ))}
            </View>
          </View>
        )}

        {/* Regular Notes */}
        {regularNotes.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <View style={styles.cardGroup}>
              {regularNotes.map((note, index) => (
                <React.Fragment key={note.id}>
                  <TouchableOpacity 
                    style={styles.noteItem}
                    onPress={() => console.log('Edit note:', note.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.noteContent}>
                      <View style={styles.noteHeader}>
                        <Text style={styles.noteTitle}>{note.title}</Text>
                        <TouchableOpacity 
                          onPress={() => togglePin(note.id)}
                          style={styles.pinButton}
                        >
                          <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor('pin') }]}>
                            <MaterialIcon 
                              name="pin" 
                              size={16} 
                              color="#FFFFFF" 
                            />
                          </View>
                        </TouchableOpacity>
                      </View>
                      <Text style={styles.notePreview}>{note.content}</Text>
                      <Text style={styles.noteDate}>{note.date}</Text>
                    </View>
                    <TouchableOpacity 
                      onPress={() => deleteNote(note.id)}
                      style={styles.deleteButton}
                    >
                      <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor('delete') }]}>
                        <MaterialIcon 
                          name="delete" 
                          size={20} 
                          color="#FFFFFF" 
                        />
                      </View>
                    </TouchableOpacity>
                  </TouchableOpacity>
                  {index < regularNotes.length - 1 && <View style={styles.separator} />}
                </React.Fragment>
              ))}
            </View>
          </View>
        )}

        {/* Empty State */}
        {filteredNotes.length === 0 && (
          <View style={styles.emptyState}>
            <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor('note'), width: 64, height: 64, borderRadius: 16 }]}>
              <MaterialIcon name="note" size={64} color="#FFFFFF" />
            </View>
            <Text style={styles.emptyTitle}>No Notes Found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery ? 'Try a different search term' : 'Create your first note to get started'}
            </Text>
          </View>
        )}
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
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'System',
    paddingVertical: 0,
  },
  createButton: {
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
  createButtonText: {
    ...tokens.typography.body,
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
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
  noteItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: tokens.spacing.m,
    paddingHorizontal: tokens.spacing.m,
    minHeight: 80,
  },
  noteContent: {
    flex: 1,
    gap: tokens.spacing.xs,
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  noteTitle: {
    ...tokens.typography.body,
    color: tokens.colors.onSurface,
    fontWeight: '600',
    flex: 1,
  },
  pinButton: {
    padding: 2,
  },
  notePreview: {
    ...tokens.typography.body,
    color: tokens.colors.onSurface60,
    fontSize: 14,
  },
  noteDate: {
    ...tokens.typography.caption,
    color: tokens.colors.onSurface38,
    fontSize: 12,
  },
  deleteButton: {
    padding: 2,
    marginLeft: tokens.spacing.s,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: tokens.colors.surface3,
    marginLeft: tokens.spacing.m,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: tokens.spacing.xxl,
    gap: tokens.spacing.m,
  },
  emptyTitle: {
    ...tokens.typography.h3,
    color: tokens.colors.onSurface60,
    fontWeight: '600',
  },
  emptySubtitle: {
    ...tokens.typography.body,
    color: tokens.colors.onSurface38,
    textAlign: 'center',
    paddingHorizontal: tokens.spacing.l,
  },
  iconContainer: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
});
