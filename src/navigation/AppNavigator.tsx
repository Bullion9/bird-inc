import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';

import { tokens } from '../theme/tokens';
import { RootStackParamList, HomeTabParamList, ChatsStackParamList, CallsStackParamList, StoriesStackParamList, SettingsStackParamList } from './types';
import { CustomTabBar } from '../components';

// Screens
import { SplashScreen } from '../screens/SplashScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { AuthDecisionScreen } from '../screens/AuthDecisionScreen';
import { PhoneAuthScreen } from '../screens/PhoneAuthScreen';
import { ProfileCreateScreen } from '../screens/ProfileCreateScreen';
import { ChatsListScreen } from '../screens/ChatsListScreen';
import ChatRoomScreen from '../screens/ChatRoomScreen';
import { GroupsScreen } from '../screens/GroupsScreen';
import { GroupDetailsScreen } from '../screens/GroupDetailsScreen';
import { CreateGroupScreen } from '../screens/CreateGroupScreen';
import { ImportContactsScreen } from '../screens/ImportContactsScreen';
import { CallsListScreen } from '../screens/CallsListScreen';
import { CallScreen } from '../screens/CallScreen';
import { VideoCallScreen } from '../screens/VideoCallScreen';
import { ContactDetailsScreen } from '../screens/ContactDetailsScreen';
import { AddContactScreen } from '../screens/AddContactScreen';
import { FavoriteContactsScreen } from '../screens/FavoriteContactsScreen';
import { CallSettingsScreen } from '../screens/CallSettingsScreen';
import { StoriesListScreen } from '../screens/StoriesListScreen';
import { StoryViewerScreen } from '../screens/StoryViewerScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { EditProfileScreen } from '../screens/EditProfileScreen';
import { StorageAndDataScreen } from '../screens/StorageAndDataScreen';
import { ChatsSettingsScreen } from '../screens/ChatsSettingsScreen';
import { NotificationSettingsScreen } from '../screens/NotificationSettingsScreen';
import { PrivacySettingsScreen } from '../screens/PrivacySettingsScreen';
import { DisappearingMessagesScreen } from '../screens/DisappearingMessagesScreen';
import { HelpSettingsScreen } from '../screens/HelpSettingsScreen';
import { ContactSettingsScreen } from '../screens/ContactSettingsScreen';
import { InviteFriendsScreen } from '../screens/InviteFriendsScreen';
import { NotesScreen } from '../screens/NotesScreen';
import { ManageFoldersScreen } from '../screens/ManageFoldersScreen';
import { StickerMarketScreen } from '../screens/StickerMarketScreen';
import { DesktopAppScreen } from '../screens/DesktopAppScreen';
import { BioEditScreen } from '../screens/BioEditScreen';
import { ContactBioEditScreen } from '../screens/ContactBioEditScreen';
import { NameEditScreen } from '../screens/NameEditScreen';
import { UsernameEditScreen } from '../screens/UsernameEditScreen';
import { PhoneNumberViewScreen } from '../screens/PhoneNumberViewScreen';
import { ScanScreen } from '../screens/ScanScreen';
import { MyQRScreen } from '../screens/MyQRScreen';
import { AccountScreen } from '../screens/AccountScreen';
import { MaterialIcon } from '../components';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<HomeTabParamList>();
const ChatsStack = createStackNavigator<ChatsStackParamList>();
const CallsStack = createStackNavigator<CallsStackParamList>();
const StoriesStack = createStackNavigator<StoriesStackParamList>();
const SettingsStack = createStackNavigator<SettingsStackParamList>();

// Placeholder screens
const PlaceholderScreen = ({ title }: { title: string }) => (
  <View style={styles.placeholder}>
    <Text style={styles.placeholderText}>{title}</Text>
  </View>
);

// Chats Stack Navigator
const ChatsStackNavigator = () => {
  return (
    <ChatsStack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: tokens.colors.bg },
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        transitionSpec: {
          open: {
            animation: 'timing',
            config: {
              duration: 250,
            },
          },
          close: {
            animation: 'timing',
            config: {
              duration: 250,
            },
          },
        },
      }}
    >
      <ChatsStack.Screen name="ChatsList" component={ChatsListScreen} />
      <ChatsStack.Screen name="Groups" component={GroupsScreen} />
      <ChatsStack.Screen name="GroupDetails" component={GroupDetailsScreen} />
      <ChatsStack.Screen name="CreateGroup" component={CreateGroupScreen} />
      <ChatsStack.Screen name="ImportContacts" component={ImportContactsScreen} />
    </ChatsStack.Navigator>
  );
};

// Calls Stack Navigator
const CallsStackNavigator = () => {
  return (
    <CallsStack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: tokens.colors.bg },
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        transitionSpec: {
          open: {
            animation: 'timing',
            config: {
              duration: 250,
            },
          },
          close: {
            animation: 'timing',
            config: {
              duration: 250,
            },
          },
        },
      }}
    >
      <CallsStack.Screen name="CallsList" component={CallsListScreen} />
      <CallsStack.Screen name="CallScreen" component={CallScreen} />
      <CallsStack.Screen name="VideoCall" component={VideoCallScreen} />
      <CallsStack.Screen name="ContactDetails" component={ContactDetailsScreen} />
      <CallsStack.Screen name="AddContact" component={AddContactScreen} />
      <CallsStack.Screen name="FavoriteContacts" component={FavoriteContactsScreen} />
      <CallsStack.Screen name="CallSettings" component={CallSettingsScreen} />
    </CallsStack.Navigator>
  );
};

// Stories Stack Navigator
const StoriesStackNavigator = () => {
  return (
    <StoriesStack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: tokens.colors.bg },
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        transitionSpec: {
          open: {
            animation: 'timing',
            config: {
              duration: 250,
            },
          },
          close: {
            animation: 'timing',
            config: {
              duration: 250,
            },
          },
        },
      }}
    >
      <StoriesStack.Screen name="StoriesList" component={StoriesListScreen} />
      <StoriesStack.Screen name="StoryViewer" component={StoryViewerScreen} />
    </StoriesStack.Navigator>
  );
};

// Settings Stack Navigator
const SettingsStackNavigator = () => {
  return (
    <SettingsStack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: tokens.colors.bg },
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        transitionSpec: {
          open: {
            animation: 'timing',
            config: {
              duration: 250,
            },
          },
          close: {
            animation: 'timing',
            config: {
              duration: 250,
            },
          },
        },
      }}
    >
      <SettingsStack.Screen name="Settings" component={SettingsScreen} />
      <SettingsStack.Screen name="Account" component={AccountScreen} />
      <SettingsStack.Screen name="EditProfile" component={EditProfileScreen} />
      <SettingsStack.Screen name="StorageAndData" component={StorageAndDataScreen} />
      <SettingsStack.Screen name="ChatsSettings" component={ChatsSettingsScreen} />
      <SettingsStack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
      <SettingsStack.Screen name="PrivacySettings" component={PrivacySettingsScreen} />
      <SettingsStack.Screen name="DisappearingMessages" component={DisappearingMessagesScreen} />
      <SettingsStack.Screen name="HelpSettings" component={HelpSettingsScreen} />
      <SettingsStack.Screen name="ContactSettings" component={ContactSettingsScreen} />
      <SettingsStack.Screen name="InviteFriends" component={InviteFriendsScreen} />
      <SettingsStack.Screen name="Notes" component={NotesScreen} />
      <SettingsStack.Screen name="ManageFolders" component={ManageFoldersScreen} />
      <SettingsStack.Screen name="StickerMarket" component={StickerMarketScreen} />
      <SettingsStack.Screen name="DesktopApp" component={DesktopAppScreen} />
      <SettingsStack.Screen name="BioEdit" component={BioEditScreen} />
      <SettingsStack.Screen name="NameEdit" component={NameEditScreen} />
      <SettingsStack.Screen name="UsernameEdit" component={UsernameEditScreen} />
      <SettingsStack.Screen name="PhoneNumberView" component={PhoneNumberViewScreen} />
      <SettingsStack.Screen name="Scan" component={ScanScreen} />
      <SettingsStack.Screen name="MyQR" component={MyQRScreen} />
    </SettingsStack.Navigator>
  );
};

// Tab Navigator
const HomeTabNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="ChatsStack"
        component={ChatsStackNavigator}
      />
      <Tab.Screen
        name="CallsStack"
        component={CallsStackNavigator}
      />
      <Tab.Screen
        name="StoriesStack"
        component={StoriesStackNavigator}
      />
      <Tab.Screen
        name="SettingsStack"
        component={SettingsStackNavigator}
      />
    </Tab.Navigator>
  );
};

// Root Navigator
export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: tokens.colors.bg },
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
          transitionSpec: {
            open: {
              animation: 'timing',
              config: {
                duration: 250,
              },
            },
            close: {
              animation: 'timing',
              config: {
                duration: 250,
              },
            },
          },
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="AuthDecision" component={AuthDecisionScreen} />
        <Stack.Screen name="PhoneAuth" component={PhoneAuthScreen} />
        <Stack.Screen name="ProfileCreate" component={ProfileCreateScreen} />
        <Stack.Screen name="Home" component={HomeTabNavigator} />
        <Stack.Screen name="ChatRoom" component={ChatRoomScreen} />
        <Stack.Screen name="ContactBioEdit" component={ContactBioEditScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  placeholder: {
    flex: 1,
    backgroundColor: tokens.colors.bg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    ...tokens.typography.h2,
    color: tokens.colors.onSurface60,
  },
});
