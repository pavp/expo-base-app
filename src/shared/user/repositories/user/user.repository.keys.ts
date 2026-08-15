/**
 * No `dataSource` segment here, unlike `feedQueryKeys`: user data comes from one source, so there
 * is nothing to disambiguate. Adding a second source would mean adding that segment back.
 */
export const userQueryKeys = {
  all: ['user'] as const,
  lists: () => [...userQueryKeys.all, 'list'] as const,
  list: () => [...userQueryKeys.lists()] as const,
  details: () => [...userQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...userQueryKeys.details(), id] as const,
} as const;
