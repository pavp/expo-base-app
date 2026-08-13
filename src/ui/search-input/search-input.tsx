import { TextInput, View } from 'react-native';
import { useUnistyles } from 'react-native-unistyles';

import { MaterialIcon } from '@/ui';

import { styles } from './styles';

interface SearchInputProps {
  value: string;
  placeholder: string;
  onChangeText: (value: string) => void;
  clearAccessibilityLabel: string;
  testID?: string;
}

export const SearchInput = ({
  value,
  placeholder,
  onChangeText,
  clearAccessibilityLabel,
  testID,
}: SearchInputProps) => {
  const { theme } = useUnistyles();

  return (
    <View style={styles.container}>
      <MaterialIcon name="search" color={theme.colors.secondary} onPress={() => {}} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.secondary}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        testID={testID}
      />
      {value.length > 0 ? (
        <MaterialIcon
          name="close"
          color={theme.colors.secondary}
          onPress={() => onChangeText('')}
          accessibilityLabel={clearAccessibilityLabel}
        />
      ) : null}
    </View>
  );
};
