import React from 'react';

import { mockPost, mockUser } from '@/test/entities';
import { fireEvent, renderWithProviders, screen } from '@/test/test-utils';

import { ExploreView } from './explore-view.view';
import { useExploreBusiness, useExploreController } from './hooks';

jest.mock('./hooks');

describe('ExploreView', () => {
  const setSearchTerm = jest.fn();
  const setAuthorId = jest.fn();
  const refetch = jest.fn();
  const fetchNextPage = jest.fn();

  const baseController = {
    searchTerm: '',
    setSearchTerm,
    authorId: null,
    setAuthorId,
    debouncedSearchTerm: '',
    hasFilter: false,
  };

  const baseBusiness = {
    users: [mockUser],
    authorsById: new Map([[mockUser.id, mockUser.name]]),
    postsData: [],
    isLoading: false,
    isError: false,
    isFetchingNextPage: false,
    isRefetching: false,
    refetch,
    fetchNextPage,
    hasNextPage: false,
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should prompt for a search term before anything is typed', async () => {
    (useExploreController as jest.Mock).mockReturnValue(baseController);
    (useExploreBusiness as jest.Mock).mockReturnValue(baseBusiness);

    await renderWithProviders(<ExploreView />);

    expect(screen.getByTestId('explore-container')).toBeTruthy();
    expect(screen.getByTestId('explore-empty')).toBeTruthy();
  });

  it('should show the results once a search term is entered', async () => {
    (useExploreController as jest.Mock).mockReturnValue({
      ...baseController,
      searchTerm: 'lorem',
      debouncedSearchTerm: 'lorem',
      hasFilter: true,
    });
    (useExploreBusiness as jest.Mock).mockReturnValue({
      ...baseBusiness,
      postsData: [mockPost],
    });

    await renderWithProviders(<ExploreView />);

    expect(await screen.findByTestId('data-list')).toBeTruthy();
    expect(screen.queryByTestId('explore-empty')).toBeNull();
  });

  it('should report when a search returns nothing', async () => {
    (useExploreController as jest.Mock).mockReturnValue({
      ...baseController,
      searchTerm: 'zzz',
      debouncedSearchTerm: 'zzz',
      hasFilter: true,
    });
    (useExploreBusiness as jest.Mock).mockReturnValue(baseBusiness);

    await renderWithProviders(<ExploreView />);

    expect(await screen.findByTestId('explore-no-results')).toBeTruthy();
  });

  it('should report a failed search', async () => {
    (useExploreController as jest.Mock).mockReturnValue({
      ...baseController,
      searchTerm: 'lorem',
      debouncedSearchTerm: 'lorem',
      hasFilter: true,
    });
    (useExploreBusiness as jest.Mock).mockReturnValue({
      ...baseBusiness,
      isError: true,
    });

    await renderWithProviders(<ExploreView />);

    expect(await screen.findByTestId('explore-error')).toBeTruthy();
  });

  it('should offer a chip per author plus an unfiltered option', async () => {
    (useExploreController as jest.Mock).mockReturnValue(baseController);
    (useExploreBusiness as jest.Mock).mockReturnValue(baseBusiness);

    await renderWithProviders(<ExploreView />);

    expect(await screen.findByTestId('explore-author-chips-all')).toBeTruthy();
    expect(screen.getByTestId(`explore-author-chips-${mockUser.id}`)).toBeTruthy();
  });

  it('should call setSearchTerm when the search input changes', async () => {
    (useExploreController as jest.Mock).mockReturnValue(baseController);
    (useExploreBusiness as jest.Mock).mockReturnValue(baseBusiness);

    await renderWithProviders(<ExploreView />);

    fireEvent.changeText(screen.getByTestId('explore-search-input'), 'lorem');

    expect(setSearchTerm).toHaveBeenCalledWith('lorem');
  });

  it('should call setAuthorId when an author chip is pressed', async () => {
    (useExploreController as jest.Mock).mockReturnValue(baseController);
    (useExploreBusiness as jest.Mock).mockReturnValue(baseBusiness);

    await renderWithProviders(<ExploreView />);

    fireEvent.press(await screen.findByTestId(`explore-author-chips-${mockUser.id}`));

    expect(setAuthorId).toHaveBeenCalledWith(mockUser.id);
  });
});
