import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { tokens } from '../theme/tokens';
import { ChatsStackParamList } from '../navigation/types';
import { DynamicHeader } from '../components';

type GroupDetailsNavigationProp = StackNavigationProp<ChatsStackParamList, 'GroupDetails'>;
type GroupDetailsRouteProp = RouteProp<ChatsStackParamList, 'GroupDetails'>;

export const GroupDetailsScreen: React.FC = () => {
  const navigation = useNavigation<GroupDetailsNavigationProp>();
  const route = useRoute<GroupDetailsRouteProp>();
  
  const { groupId, groupName } = route.params;

  return (
    <View style={styles.container}>
      <DynamicHeader 
        title={groupName}
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
        scrollY={0}
      />
      
      <View style={styles.content}>
        <Text style={styles.placeholder}>
          Group Details Screen
        </Text>
        <Text style={styles.subtext}>
          Group ID: {groupId}
        </Text>
        <Text style={styles.subtext}>
          This screen will show group details, members, settings, etc.
        </Text>
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: tokens.spacing.l,
    paddingTop: 135,
  },
  placeholder: {
    ...tokens.typography.h2,
    color: tokens.colors.onSurface,
    textAlign: 'center',
    marginBottom: tokens.spacing.m,
  },
  subtext: {
    ...tokens.typography.body,
    color: tokens.colors.onSurface60,
    textAlign: 'center',
    marginBottom: tokens.spacing.s,
  },
});
