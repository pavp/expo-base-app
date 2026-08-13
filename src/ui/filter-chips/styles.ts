import { StyleSheet } from 'react-native-unistyles';

export const styles = StyleSheet.create((theme) => ({
  content: {
    gap: theme.margins.lg,
    paddingHorizontal: theme.padding.xxl,
  },
  chip: (isSelected: boolean) => ({
    backgroundColor: isSelected ? theme.colors.primary : theme.colors.surfaceSelected,
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.padding.xl,
    paddingVertical: theme.padding.lg,
  }),
  label: (isSelected: boolean) => ({
    color: isSelected ? theme.colors.white : theme.colors.typography,
    fontSize: theme.fontSize.md,
  }),
}));
