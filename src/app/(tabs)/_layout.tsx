import { UnistylesRuntime, useStyles } from 'react-native-unistyles';
import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { TabBarIcon } from '@/components';

const themeStyle = UnistylesRuntime.themeName === 'light' ? 'dark' : 'light';

export default function TabLayout() {
  const { theme } = useStyles();

  return (
    <>
      <StatusBar style={themeStyle} />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: theme.colors.blue,
          headerShown: false,
          tabBarStyle: {
            backgroundColor: theme.colors.darkGray,
            borderTopColor: theme.colors.darkGray,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, focused }) => <TabBarIcon name={focused ? 'home' : 'home-outline'} color={color} />,
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: 'Explore',
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon name={focused ? 'code-slash' : 'code-slash-outline'} color={color} />
            ),
          }}
        />
      </Tabs>
    </>
  );
}
