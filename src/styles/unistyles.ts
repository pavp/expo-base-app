import { StyleSheet } from 'react-native-unistyles';

import { breakpoints } from './breakpoints';
import { darkTheme, lightTheme } from './themes';

type AppBreakpoints = typeof breakpoints;
type AppThemes = {
  light: typeof lightTheme;
  dark: typeof darkTheme;
};

// The empty bodies are the point: declaration merging teaches unistyles this
// project's breakpoint and theme types. Adding members would break the types.
/* eslint-disable @typescript-eslint/no-empty-object-type */
declare module 'react-native-unistyles' {
  export interface UnistylesBreakpoints extends AppBreakpoints {}
  export interface UnistylesThemes extends AppThemes {}
}
/* eslint-enable @typescript-eslint/no-empty-object-type */

StyleSheet.configure({
  settings: {
    initialTheme: 'light',
  },
  breakpoints,
  themes: {
    light: lightTheme,
    dark: darkTheme,
  },
});
