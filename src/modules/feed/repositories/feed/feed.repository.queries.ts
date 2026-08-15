import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { feedQueryOptions } from './feed.query-options';
import type { FeedQueriesRepository } from './feed.repository.types';

export const feedRepositoryQueries: FeedQueriesRepository = {
  useFeedPosts: (filters = {}, dataSource = 'http', options) => {
    return useInfiniteQuery({
      ...feedQueryOptions.posts(filters, dataSource),
      ...options,
    });
  },

  useFeedPost: (id, dataSource = 'http', options) => {
    return useQuery({
      ...feedQueryOptions.post(id, dataSource),
      ...options,
    });
  },

  useFeedComments: (postId, dataSource = 'http', options) => {
    return useQuery({
      ...feedQueryOptions.comments(postId, dataSource),
      ...options,
    });
  },
};
