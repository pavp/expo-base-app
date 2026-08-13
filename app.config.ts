import { ConfigContext, ExpoConfig } from 'expo/config';

import 'ts-node/register'; // Add this to import TypeScript files

export default ({ config }: ConfigContext): ExpoConfig => ({
  name: 'expo-base-app',
  slug: 'expo-base-app',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'com.rn-app.yourapp',
  userInterfaceStyle: 'automatic',
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.app.rnapp',
  },
  android: {
    package: 'com.app.rnapp',
    adaptiveIcon: {
      foregroundImage: './assets/images/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
  },
  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-localization',
    'expo-font',
    'expo-router',
    [
      'expo-splash-screen',
      {
        image: './assets/images/splash.png',
        resizeMode: 'contain',
        backgroundColor: '#ffffff',
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    router: {
      origin: false,
    },
    eas: {
      projectId: 'ec97c2d6-9dcc-4855-a759-285f63a25425',
    },
  },
});
