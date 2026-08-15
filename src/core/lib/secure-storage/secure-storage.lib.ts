import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

import type { StateStorage } from '@/core/lib/zustand';

// `expo-secure-store` registers no native module on web, so calling it there throws rather than
// failing softly. Every method short-circuits on web instead: the store still constructs, it just
// keeps nothing, which is why `pnpm web` keeps working and why a token never reaches disk there.
export const secureStorage: StateStorage = {
  getItem: (name) => {
    if (Platform.OS === 'web') {
      return Promise.resolve(null);
    }

    return SecureStore.getItemAsync(name);
  },
  setItem: (name, value) => {
    if (Platform.OS === 'web') {
      return Promise.resolve();
    }

    return SecureStore.setItemAsync(name, value);
  },
  removeItem: (name) => {
    if (Platform.OS === 'web') {
      return Promise.resolve();
    }

    return SecureStore.deleteItemAsync(name);
  },
};
