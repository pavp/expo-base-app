import { act, renderHookWithProviders, waitFor } from '@/test/test-utils';

import { useExploreController } from './use-explore-controller.hook';

describe('useExploreController', () => {
  it('should start with no search term and no author selected', async () => {
    const { result } = await renderHookWithProviders(() => useExploreController());

    expect(result.current.searchTerm).toBe('');
    expect(result.current.authorId).toBeNull();
    expect(result.current.debouncedSearchTerm).toBe('');
    expect(result.current.hasFilter).toBe(false);
  });

  it('should report a filter once the debounced search term settles', async () => {
    const { result } = await renderHookWithProviders(() => useExploreController());

    await act(async () => result.current.setSearchTerm('lorem'));

    await waitFor(() => expect(result.current.hasFilter).toBe(true));
    expect(result.current.debouncedSearchTerm).toBe('lorem');
  });

  it('should report a filter once an author is selected, with no search term', async () => {
    const { result } = await renderHookWithProviders(() => useExploreController());

    await act(async () => result.current.setAuthorId(1));

    await waitFor(() => expect(result.current.hasFilter).toBe(true));
    expect(result.current.debouncedSearchTerm).toBe('');
  });
});
