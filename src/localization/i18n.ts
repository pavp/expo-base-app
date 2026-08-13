import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import i18n from 'i18next';

import { config } from '@/config';

import { en_US, es_ES } from './locales';

const resources = {
  en: en_US,
  es: es_ES,
};

const locale = getLocales()[0].languageCode;

i18n.use(initReactI18next).init({
  resources,
  lng: config.translation.defaultLocale, // Default language
  interpolation: {
    escapeValue: false, // React already escapes values
  },
});

i18n.changeLanguage(locale);

export default i18n;
