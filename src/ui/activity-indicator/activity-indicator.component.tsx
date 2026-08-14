import { ActivityIndicator as Spinner, ActivityIndicatorProps } from 'react-native';
import { useUnistyles } from 'react-native-unistyles';

export const ActivityIndicator = (props: Omit<ActivityIndicatorProps, 'color'>) => {
  const { theme } = useUnistyles();

  return <Spinner {...props} color={theme.colors.primary} />;
};
