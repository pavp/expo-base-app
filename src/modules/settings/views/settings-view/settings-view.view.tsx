import React from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, Text, View } from 'react-native';
import { useUnistyles } from 'react-native-unistyles';
import Constants from 'expo-constants';

import { SupportedLanguage } from '@/localization/i18n';

import { SettingsOption } from '../../components';
import { useSettingsBusiness } from '../../hooks';

import { styles } from './styles';

export const SettingsView = () => {
  // `i18n` from the hook re-renders on language change; the imported singleton does not.
  const { t, i18n: i18nInstance } = useTranslation();
  const { rt } = useUnistyles();
  const { setTheme, setLanguage } = useSettingsBusiness();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.appearance')}</Text>
        <SettingsOption
          label={t('settings.themeLight')}
          isSelected={rt.themeName === 'light'}
          onPress={() => setTheme('light')}
          testID="settings-theme-light"
        />
        <SettingsOption
          label={t('settings.themeDark')}
          isSelected={rt.themeName === 'dark'}
          onPress={() => setTheme('dark')}
          testID="settings-theme-dark"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.language')}</Text>
        <SettingsOption
          label={t('settings.languageEnglish')}
          isSelected={i18nInstance.language === 'en'}
          onPress={() => setLanguage('en' as SupportedLanguage)}
          testID="settings-language-en"
        />
        <SettingsOption
          label={t('settings.languageSpanish')}
          isSelected={i18nInstance.language === 'es'}
          onPress={() => setLanguage('es' as SupportedLanguage)}
          testID="settings-language-es"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.about')}</Text>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>{t('settings.version')}</Text>
          <Text style={styles.rowValue} testID="settings-version-value">
            {Constants.expoConfig?.version ?? '—'}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};
