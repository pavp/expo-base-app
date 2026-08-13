import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { UnistylesRuntime, useUnistyles } from 'react-native-unistyles';
import { Drawer, DrawerToggleButton } from 'expo-router/drawer';

import { CustomDrawerContent, ThemeButton } from '@/components';

export default function Layout() {
  // See the note in src/app/_layout.tsx: read the palette from the runtime so
  // header options never render with a stale theme.
  const { rt } = useUnistyles();
  const theme = UnistylesRuntime.getTheme(rt.themeName);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          title: 'Placeholders',
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
