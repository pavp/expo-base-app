import { ErrorFallback } from '@/components';
import { PostDetailView } from '@/modules/feed';

export { ErrorFallback as ErrorBoundary };

export default function PostScreen() {
  return <PostDetailView />;
}
