import { DataSource } from '@/types/gateway.types';

import { asyncStorageGateway } from './async-storage-gateway/async-storage-gateway';
import { httpGateway } from './http-gateway/http-gateway';
import { FeedGateway } from './feed.gateway.types';

/** `DataSource` defaults to `'http'` at every layer — see design decision, no caller must pass it. */
export const createFeedGateway = (source: DataSource = 'http'): FeedGateway => {
  switch (source) {
    case 'asyncStorage':
      return asyncStorageGateway;
    case 'http':
    default:
      return httpGateway;
  }
};
