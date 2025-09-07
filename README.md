# Bird Chat App 🐦

A modern, dark-mode chat application built with Expo, React Native, TypeScript, and Material Design 3.

## Features

- **Dark Mode Design**: Beautiful dark theme with Material Design 3 principles
- **Secure Messaging**: End-to-end encrypted conversations
- **Voice & Video Calls**: Crystal clear communication
- **Stories**: Share disappearing moments
- **Animated UI**: Smooth animations with Moti and React Native Reanimated

## Tech Stack

- **Framework**: Expo + React Native
- **Language**: TypeScript
- **UI Library**: React Native Paper (Material 3)
- **Animations**: Moti + React Native Reanimated
- **Navigation**: React Navigation 6
- **Icons**: Material Symbols (via React Native Paper)

## Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── DynamicHeader.tsx    # Animated header with blur effect
│   ├── AnimatedFloatingLabel.tsx  # Material floating label inputs
│   ├── BirdCard.tsx         # Card component with ripple effects
│   ├── Avatar.tsx           # User avatar with online status
│   └── MaterialIcon.tsx     # Material Design icons
├── navigation/          # Navigation configuration
│   ├── AppNavigator.tsx     # Main navigation stack
│   └── types.ts             # Navigation type definitions
├── screens/             # App screens
│   ├── SplashScreen.tsx     # Loading screen
│   ├── OnboardingScreen.tsx # Welcome carousel
│   ├── AuthDecisionScreen.tsx  # Login/Register choice
│   ├── PhoneAuthScreen.tsx  # Phone verification
│   └── ChatsListScreen.tsx  # Main chat list
└── theme/               # Design system
    ├── tokens.ts            # Design tokens
    └── theme.ts             # React Native Paper theme
```

## Design System

### Color Palette
- **Background**: `#000000`
- **Surface 1**: `#121212`
- **Surface 2**: `#1E1E1E`
- **Surface 3**: `#252525`
- **Primary**: `#007AFF` (iOS Blue)
- **Secondary**: `#03DAC6`

### Typography
- **Font**: SF Pro Rounded
- **Hierarchy**: H1 (28px), H2 (22px), Body (16px), Caption (13px)

### Motion
- **Enter**: 250ms ease-out
- **Exit**: 200ms ease-in
- **Bounce**: Spring animation with custom tension/friction

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm start
   ```

3. **Run on different platforms**:
   - **Web**: Press `w` or visit http://localhost:8081
   - **iOS**: Press `i` (requires Xcode)
   - **Android**: Press `a` (requires Android Studio)
   - **Expo Go**: Scan QR code with Expo Go app

## Available Scripts

- `npm start` - Start Expo development server
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS device/simulator
- `npm run web` - Run in web browser

## Navigation Flow

```
Splash → Onboarding → AuthDecision → PhoneAuth → ProfileCreate → Home
                                                                   ↓
                                                              TabNavigator
                                                          ┌─────┬─────┬─────┬─────┐
                                                          Chats Calls Stories Settings
```

## Component Library

### Atomic Components

1. **DynamicHeader**: Animated header with blur effect and elevation
2. **AnimatedFloatingLabel**: Material Design text inputs with floating labels
3. **BirdCard**: Elevated cards with ripple effects and avatar support
4. **Avatar**: User avatars with online status indicators
5. **MaterialIcon**: Consistent icon system with Material Symbols

### Usage Examples

```tsx
// Dynamic Header with back button and actions
<DynamicHeader
  title="Chat Room"
  showBackButton
  onBackPress={() => navigation.goBack()}
  rightIcons={[
    { icon: 'call', onPress: handleCall },
    { icon: 'videocam', onPress: handleVideoCall }
  ]}
/>

// Animated input field
<AnimatedFloatingLabel
  label="Phone Number"
  value={phone}
  onChangeText={setPhone}
  keyboardType="phone-pad"
  error={phoneError}
/>

// Chat list item
<BirdCard
  onPress={() => openChat(chat.id)}
  avatar={{
    name: chat.userName,
    source: chat.avatar,
    isOnline: chat.isOnline
  }}
  title={chat.userName}
  subtitle={chat.lastMessage}
/>
```

## Development Status

✅ **Completed**:
- Project setup and configuration
- Design system and theming
- Core atomic components
- Navigation structure
- Basic screens (Splash, Onboarding, Auth, Chats)

🚧 **In Progress**:
- Chat room interface
- Profile creation flow
- Settings screens

📋 **Planned**:
- Real-time messaging
- Voice/video calling
- Stories feature
- Media sharing
- Push notifications

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

---

Built with ❤️ using Expo and React Native
