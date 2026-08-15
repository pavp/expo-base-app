import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFonts } from 'expo-font';

import { useInitLanguage } from '../use-init-language/use-init-language.hook';
import { useInitTheme } from '../use-init-theme/use-init-theme.hook';

export const useInitApp = () => {
  const [prepareIsready, setPrepareIsready] = useState(false);
  const [loaded] = useFonts({
    SpaceMono: require('../../../../../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const { themeIsReady } = useInitTheme();
  const { languageIsReady } = useInitLanguage();

  const appIsReady = useMemo(
    () => loaded && themeIsReady && languageIsReady && prepareIsready,
    [languageIsReady, loaded, prepareIsready, themeIsReady],
  );

  const prepare = useCallback(async () => {
    try {
      // Make any API calls you need to do here

      // Artificially delay for half seconds to simulate a slow loading
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (e) {
      console.warn(e);
    } finally {
      // Tell the application to render
      setPrepareIsready(true);
    }
  }, []);

  useEffect(() => {
    prepare();
  }, [prepare]);

  return { appIsReady };
};
