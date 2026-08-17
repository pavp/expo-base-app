import React from 'react';

import { mockPost } from '@/test/entities';
import { renderWithProviders, screen } from '@/test/test-utils';

import { HomeView } from './home-view.view';
import { useHomeBusiness } from './hooks';

jest.mock('./hooks');

describe('HomeView', () => {
  const onEndReached = jest.fn();
  const refetch = jest.fn();

  it('should render correctly', async () => {
    (useHomeBusiness as jest.Mock).mockReturnValue({
      postsData: [mockPost],
      authorsById: new Map(),
      isLoading: false,
      isError: false,
      isFetchingNextPage: false,
      isRefetching: false,
      onEndReached,
      refetch,
    });

    await renderWithProviders(<HomeView />);

    expect(screen.getByTestId('home-container')).toBeTruthy();
  });

  it('should report a failed posts request', async () => {
    (useHomeBusiness as jest.Mock).mockReturnValue({
      postsData: [],
      authorsById: new Map(),
      isLoading: false,
      isError: true,
      isFetchingNextPage: false,
      isRefetching: false,
      onEndReached,
      refetch,
    });

    await renderWithProviders(<HomeView />);

    expect(await screen.findByTestId('home-error')).toBeTruthy();
  });

  it('should report when there are no posts', async () => {
    (useHomeBusiness as jest.Mock).mockReturnValue({
      postsData: [],
      authorsById: new Map(),
      isLoading: false,
      isError: false,
      isFetchingNextPage: false,
      isRefetching: false,
      onEndReached,
      refetch,
    });

    await renderWithProviders(<HomeView />);

    expect(await screen.findByTestId('home-empty')).toBeTruthy();
  });

  it('should not show the empty state while the posts are loading', async () => {
    (useHomeBusiness as jest.Mock).mockReturnValue({
      postsData: [],
      authorsById: new Map(),
      isLoading: true,
      isError: false,
      isFetchingNextPage: false,
      isRefetching: false,
      onEndReached,
      refetch,
    });

    await renderWithProviders(<HomeView />);

    expect(screen.queryByTestId('home-empty')).toBeNull();
    expect(screen.queryByTestId('home-error')).toBeNull();
    expect(screen.getByTestId('indicator')).toBeTruthy();
  });

  it('should render the posts once they load', async () => {
    (useHomeBusiness as jest.Mock).mockReturnValue({
      postsData: [mockPost, mockPost, mockPost],
      authorsById: new Map(),
      isLoading: false,
      isError: false,
      isFetchingNextPage: false,
      isRefetching: false,
      onEndReached,
      refetch,
    });

    await renderWithProviders(<HomeView />);

    expect(await screen.findByTestId('data-list')).toBeTruthy();
    expect(screen.queryByTestId('home-empty')).toBeNull();
  });
});
