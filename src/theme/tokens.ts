// Global Design Tokens for Bird Chat App - iOS Design System
export const tokens = {
  // Colors - iOS Dark Mode Color Palette
  colors: {
    bg: '#000000', // iOS pure black background
    surface1: 'rgba(28, 28, 30, 0.68)', // iOS card background
    surface2: 'rgba(44, 44, 46, 0.68)', // iOS secondary surfaces
    surface3: 'rgba(58, 58, 60, 0.68)', // iOS tertiary surfaces
    primary: '#007AFF', // iOS blue
    primaryVariant: '#0056CC', // iOS darker blue
    secondary: '#30D158', // iOS green
    success: '#30D158', // iOS green
    error: '#FF453A', // iOS red
    warning: '#FF9F0A', // iOS orange
    onSurface: '#FFFFFF', // iOS primary text
    onSurface60: 'rgba(255,255,255,0.60)', // iOS secondary text
    onSurface38: 'rgba(142, 142, 147, 1)', // iOS tertiary text (iOS gray)
    separator: 'rgba(84, 84, 88, 0.65)', // iOS separator color
    groupedBackground: '#000000', // iOS grouped table background
    cardBackground: 'rgba(28, 28, 30, 0.68)', // iOS card background
  },

  // Typography - iOS Text Styles
  typography: {
    fontFamily: 'System', // iOS system font
    // iOS Large Title
    largeTitle: {
      fontSize: 34,
      lineHeight: 41,
      fontWeight: '700' as const,
      fontFamily: 'System',
    },
    // iOS Title 1
    h1: {
      fontSize: 28,
      lineHeight: 34,
      fontWeight: '700' as const,
      fontFamily: 'System',
    },
    // iOS Title 2
    h2: {
      fontSize: 22,
      lineHeight: 28,
      fontWeight: '700' as const,
      fontFamily: 'System',
    },
    // iOS Title 3
    h3: {
      fontSize: 20,
      lineHeight: 24,
      fontWeight: '600' as const,
      fontFamily: 'System',
    },
    // iOS Headline
    headline: {
      fontSize: 17,
      lineHeight: 22,
      fontWeight: '600' as const,
      fontFamily: 'System',
    },
    // iOS Body
    body: {
      fontSize: 17,
      lineHeight: 22,
      fontWeight: '400' as const,
      fontFamily: 'System',
    },
    // iOS Callout
    callout: {
      fontSize: 16,
      lineHeight: 21,
      fontWeight: '400' as const,
      fontFamily: 'System',
    },
    // iOS Subhead
    subhead: {
      fontSize: 15,
      lineHeight: 20,
      fontWeight: '400' as const,
      fontFamily: 'System',
    },
    // iOS Footnote
    footnote: {
      fontSize: 13,
      lineHeight: 18,
      fontWeight: '400' as const,
      fontFamily: 'System',
    },
    // iOS Caption 1
    caption: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '400' as const,
      fontFamily: 'System',
    },
    // iOS Caption 2
    caption2: {
      fontSize: 11,
      lineHeight: 13,
      fontWeight: '400' as const,
      fontFamily: 'System',
    },
  },

  // Spacing - iOS 8pt Grid System
  spacing: {
    xs: 4,   // 0.5 * 8pt
    s: 8,    // 1 * 8pt
    m: 16,   // 2 * 8pt (standard iOS spacing)
    l: 24,   // 3 * 8pt
    xl: 32,  // 4 * 8pt
    xxl: 48, // 6 * 8pt
  },

  // Border Radius - iOS Corner Radius Standards
  radius: {
    xs: 4,   // Small elements
    s: 8,    // Buttons, small cards
    m: 10,   // iOS standard corner radius
    l: 12,   // Larger cards
    xl: 16,  // Large components
    round: 50, // Circular elements
  },

  // Elevation/Shadows - iOS Drop Shadow Standards
  elevation: {
    none: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.18,
      shadowRadius: 1,
      elevation: 1,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 4,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    // Legacy support for simple elevation values
    card: 4,
    fab: 12,
  },

  // Motion/Animation - iOS Animation Curves
  motion: {
    enter: 250, // ms - iOS standard
    exit: 200, // ms - iOS standard
    bounce: {
      tension: 400,
      friction: 80,
    },
    // iOS Animation Curves
    easeInOut: 'ease-in-out',
    spring: {
      damping: 0.8,
      stiffness: 100,
    },
  },
} as const;

export type TokensType = typeof tokens;
