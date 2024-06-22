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
  plugins: ['expo-localization'],
};

export default config;
