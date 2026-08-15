/**
 * No `dataSource` segment here — unlike `feedQueryKeys` — because `src/shared/user/` has one data
 * source (design decision D1). A second source would need the same segment `feedQueryKeys` carries.
 */
export const userQueryKeys = {
  all: ['user'] as const,
  lists: () => [...userQueryKeys.all, 'list'] as const,
  list: () => [...userQueryKeys.lists()] as const,
  details: () => [...userQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...userQueryKeys.details(), id] as const,
} as const;
