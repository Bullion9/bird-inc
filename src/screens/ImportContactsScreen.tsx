import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  FlatList,
  PermissionsAndroid,
  Platform,
  Linking,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcon } from '../components/MaterialIcon';
import { DynamicHeader } from '../components/DynamicHeader';
import { tokens } from '../theme/tokens';
import * as Haptics from 'expo-haptics';
import * as Contacts from 'expo-contacts';

interface ImportSource {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  type: 'device' | 'social' | 'cloud';
  available: boolean;
}

interface DeviceContact {
  id: string;
  name: string;
  phoneNumbers: string[];
  emails: string[];
  selected: boolean;
}

export function ImportContactsScreen() {
  const navigation = useNavigation();
  const [importSources] = useState<ImportSource[]>([
    {
      id: 'device',
      title: 'Phone Contacts',
      subtitle: 'Import contacts from your device',
      icon: 'phone',
      color: '#34C759',
      type: 'device',
      available: true,
    },
    {
      id: 'google',
      title: 'Google Contacts',
      subtitle: 'Import from your Google account',
      icon: 'google',
      color: '#4285F4',
      type: 'cloud',
      available: true,
    },
    {
      id: 'icloud',
      title: 'iCloud Contacts',
      subtitle: 'Import from your iCloud account',
      icon: 'cloud',
      color: '#007AFF',
      type: 'cloud',
      available: Platform.OS === 'ios',
    },
    {
      id: 'outlook',
      title: 'Outlook Contacts',
      subtitle: 'Import from your Microsoft account',
      icon: 'microsoft-outlook',
      color: '#0078D4',
      type: 'cloud',
      available: true,
    },
    {
      id: 'facebook',
      title: 'Facebook Friends',
      subtitle: 'Find friends who use this app',
      icon: 'facebook',
      color: '#1877F2',
      type: 'social',
      available: false, // Disabled for privacy
    },
    {
      id: 'whatsapp',
      title: 'WhatsApp Contacts',
      subtitle: 'Import from WhatsApp',
      icon: 'whatsapp',
      color: '#25D366',
      type: 'social',
      available: false, // Would require WhatsApp API
    },
  ]);

  const [deviceContacts, setDeviceContacts] = useState<DeviceContact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<DeviceContact[]>([]);
  const [showDeviceContacts, setShowDeviceContacts] = useState(false);
  const [selectedCount, setSelectedCount] = useState(0);
  const [hasContactsPermission, setHasContactsPermission] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    checkContactsPermission();
  }, []);

  useEffect(() => {
    // Filter contacts based on search query
    if (searchQuery.trim() === '') {
      setFilteredContacts(deviceContacts);
    } else {
      const filtered = deviceContacts.filter(contact =>
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.phoneNumbers.some(phone => 
          phone.replace(/\s+/g, '').includes(searchQuery.replace(/\s+/g, ''))
        )
      );
      setFilteredContacts(filtered);
    }
  }, [searchQuery, deviceContacts]);

  const checkContactsPermission = async () => {
    const { status } = await Contacts.getPermissionsAsync();
    setHasContactsPermission(status === 'granted');
  };

  const requestContactsPermission = async () => {
    const { status } = await Contacts.requestPermissionsAsync();
    setHasContactsPermission(status === 'granted');
    return status === 'granted';
  };

  const loadDeviceContacts = async () => {
    try {
      let hasPermission = hasContactsPermission;
      
      if (!hasPermission) {
        hasPermission = await requestContactsPermission();
      }

      if (!hasPermission) {
        Alert.alert(
          'Permission Required',
          'Please allow access to your contacts to import them.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Settings', onPress: () => Linking.openSettings() },
          ]
        );
        return;
      }

      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Emails, Contacts.Fields.Name],
      });

      const formattedContacts: DeviceContact[] = data
        .filter((contact: any) => contact.phoneNumbers && contact.phoneNumbers.length > 0)
        .map((contact: any) => ({
          id: contact.id || '',
          name: contact.name || 'Unknown',
          phoneNumbers: contact.phoneNumbers?.map((phone: any) => phone.number || '') || [],
          emails: contact.emails?.map((email: any) => email.email || '') || [],
          selected: false,
        }))
        .sort((a: DeviceContact, b: DeviceContact) => a.name.localeCompare(b.name));

      setDeviceContacts(formattedContacts);
      setFilteredContacts(formattedContacts);
      setShowDeviceContacts(true);
    } catch (error) {
      console.error('Error loading contacts:', error);
      Alert.alert('Error', 'Failed to load contacts from your device.');
    }
  };

  const handleImportSource = (source: ImportSource) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    switch (source.id) {
      case 'device':
        loadDeviceContacts();
        break;
      case 'google':
        Alert.alert(
          'Google Contacts',
          'This will redirect you to sign in with Google and import your contacts.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Continue', onPress: () => handleCloudImport('Google') },
          ]
        );
        break;
      case 'icloud':
        Alert.alert(
          'iCloud Contacts',
          'This will import contacts from your iCloud account.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Continue', onPress: () => handleCloudImport('iCloud') },
          ]
        );
        break;
      case 'outlook':
        Alert.alert(
          'Outlook Contacts',
          'This will redirect you to sign in with Microsoft and import your contacts.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Continue', onPress: () => handleCloudImport('Outlook') },
          ]
        );
        break;
      default:
        Alert.alert('Coming Soon', `${source.title} import will be available in a future update.`);
    }
  };

  const handleCloudImport = (provider: string) => {
    // In a real app, this would integrate with OAuth flows
    Alert.alert(
      `${provider} Import`,
      `Integration with ${provider} is not implemented in this demo. This would typically open a web view for authentication and then import contacts.`
    );
  };

  const toggleContactSelection = (contactId: string) => {
    setDeviceContacts(prev => {
      const updated = prev.map(contact => 
        contact.id === contactId 
          ? { ...contact, selected: !contact.selected }
          : contact
      );
      
      setSelectedCount(updated.filter(c => c.selected).length);
      return updated;
    });
  };

  const selectAllContacts = () => {
    const visibleSelectedCount = filteredContacts.filter(c => c.selected).length;
    const allVisibleSelected = visibleSelectedCount === filteredContacts.length && filteredContacts.length > 0;
    
    setDeviceContacts(prev => {
      const updated = prev.map(contact => {
        // Only toggle selection for contacts that are currently visible (filtered)
        const isVisible = filteredContacts.some(fc => fc.id === contact.id);
        if (isVisible) {
          return { ...contact, selected: !allVisibleSelected };
        }
        return contact;
      });
      
      setSelectedCount(updated.filter(c => c.selected).length);
      return updated;
    });
  };

  const importSelectedContacts = () => {
    const selectedContacts = deviceContacts.filter(c => c.selected);
    
    if (selectedContacts.length === 0) {
      Alert.alert('No Contacts Selected', 'Please select at least one contact to import.');
      return;
    }

    Alert.alert(
      'Import Contacts',
      `Import ${selectedContacts.length} contact${selectedContacts.length === 1 ? '' : 's'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Import',
          onPress: () => {
            // In a real app, this would save contacts to the app's database
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert(
              'Import Complete',
              `Successfully imported ${selectedContacts.length} contact${selectedContacts.length === 1 ? '' : 's'}.`,
              [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
          },
        },
      ]
    );
  };

  const renderImportSource = ({ item }: { item: ImportSource }) => (
    <TouchableOpacity
      style={[styles.sourceItem, !item.available && styles.sourceItemDisabled]}
      onPress={() => item.available && handleImportSource(item)}
      activeOpacity={item.available ? 0.7 : 1}
    >
      <View style={[styles.sourceIcon, { backgroundColor: item.available ? item.color : tokens.colors.onSurface38 }]}>
        <MaterialIcon 
          name={item.icon} 
          size={24} 
          color="#FFFFFF" 
        />
      </View>
      <View style={styles.sourceContent}>
        <Text style={[styles.sourceTitle, !item.available && styles.disabledText]}>
          {item.title}
        </Text>
        <Text style={[styles.sourceSubtitle, !item.available && styles.disabledText]}>
          {item.available ? item.subtitle : 'Coming soon'}
        </Text>
      </View>
      <MaterialIcon 
        name="chevron-right" 
        size={20} 
        color={item.available ? tokens.colors.onSurface38 : tokens.colors.onSurface38} 
      />
    </TouchableOpacity>
  );

  const renderDeviceContact = ({ item }: { item: DeviceContact }) => (
    <TouchableOpacity
      style={styles.contactItem}
      onPress={() => toggleContactSelection(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.contactInfo}>
        <View style={styles.contactAvatar}>
          <Text style={styles.contactAvatarText}>
            {item.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.contactDetails}>
          <Text style={styles.contactName}>{item.name}</Text>
          <Text style={styles.contactPhone}>
            {item.phoneNumbers[0] || 'No phone number'}
          </Text>
        </View>
      </View>
      <View style={[styles.checkbox, item.selected && styles.checkboxSelected]}>
        {item.selected && (
          <MaterialIcon name="check" size={16} color="#FFFFFF" />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <DynamicHeader 
        title={showDeviceContacts ? 'Device Contacts' : 'Import Contacts'}
        showBackButton={true}
        onBackPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          if (showDeviceContacts) {
            setShowDeviceContacts(false);
            setSearchQuery('');
          } else {
            navigation.goBack();
          }
        }}
        rightIcons={showDeviceContacts ? [
          {
            icon: 'checkbox-multiple-marked',
            onPress: selectAllContacts,
          },
        ] : []}
      />

      {!showDeviceContacts ? (
        // Import Sources List
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>Choose Import Source</Text>
            <Text style={styles.infoText}>
              Select where you'd like to import your contacts from. We'll help you find friends who are already using the app.
            </Text>
          </View>

          <FlatList
            data={importSources}
            renderItem={renderImportSource}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            style={styles.sourcesList}
          />
        </ScrollView>
      ) : (
        // Device Contacts List
        <View style={styles.contactsContainer}>
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <MaterialIcon name="magnify" size={20} color={tokens.colors.onSurface60} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search contacts..."
                placeholderTextColor={tokens.colors.onSurface60}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCorrect={false}
                autoCapitalize="none"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearchQuery('')}
                  style={styles.clearButton}
                  activeOpacity={0.7}
                >
                  <MaterialIcon name="close-circle" size={18} color={tokens.colors.onSurface60} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {selectedCount > 0 && (
            <View style={styles.selectionHeader}>
              <Text style={styles.selectionText}>
                {selectedCount} contact{selectedCount === 1 ? '' : 's'} selected
              </Text>
              <TouchableOpacity
                style={styles.importButton}
                onPress={importSelectedContacts}
                activeOpacity={0.8}
              >
                <Text style={styles.importButtonText}>Import</Text>
              </TouchableOpacity>
            </View>
          )}
          
          <FlatList
            data={filteredContacts}
            renderItem={renderDeviceContact}
            keyExtractor={(item) => item.id}
            style={styles.contactsList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              searchQuery.length > 0 ? (
                <View style={styles.emptyState}>
                  <MaterialIcon name="account-search" size={48} color={tokens.colors.onSurface38} />
                  <Text style={styles.emptyStateTitle}>No contacts found</Text>
                  <Text style={styles.emptyStateText}>
                    Try adjusting your search term
                  </Text>
                </View>
              ) : deviceContacts.length === 0 ? (
                <View style={styles.emptyState}>
                  <MaterialIcon name="contacts" size={48} color={tokens.colors.onSurface38} />
                  <Text style={styles.emptyStateTitle}>No contacts</Text>
                  <Text style={styles.emptyStateText}>
                    No contacts found on your device
                  </Text>
                </View>
              ) : null
            }
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.bg,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 100, // Space for header
    paddingHorizontal: tokens.spacing.m,
    paddingBottom: tokens.spacing.xl,
  },
  infoSection: {
    marginBottom: tokens.spacing.xl,
  },
  infoTitle: {
    ...tokens.typography.h3,
    color: tokens.colors.onSurface,
    marginBottom: tokens.spacing.s,
    fontWeight: '600',
  },
  infoText: {
    ...tokens.typography.body,
    color: tokens.colors.onSurface60,
    lineHeight: 22,
  },
  sourcesList: {
    backgroundColor: tokens.colors.surface1,
    borderRadius: tokens.radius.m,
  },
  sourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: tokens.spacing.m,
    paddingHorizontal: tokens.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.separator,
  },
  sourceItemDisabled: {
    opacity: 0.5,
  },
  sourceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: tokens.spacing.m,
  },
  sourceContent: {
    flex: 1,
  },
  sourceTitle: {
    ...tokens.typography.headline,
    color: tokens.colors.onSurface,
    fontWeight: '600',
    marginBottom: 2,
  },
  sourceSubtitle: {
    ...tokens.typography.footnote,
    color: tokens.colors.onSurface60,
  },
  disabledText: {
    color: tokens.colors.onSurface38,
  },
  contactsContainer: {
    flex: 1,
    paddingTop: 100, // Space for header
  },
  searchContainer: {
    paddingHorizontal: tokens.spacing.m,
    paddingVertical: tokens.spacing.s,
    backgroundColor: tokens.colors.bg,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.separator,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.surface1,
    borderRadius: tokens.radius.s,
    paddingHorizontal: tokens.spacing.m,
    paddingVertical: tokens.spacing.s,
  },
  searchInput: {
    flex: 1,
    marginLeft: tokens.spacing.s,
    ...tokens.typography.body,
    color: tokens.colors.onSurface,
    fontSize: 16,
  },
  clearButton: {
    padding: tokens.spacing.xs,
  },
  selectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: tokens.spacing.m,
    paddingVertical: tokens.spacing.s,
    backgroundColor: tokens.colors.surface1,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.separator,
  },
  selectionText: {
    ...tokens.typography.body,
    color: tokens.colors.onSurface,
    fontWeight: '500',
  },
  importButton: {
    backgroundColor: tokens.colors.primary,
    paddingHorizontal: tokens.spacing.m,
    paddingVertical: tokens.spacing.s,
    borderRadius: tokens.radius.s,
  },
  importButtonText: {
    ...tokens.typography.callout,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  contactsList: {
    flex: 1,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: tokens.spacing.m,
    paddingHorizontal: tokens.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.separator,
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  contactAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: tokens.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: tokens.spacing.m,
  },
  contactAvatarText: {
    ...tokens.typography.callout,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  contactDetails: {
    flex: 1,
  },
  contactName: {
    ...tokens.typography.headline,
    color: tokens.colors.onSurface,
    fontWeight: '500',
  },
  contactPhone: {
    ...tokens.typography.footnote,
    color: tokens.colors.onSurface60,
    marginTop: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: tokens.colors.onSurface38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: tokens.colors.primary,
    borderColor: tokens.colors.primary,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: tokens.spacing.xl * 2,
    paddingHorizontal: tokens.spacing.m,
  },
  emptyStateTitle: {
    ...tokens.typography.h3,
    color: tokens.colors.onSurface,
    textAlign: 'center',
    marginTop: tokens.spacing.m,
    marginBottom: tokens.spacing.s,
  },
  emptyStateText: {
    ...tokens.typography.body,
    color: tokens.colors.onSurface60,
    textAlign: 'center',
    lineHeight: 22,
  },
});
