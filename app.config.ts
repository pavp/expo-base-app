import { ConfigContext, ExpoConfig } from 'expo/config';

import 'ts-node/register'; // Add this to import TypeScript files

export default ({ config }: ConfigContext): ExpoConfig => ({
  name: 'expo-base-app',
  slug: 'expo-base-app',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'expobaseapp',
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
    // App-wide: this API has no per-key granularity, so theme and language stop syncing too.
    allowBackup: false,
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
    'expo-secure-store',
    [
      'expo-splash-screen',
      {
        image: './assets/images/splash.png',
        resizeMode: 'contain',
        backgroundColor: '#ffffff',
      },
    ],
    './plugins/with-local-gradle-tuning',
    './plugins/with-ios-file-protection',
  ],
  experiments: {
    typedRoutes: true,
    // Babel ordering is handled by `babel-preset-expo` from SDK 54 on, so the compiler needs no
    // entry in babel.config.js — and none that would clash with the unistyles plugin, which has to
    // process its variants first.
    reactCompiler: true,
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
