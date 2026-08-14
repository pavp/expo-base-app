const env = process.env.NODE_ENV ?? 'development';

export const config = {
  env,
  isDev: env === 'development',
  isTst: env === 'test',
  isPrd: env === 'production',
  apiURL: process.env.EXPO_PUBLIC_API_URL,
  translation: {
    defaultLocale: 'en',
  },
};
