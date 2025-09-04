import { MD3DarkTheme } from 'react-native-paper';
import { tokens } from './tokens';

export const birdTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: tokens.colors.primary,
    primaryContainer: tokens.colors.primaryVariant,
    secondary: tokens.colors.secondary,
    background: tokens.colors.bg,
    surface: tokens.colors.surface1,
    surfaceVariant: tokens.colors.surface2,
    onSurface: tokens.colors.onSurface,
    onSurfaceVariant: tokens.colors.onSurface60,
    error: tokens.colors.error,
    elevation: {
      level0: 'transparent',
      level1: tokens.colors.surface1,
      level2: tokens.colors.surface2,
      level3: tokens.colors.surface3,
      level4: tokens.colors.surface3,
      level5: tokens.colors.surface3,
    },
  },
  roundness: tokens.radius.m,
};
