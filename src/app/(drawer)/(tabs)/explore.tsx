import { ErrorFallback } from '@/components';
import { ExploreView } from '@/modules/feed';

export { ErrorFallback as ErrorBoundary };

export default function ExploreScreen() {
  return <ExploreView />;
}
