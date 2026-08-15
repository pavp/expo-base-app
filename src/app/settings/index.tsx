import { ErrorFallback } from '@/components';
import { SettingsView } from '@/modules/settings';

export { ErrorFallback as ErrorBoundary };

export default function Page() {
  return <SettingsView />;
}
