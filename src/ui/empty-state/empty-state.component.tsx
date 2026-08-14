import { Text, View } from 'react-native';
import { useUnistyles } from 'react-native-unistyles';
import { MaterialIcons } from '@expo/vector-icons';

import { styles } from './styles';

interface EmptyStateProps {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  description?: string;
  testID?: string;
}

export const EmptyState = ({ icon, title, description, testID }: EmptyStateProps) => {
  const { theme } = useUnistyles();

  return (
    <View style={styles.container} testID={testID}>
      <MaterialIcons name={icon} size={48} color={theme.colors.typographyMuted} />
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
    </View>
  );
};
