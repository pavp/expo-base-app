import { useTranslation } from 'react-i18next';
import { UnistylesRuntime, useUnistyles } from 'react-native-unistyles';
import { Tabs } from 'expo-router';

import { TabBarIcon } from '@/components';

export default function TabLayout() {
  const { t } = useTranslation();
  // See the note in src/app/_layout.tsx: read the palette from the runtime so
  // tab bar options never render with a stale theme.
  const { rt } = useUnistyles();
  const theme = UnistylesRuntime.getTheme(rt.themeName);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.typography,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.background,
          borderTopWidth: 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('screens.home'),
          tabBarIcon: ({ color, focused }) => <TabBarIcon name={focused ? 'home' : 'home-outline'} color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: t('screens.explore'),
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'code-slash' : 'code-slash-outline'} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
