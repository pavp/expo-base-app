import { useTranslation } from 'react-i18next';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { UnistylesRuntime, useUnistyles } from 'react-native-unistyles';
import { Drawer, DrawerToggleButton } from 'expo-router/drawer';

import { ThemeButton } from '@/components';
import { CustomDrawerContent } from '@/components/navigation/custom-drawer-content/custom-drawer-content';

export default function Layout() {
  const { t } = useTranslation();
  // See the note in src/app/_layout.tsx: read the palette from the runtime so
  // header options never render with a stale theme.
  const { rt } = useUnistyles();
  const theme = UnistylesRuntime.getTheme(rt.themeName);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          title: t('screens.posts'),
          headerLeft: () => <DrawerToggleButton tintColor={theme.colors.primary} />,
          headerRight: () => <ThemeButton />,
          headerRightContainerStyle: { paddingRight: theme.margins.xxl },
          headerStyle: {
            backgroundColor: theme.colors.background,
            borderBottomWidth: 0,
          },
          headerShadowVisible: false,
          headerTitleStyle: {
            color: theme.colors.primary,
          },
          headerTitleAlign: 'center',
        }}
      />
    </GestureHandlerRootView>
  );
}
