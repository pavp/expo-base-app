import { StyleSheet } from 'react-native-unistyles';

export const styles = StyleSheet.create((theme, rt) => ({
  container: {
    backgroundColor: theme.colors.background,
    flex: 1,
  },
  content: {
    paddingBottom: rt.insets.bottom + theme.padding.xxl,
    paddingHorizontal: theme.padding.xxl,
    paddingTop: theme.padding.xxl,
  },
  section: {
    marginBottom: theme.margins.xxxl,
  },
  sectionTitle: {
    color: theme.colors.typographyMuted,
    fontSize: theme.fontSize.md,
    fontWeight: 'bold',
    marginBottom: theme.margins.lg,
    textTransform: 'uppercase',
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: theme.padding.xl,
    paddingVertical: theme.padding.xl,
  },
  rowLabel: {
    color: theme.colors.typography,
    fontSize: theme.fontSize.md,
  },
  rowValue: {
    color: theme.colors.typographyMuted,
    fontSize: theme.fontSize.md,
  },
}));
