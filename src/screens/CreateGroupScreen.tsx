import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as Haptics from 'expo-haptics';

import { tokens } from '../theme/tokens';
import { ChatsStackParamList } from '../navigation/types';
import { DynamicHeader, AnimatedFloatingLabel } from '../components';

type CreateGroupNavigationProp = StackNavigationProp<ChatsStackParamList, 'CreateGroup'>;

export const CreateGroupScreen: React.FC = () => {
  const navigation = useNavigation<CreateGroupNavigationProp>();
  const [scrollOffset, setScrollOffset] = useState(0);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');

  const handleCreateGroup = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // Here you would create the group
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <DynamicHeader 
        title="Create Group"
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
        scrollY={scrollOffset}
        rightIcons={[
          {
            icon: 'check',
            onPress: handleCreateGroup,
          },
        ]}
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
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Group Information</Text>
          
          <View style={styles.inputContainer}>
            <AnimatedFloatingLabel
              label="Group Name"
              value={groupName}
              onChangeText={setGroupName}
              maxLength={50}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <AnimatedFloatingLabel
              label="Description (Optional)"
              value={groupDescription}
              onChangeText={setGroupDescription}
              multiline={true}
              maxLength={200}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add Members</Text>
          <Text style={styles.placeholder}>
            Contact selection will be implemented here
          </Text>
        </View>

        <View style={styles.section}>
          <Button
            mode="contained"
            onPress={handleCreateGroup}
            style={styles.createButton}
            contentStyle={styles.buttonContent}
            buttonColor={tokens.colors.primary}
            textColor={tokens.colors.onSurface}
            disabled={groupName.trim().length === 0}
          >
            Create Group
          </Button>
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
    paddingBottom: tokens.spacing.xl,
    paddingTop: 135,
  },
  section: {
    marginBottom: tokens.spacing.l,
  },
  sectionTitle: {
    ...tokens.typography.caption,
    color: tokens.colors.onSurface60,
    fontWeight: '600',
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: tokens.spacing.s,
  },
  inputContainer: {
    marginBottom: tokens.spacing.m,
  },
  placeholder: {
    ...tokens.typography.body,
    color: tokens.colors.onSurface60,
    textAlign: 'center',
    padding: tokens.spacing.l,
    backgroundColor: tokens.colors.surface1,
    borderRadius: tokens.radius.m,
  },
  createButton: {
    borderRadius: tokens.radius.m,
  },
  buttonContent: {
    height: 48,
  },
});
