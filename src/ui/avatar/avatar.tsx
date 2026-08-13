import { View } from 'react-native';
import { useUnistyles } from 'react-native-unistyles';

import { MaterialIcon } from '../material-icon/material-icon';

import { AVATAR_ICON_SIZE, styles } from './styles';

interface AvatarProps {
  testID?: string;
}

export const Avatar = ({ testID }: AvatarProps) => {
  const { theme } = useUnistyles();

  return (
    <View style={styles.container} testID={testID}>
      <MaterialIcon name="person" color={theme.colors.primary} size={AVATAR_ICON_SIZE} />
    </View>
  );
};
