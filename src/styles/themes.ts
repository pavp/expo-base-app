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
    xs: 8,
    sm: 12,
    md: 16,
    lg: 24,
  },
} as const;

export const lightTheme = {
  colors: {
    primary: '#6F53DE',
    // Text and icons placed on top of `primary`. Each theme picks whichever
    // end of its own scale clears the contrast bar against its own primary.
    onPrimary: '#ffffff',
    typography: '#0c0b10',
    typographyMuted: '#6b6a73',
    background: '#f4f4f7',
    highlight: '#000000',
    surface: '#ffffff',
    surfaceSelected: '#e8e3fa',
    white: '#ffffff',
    black: '#000000',
  },
  ...commonTheme,
} as const;

export const darkTheme = {
  colors: {
    // Lifted from the light theme's #6F53DE, which only reached 3.4:1 against
    // this background. Same hue, enough lightness to clear AA as body text.
    primary: '#9583EC',
    // Dark's primary is light enough that white on top of it drops to 3.1:1;
    // the page colour reads at 6:1 against it instead.
    onPrimary: '#121118',
    typography: '#e0e0e0',
    typographyMuted: '#9b99a3',
    // Near-black backgrounds make every dark surface above them read flat, and
    // are harsh against light text on OLED. Both steps are lifted, and the gap
    // between them widened from ΔL* 4.4 to 7.1 so cards separate from the page.
    background: '#121118',
    highlight: '#ffffff',
    surface: '#211f2b',
    surfaceSelected: '#2a2340',
    white: '#ffffff',
    black: '#000000',
  },
  ...commonTheme,
} as const;

// define other themes
