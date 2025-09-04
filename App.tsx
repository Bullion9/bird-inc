import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { birdTheme } from './src/theme/theme';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PaperProvider theme={birdTheme}>
          <AppNavigator />
          <StatusBar style="light" backgroundColor="transparent" translucent />
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
