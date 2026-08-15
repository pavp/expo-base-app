import { ErrorFallback } from '@/components';
import { HomeView } from '@/modules/feed';

export { ErrorFallback as ErrorBoundary };

export default function HomeScreen() {
  return <HomeView />;
}
