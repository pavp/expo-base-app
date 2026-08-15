import { Pressable, Text, View } from 'react-native';
import { useUnistyles } from 'react-native-unistyles';

import { MaterialIcon } from '@/ui';

import { styles } from './styles';

interface SettingsOptionProps {
  label: string;
  isSelected: boolean;
  onPress: () => void;
  testID?: string;
}

export const SettingsOption = ({ label, isSelected, onPress, testID }: SettingsOptionProps) => {
  const { theme } = useUnistyles();

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected: isSelected }}
      onPress={onPress}
      testID={testID}
    >
      <View style={styles.container(isSelected)}>
        <Text style={styles.label(isSelected)}>{label}</Text>
        {isSelected ? <MaterialIcon name="check" color={theme.colors.primary} onPress={onPress} /> : null}
      </View>
    </Pressable>
  );
};
