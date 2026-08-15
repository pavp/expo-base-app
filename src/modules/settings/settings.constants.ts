// Raw values are unchanged from the previous hand-rolled call sites, so
// existing installs keep their stored preference across this move.
export const SETTINGS_STORAGE_KEY = {
  THEME: 'theme',
  LANGUAGE: 'language',
} as const;
