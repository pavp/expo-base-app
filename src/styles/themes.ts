export const commonTheme = {
  margins: {
    sm: 2,
    md: 4,
    lg: 8,
    xl: 12,
    xxl: 16,
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
  },
  fontSize: {
    sm: 8,
    md: 16,
    lg: 24,
  },
} as const;

export const lightTheme = {
  colors: {
    typography: '#000000',
    background: '#ffffff',
    blue: 'lightblue',
    white: '#ffffff',
    lightGray: 'lightgray',
    darkGray: '#191b1e',
  },
  ...commonTheme,
} as const;

export const darkTheme = {
  colors: {
    typography: '#ffffff',
    background: '#000000',
    blue: 'lightblue',
    white: '#ffffff',
    lightGray: 'lightgray',
    darkGray: '#191b1e',
  },
  ...commonTheme,
} as const;

// define other themes
