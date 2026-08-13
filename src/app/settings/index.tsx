import { useTranslation } from 'react-i18next';
import { ScrollView, Text, View } from 'react-native';
import { UnistylesRuntime, useUnistyles } from 'react-native-unistyles';
import Constants from 'expo-constants';

import { SettingsOption } from '@/components';
import { setItem } from '@/lib/async-storage';
import i18n, { SupportedLanguage } from '@/localization/i18n';

import { styles } from './styles';

export default function Page() {
  // `i18n` from the hook re-renders on language change; the imported singleton does not.
  const { t, i18n: i18nInstance } = useTranslation();
  const { rt } = useUnistyles();

  const changeTheme = async (theme: 'light' | 'dark') => {
    UnistylesRuntime.setTheme(theme);
    UnistylesRuntime.setAdaptiveThemes(false);
    await setItem('theme', theme);
  };

  const changeLanguage = async (language: SupportedLanguage) => {
    await i18n.changeLanguage(language);
    await setItem('language', language);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.appearance')}</Text>
        <SettingsOption
          label={t('settings.themeLight')}
          isSelected={rt.themeName === 'light'}
          onPress={() => changeTheme('light')}
          testID="settings-theme-light"
        />
        <SettingsOption
          label={t('settings.themeDark')}
          isSelected={rt.themeName === 'dark'}
          onPress={() => changeTheme('dark')}
          testID="settings-theme-dark"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.language')}</Text>
        <SettingsOption
          label={t('settings.languageEnglish')}
          isSelected={i18nInstance.language === 'en'}
          onPress={() => changeLanguage('en')}
          testID="settings-language-en"
        />
        <SettingsOption
          label={t('settings.languageSpanish')}
          isSelected={i18nInstance.language === 'es'}
          onPress={() => changeLanguage('es')}
          testID="settings-language-es"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.about')}</Text>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>{t('settings.version')}</Text>
          <Text style={styles.rowValue}>{Constants.expoConfig?.version ?? '—'}</Text>
        </View>
      </View>
    </ScrollView>
  );
}
