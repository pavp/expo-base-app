import { StyleSheet } from 'react-native-unistyles';

export const styles = StyleSheet.create((theme) => ({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: theme.borderWidth.sm,
    borderColor: theme.colors.border,
    padding: theme.padding.xxl,
    gap: theme.margins.xl,
    marginBottom: theme.margins.xl,
  },
  title: {
    color: theme.colors.typography,
    fontWeight: '600',
    fontSize: theme.fontSize.md,
  },
  input: {
    backgroundColor: theme.colors.surfaceSelected,
    borderRadius: theme.radius.md,
    color: theme.colors.typography,
    fontSize: theme.fontSize.md,
    paddingHorizontal: theme.padding.xl,
    paddingVertical: theme.padding.lg,
  },
  bodyInput: {
    minHeight: theme.margins.xxxl * 2,
    textAlignVertical: 'top',
  },
  error: {
    color: theme.colors.typographyMuted,
    fontSize: theme.fontSize.sm,
  },
  // Negative margin pulls the message up against the field it belongs to, closing the
  // container's `gap` so it reads as part of that input rather than the next one.
  // Muted rather than a red: the palette carries no error colour, and adding one is a
  // theme-wide decision, not a form-local one.
  fieldError: {
    color: theme.colors.typographyMuted,
    fontSize: theme.fontSize.sm,
    marginTop: -theme.margins.md,
  },
  // Disabled reuses the muted pair rather than an opacity overlay, so the label keeps its
  // contrast against the surface it sits on instead of fading through it.
  submit: (isDisabled: boolean) => ({
    alignItems: 'center' as const,
    backgroundColor: isDisabled ? theme.colors.surfaceSelected : theme.colors.primary,
    borderRadius: theme.radius.lg,
    paddingVertical: theme.padding.xl,
  }),
  submitLabel: (isDisabled: boolean) => ({
    color: isDisabled ? theme.colors.typographyMuted : theme.colors.onPrimary,
    fontSize: theme.fontSize.md,
    fontWeight: '600' as const,
  }),
}));
