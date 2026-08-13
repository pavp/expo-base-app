export const commonTheme = {
  margins: {
    sm: 2,
    md: 4,
    lg: 8,
    xl: 12,
    xxl: 16,
    xxxl: 32,
  },
  radius: {
    sm: 2,
    md: 4,
    lg: 8,
  },
  borderWidth: {
    sm: 1,
    md: 2,
    lg: 4,
  },
  padding: {
    sm: 2,
    md: 4,
    lg: 8,
    xl: 12,
    xxl: 16,
    xxxl: 32,
  },
  fontSize: {
    sm: 8,
    md: 16,
    lg: 24,
  },
} as const;

export const lightTheme = {
  colors: {
    primary: '#6F53DE',
    typography: '#0c0b10',
    background: '#f4f4f7',
    secondary: '#c9c7cc',
    highlight: '#000000',
    surfaceSelected: '#e8e3fa',
    white: '#ffffff',
    black: '#000000',
  },
  ...commonTheme,
} as const;

export const darkTheme = {
  colors: {
    primary: '#6F53DE',
    typography: '#e0e0e0',
    background: '#0c0b10',
    secondary: '#605f69',
    highlight: '#ffffff',
    surfaceSelected: '#2a2340',
    white: '#ffffff',
    black: '#000000',
  },
  ...commonTheme,
} as const;

// define other themes
