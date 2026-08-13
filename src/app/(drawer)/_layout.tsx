import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useUnistyles } from 'react-native-unistyles';
import { Drawer, DrawerToggleButton } from 'expo-router/drawer';

import { CustomDrawerContent, ThemeButton } from '@/components';

export default function Layout() {
  const { theme } = useUnistyles();

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
