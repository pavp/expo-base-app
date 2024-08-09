import { ExpoConfig } from 'expo/config';

import 'ts-node/register'; // Add this to import TypeScript files

const config: ExpoConfig = {
  name: 'rn-app',
  slug: 'rn-app',
  android: {
    package: 'com.app.rnapp',
  },
  ios: {
    bundleIdentifier: 'com.app.rnapp',
  },
  extra: {
    eas: {
      projectId: '206b6326-1f7e-4025-954e-5de8a8a19cfd',
    },
  },
  plugins: ['expo-localization', 'expo-font', 'expo-router'],
};

export default config;
