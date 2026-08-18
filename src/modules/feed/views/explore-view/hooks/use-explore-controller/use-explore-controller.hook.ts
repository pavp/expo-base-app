import { useState } from 'react';

import { useDebouncedValue } from '@/core/hooks';

/**
 * UI controller hook specific to `ExploreView`. Owns the search term and
 * author-filter state, and derives the debounced term and whether any
 * filter is currently active. Carries no data access of its own.
 */
export const useExploreController = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [authorId, setAuthorId] = useState<number | null>(null);
  const debouncedSearchTerm = useDebouncedValue(searchTerm.trim());

  const hasFilter = debouncedSearchTerm.length > 0 || authorId !== null;

  return {
    searchTerm,
    setSearchTerm,
    authorId,
    setAuthorId,
    debouncedSearchTerm,
    hasFilter,
  };
};
