import { View } from 'react-native';
import { useUnistyles } from 'react-native-unistyles';
import { router, usePathname } from 'expo-router';
import { DrawerContentComponentProps, DrawerContentScrollView, DrawerItem } from 'expo-router/drawer';

import { TabBarIcon } from '../tab-bar-icon/tab-bar-icon';

import { styles } from './styles';

export const CustomDrawerContent = (props: DrawerContentComponentProps) => {
  const pathname = usePathname();
  const { theme } = useUnistyles();

  return (
    <DrawerContentScrollView {...props} style={styles.container} contentContainerStyle={styles.contentContainer}>
      <>
        <DrawerItem
          label="Home"
          activeTintColor="red"
          labelStyle={styles.drawerItemLabel(pathname === '/')}
          style={styles.drawerItemContainer(pathname === '/')}
          icon={({ size }) => (
            <TabBarIcon
              name={'home'}
              color={pathname === '/' ? theme.colors.primary : theme.colors.typography}
              size={size}
            />
          )}
          onPress={() => router.push('/(drawer)/(tabs)/')}
        />
        <DrawerItem
          label="Explore"
          labelStyle={styles.drawerItemLabel(pathname === '/explore')}
          style={styles.drawerItemContainer(pathname === '/explore')}
          icon={({ size }) => (
            <TabBarIcon
              name={'code-slash'}
              color={pathname === '/explore' ? theme.colors.primary : theme.colors.typography}
              size={size}
            />
          )}
          onPress={() => router.push('/(drawer)/(tabs)/explore')}
        />
      </>

      <View style={styles.bottomContainer}>
        <DrawerItem
          label="Settings"
          labelStyle={styles.drawerItemLabel(pathname === '/settings')}
          style={styles.drawerItemContainer(pathname === '/settings')}
          icon={({ size }) => (
            <TabBarIcon
              name={'settings'}
              color={pathname === '/settings' ? theme.colors.primary : theme.colors.typography}
              size={size}
            />
          )}
          onPress={() => {
            router.push('/settings');
            props.navigation.closeDrawer();
          }}
        />
      </View>
    </DrawerContentScrollView>
  );
};
