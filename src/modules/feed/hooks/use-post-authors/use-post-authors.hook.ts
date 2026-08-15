import { useMemo } from 'react';

import { userRepository } from '@/shared/user';

/**
 * The demo API returns posts without any author data, so the author name is
 * joined client-side from the users list. A production API should embed the
 * author in the post payload instead: this join only stays cheap because the
 * dataset is a fixed set of 10 users fetched in a single request.
 *
 * The query is never awaited by its callers — posts render straight away and
 * names fill in when they arrive, so a failed users request costs the author
 * line rather than the feed.
 */
export const usePostAuthors = () => {
  const { data: users } = userRepository.queries.useUsers();

  return useMemo(() => new Map(users?.map(({ id, name }) => [id, name])), [users]);
};
