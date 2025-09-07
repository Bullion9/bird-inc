import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
  Vibration,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';

import { tokens } from '../theme/tokens';
import { SettingsStackParamList } from '../navigation/types';
import { MaterialIcon } from '../components';

type ScanNavigationProp = StackNavigationProp<SettingsStackParamList, 'Scan'>;

const { width, height } = Dimensions.get('window');
const scanAreaSize = width * 0.7;

export const ScanScreen: React.FC = () => {
  const navigation = useNavigation<ScanNavigationProp>();
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(true);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }
    };
  }, []);

  const handleBarcodeScanned = ({ type, data }: BarcodeScanningResult) => {
    if (!isScanning) return;

    setIsScanning(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Vibration.vibrate(100);

    // Process the scanned data
    processScannedData(type, data);

    // Re-enable scanning after 2 seconds
    scanTimeoutRef.current = setTimeout(() => {
      setIsScanning(true);
    }, 2000);
  };

  const processScannedData = (type: string, data: string) => {
    console.log('Scanned:', { type, data });

    // Check if it's a Bird contact QR code
    if (data.startsWith('bird://contact/')) {
      const contactId = data.replace('bird://contact/', '');
      Alert.alert(
        'Contact Found',
        `Add ${contactId} to your contacts?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Add Contact', onPress: () => handleAddContact(contactId) }
        ]
      );
    }
    // Check if it's a Bird group invite
    else if (data.startsWith('bird://group/')) {
      const groupId = data.replace('bird://group/', '');
      Alert.alert(
        'Group Invite',
        `Join group ${groupId}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Join Group', onPress: () => handleJoinGroup(groupId) }
        ]
      );
    }
    // Check if it's a URL
    else if (data.startsWith('http://') || data.startsWith('https://')) {
      Alert.alert(
        'Website Found',
        `Open ${data}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open', onPress: () => handleOpenUrl(data) }
        ]
      );
    }
    // Check if it's a phone number
    else if (/^\+?[\d\s\-\(\)]+$/.test(data) && data.replace(/\D/g, '').length >= 7) {
      Alert.alert(
        'Phone Number',
        `Call ${data}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Call', onPress: () => handleCall(data) }
        ]
      );
    }
    // Check if it's an email
    else if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data)) {
      Alert.alert(
        'Email Address',
        `Send email to ${data}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Email', onPress: () => handleEmail(data) }
        ]
      );
    }
    // Generic QR code
    else {
      Alert.alert(
        'QR Code Scanned',
        data,
        [
          { text: 'Copy', onPress: () => handleCopyToClipboard(data) },
          { text: 'Close', style: 'cancel' }
        ]
      );
    }
  };

  const handleAddContact = (contactId: string) => {
    // Navigate to add contact screen or handle contact addition
    console.log('Adding contact:', contactId);
    Alert.alert('Success', 'Contact added successfully!');
  };

  const handleJoinGroup = (groupId: string) => {
    // Handle group join logic
    console.log('Joining group:', groupId);
    Alert.alert('Success', 'Joined group successfully!');
  };

  const handleOpenUrl = (url: string) => {
    // Handle URL opening
    console.log('Opening URL:', url);
  };

  const handleCall = (phoneNumber: string) => {
    // Handle phone call
    console.log('Calling:', phoneNumber);
  };

  const handleEmail = (email: string) => {
    // Handle email
    console.log('Emailing:', email);
  };

  const handleCopyToClipboard = (text: string) => {
    // Handle clipboard copy
    console.log('Copied to clipboard:', text);
    Alert.alert('Copied', 'Content copied to clipboard');
  };

  const toggleFlash = () => {
    setFlashEnabled(prev => {
      const newValue = !prev;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      console.log('Flash toggled:', newValue ? 'ON' : 'OFF');
      return newValue;
    });
  };

  const handleClose = () => {
    navigation.goBack();
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <MaterialIcon name="qrcode" size={64} color={tokens.colors.onSurface38} />
          <Text style={styles.permissionTitle}>Camera Permission Required</Text>
          <Text style={styles.permissionText}>
            Please allow camera access to scan QR codes
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <CameraView
        style={styles.camera}
        facing="back"
        flash={flashEnabled ? 'on' : 'off'}
        barcodeScannerSettings={{
          barcodeTypes: ['qr', 'pdf417', 'code128', 'code39', 'codabar', 'ean13', 'ean8', 'upc_e'],
        }}
        onBarcodeScanned={isScanning ? handleBarcodeScanned : undefined}
        enableTorch={flashEnabled}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={handleClose}>
            <MaterialIcon name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Scan QR Code</Text>
          
          <TouchableOpacity style={styles.headerButton} onPress={toggleFlash}>
            <MaterialIcon 
              name={flashEnabled ? "flashlight" : "flashlight-off"} 
              size={24} 
              color="#FFFFFF" 
            />
          </TouchableOpacity>
        </View>

        {/* Scan Area */}
        <View style={styles.scanContainer}>
          <View style={styles.scanArea}>
            {/* Scanning Animation */}
            {isScanning && (
              <MotiView
                style={styles.scanLine}
                from={{ translateY: -scanAreaSize / 2 }}
                animate={{ translateY: scanAreaSize / 2 }}
                transition={{
                  type: 'timing',
                  duration: 2000,
                  loop: true,
                }}
              />
            )}
            
            {/* Corner Markers */}
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsText}>
            {isScanning 
              ? "Position QR code within the frame" 
              : "Processing..."}
          </Text>
          <Text style={styles.instructionsSubtext}>
            Supports QR codes, barcodes, and contact codes
          </Text>
        </View>

        {/* Bottom Actions */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => Alert.alert('My QR Code', 'Feature coming soon!')}
          >
            <MaterialIcon name="qrcode" size={24} color="#FFFFFF" />
            <Text style={styles.actionText}>My QR</Text>
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  camera: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: tokens.spacing.m,
    paddingBottom: tokens.spacing.m,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...tokens.typography.h3,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  scanContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: scanAreaSize,
    height: scanAreaSize,
    position: 'relative',
    overflow: 'hidden',
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#007AFF',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: '#007AFF',
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  instructionsContainer: {
    paddingHorizontal: tokens.spacing.l,
    paddingVertical: tokens.spacing.xl,
    alignItems: 'center',
  },
  instructionsText: {
    ...tokens.typography.body,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: tokens.spacing.s,
  },
  instructionsSubtext: {
    ...tokens.typography.caption,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  bottomContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: 40,
    paddingHorizontal: tokens.spacing.l,
  },
  actionButton: {
    alignItems: 'center',
    paddingVertical: tokens.spacing.m,
    paddingHorizontal: tokens.spacing.l,
    borderRadius: tokens.radius.m,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  actionText: {
    ...tokens.typography.caption,
    color: '#FFFFFF',
    marginTop: tokens.spacing.xs,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing.xl,
  },
  permissionTitle: {
    ...tokens.typography.h2,
    color: tokens.colors.onSurface,
    textAlign: 'center',
    marginTop: tokens.spacing.l,
    marginBottom: tokens.spacing.m,
  },
  permissionText: {
    ...tokens.typography.body,
    color: tokens.colors.onSurface60,
    textAlign: 'center',
    marginBottom: tokens.spacing.xl,
  },
  permissionButton: {
    backgroundColor: tokens.colors.primary,
    paddingVertical: tokens.spacing.m,
    paddingHorizontal: tokens.spacing.xl,
    borderRadius: tokens.radius.m,
  },
  permissionButtonText: {
    ...tokens.typography.body,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
