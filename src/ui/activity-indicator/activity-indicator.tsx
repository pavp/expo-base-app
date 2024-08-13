import { ActivityIndicator as Spinner, ActivityIndicatorProps } from 'react-native';
import { useStyles } from 'react-native-unistyles';

export const ActivityIndicator = (props: Omit<ActivityIndicatorProps, 'color'>) => {
  const { theme } = useStyles();

  return <Spinner {...props} color={theme.colors.primary} />;
};
