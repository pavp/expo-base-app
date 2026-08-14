import { useEffect, useState } from 'react';

import { getItem } from '@/core/lib/async-storage';
import i18n, { SupportedLanguage, supportedLanguages } from '@/localization/i18n';

export const useInitLanguage = () => {
  const [languageIsReady, setLanguageIsReady] = useState(false);

  const loadSelectedLanguage = async () => {
    try {
      const language = (await getItem('language')) as SupportedLanguage | null;

      if (language && supportedLanguages.includes(language)) await i18n.changeLanguage(language);
    } catch (e) {
      console.warn(e);
    } finally {
      setLanguageIsReady(true);
    }
  };

  useEffect(() => {
    loadSelectedLanguage();
  }, []);

  return { languageIsReady };
};
