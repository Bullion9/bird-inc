// Global Design Tokens for Bird Chat App
export const tokens = {
  // Colors
  colors: {
    bg: '#000000',
    surface1: '#121212',
    surface2: '#1E1E1E',
    surface3: '#252525',
    primary: '#BB86FC',
    primaryVariant: '#3700B3',
    secondary: '#03DAC6',
    success: '#4CAF50',
    error: '#CF6679',
    onSurface: '#FFFFFF',
    onSurface60: 'rgba(255,255,255,0.60)',
    onSurface38: 'rgba(255,255,255,0.38)',
  },

  // Elevation (shadows become overlay opacity on dark)
  elevation: {
    card: 4,
    fab: 12,
  },

  // Typography
  typography: {
    fontFamily: 'System',
    h1: {
      fontSize: 24,
      lineHeight: 30,
      fontWeight: '400' as const,
      fontFamily: 'System',
    },
    h2: {
      fontSize: 18,
      lineHeight: 24,
      fontWeight: '400' as const,
      fontFamily: 'System',
    },
    body: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '400' as const,
      fontFamily: 'System',
    },
    caption: {
      fontSize: 11,
      lineHeight: 16,
      fontWeight: '400' as const,
      fontFamily: 'System',
    },
  },

  // Motion/Animation
  motion: {
    enter: 250, // ms
    exit: 200, // ms
    bounce: {
      tension: 400,
      friction: 80,
    },
  },

  // Border Radius
  radius: {
    s: 12,
    m: 16,
    l: 24,
    xl: 32,
  },

  // Spacing
  spacing: {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 48,
  },
} as const;

export type TokensType = typeof tokens;
