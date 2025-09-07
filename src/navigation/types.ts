export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  AuthDecision: undefined;
  PhoneAuth: undefined;
  ProfileCreate: undefined;
  Home: undefined;
  // Modals
  Search: undefined;
  EmojiPicker: { onEmojiSelect: (emoji: string) => void };
  UserProfile: { userId: string };
  Attachment: { type: 'camera' | 'gallery' | 'file' };
};

export type HomeTabParamList = {
  ChatsStack: undefined;
  CallsStack: undefined;
  StoriesStack: undefined;
  SettingsStack: undefined;
};

export type ChatsStackParamList = {
  ChatsList: undefined;
  ChatRoom: { chatId: string; userName: string };
  MediaViewer: { mediaUri: string; type: 'image' | 'video' };
  Groups: undefined;
  GroupDetails: { groupId: string; groupName: string };
  CreateGroup: undefined;
};

export type CallsStackParamList = {
  CallsList: undefined;
  CallScreen: { 
    contactName: string; 
    contactAvatar: string; 
    isIncoming: boolean;
    callId?: string; 
    isVideo?: boolean; 
  };
  VideoCall: {
    contactId: string;
    contactName: string;
    contactAvatar?: string;
    isIncoming?: boolean;
  };
};

export type StoriesStackParamList = {
  StoriesList: undefined;
  StoryViewer: { storyId: string };
};

export type SettingsStackParamList = {
  Settings: undefined;
  EditProfile: undefined;
  StorageAndData: undefined;
  ChatsSettings: undefined;
  NotificationSettings: undefined;
  PrivacySettings: undefined;
  HelpSettings: undefined;
  ContactSettings: undefined;
  InviteFriends: undefined;
  Notes: undefined;
  ManageFolders: undefined;
  StickerMarket: undefined;
  DesktopApp: undefined;
  BioEdit: { initialBio: string; onBioChange: (bio: string) => void };
  NameEdit: { initialName: string; onNameChange: (name: string) => void };
  UsernameEdit: { initialUsername: string; onUsernameChange: (username: string) => void };
  PhoneNumberView: { phoneNumber: string };
};
