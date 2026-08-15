import { StyleSheet } from 'react-native-unistyles';

export const styles = StyleSheet.create((theme) => ({
  container: (isSelected: boolean) => ({
    alignItems: 'center',
    backgroundColor: isSelected ? theme.colors.surfaceSelected : 'transparent',
    borderRadius: theme.radius.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: theme.padding.xl,
    paddingVertical: theme.padding.xl,
  }),
  label: (isSelected: boolean) => ({
    color: isSelected ? theme.colors.primary : theme.colors.typography,
    fontSize: theme.fontSize.md,
  }),
}));
