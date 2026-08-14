import { SafeAreaView as SafeAreaContextView } from 'react-native-safe-area-context';
import { withUnistyles } from 'react-native-unistyles';

/**
 * Unistyles rewrites whitelisted components so they repaint when the theme
 * changes, but it matches on the import coming from `react-native` itself.
 * `SafeAreaView` ships from `react-native-safe-area-context` as its own native
 * view, so it never gets that treatment and keeps the style it resolved on
 * mount — a screen whose background comes from the safe area stays on the
 * previous theme until it remounts.
 *
 * `withUnistyles` is the factory the library prescribes for this case. Import
 * `SafeAreaView` from here rather than from the package directly.
 */
export const SafeAreaView = withUnistyles(SafeAreaContextView);
