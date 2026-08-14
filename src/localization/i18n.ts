import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import i18n from 'i18next';

import { config } from '@/config';

import { en_US, es_ES } from './locales';

const resources = {
  en: en_US,
  es: es_ES,
};

export const supportedLanguages = ['en', 'es'] as const;

export type SupportedLanguage = (typeof supportedLanguages)[number];

const isSupported = (value: string | null | undefined): value is SupportedLanguage =>
  supportedLanguages.includes(value as SupportedLanguage);

// Fall back to the device locale, then to the configured default. A stored
// preference is applied later by `useInitLanguage`, so it is not read here.
const deviceLocale = getLocales()[0]?.languageCode;

// i18n.use is the singleton's own method, not the named export.
// eslint-disable-next-line import/no-named-as-default-member
i18n.use(initReactI18next).init({
  resources,
  lng: isSupported(deviceLocale) ? deviceLocale : config.translation.defaultLocale,
  interpolation: {
    escapeValue: false, // React already escapes values
  },
});

export default i18n;
