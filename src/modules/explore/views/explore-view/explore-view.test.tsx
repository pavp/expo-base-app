import React from 'react';
import MockAdapter from 'axios-mock-adapter';

import { client, DEFAULT_LIMIT, Post } from '@/api';
import { API_ENDPOINT } from '@/api/endpoints';
import { generateMockPosts } from '@/test/entities';
import { fireEvent, queryClient, renderWithProviders, screen, waitFor } from '@/test/test-utils';

import { ExploreView } from './explore-view';

describe('ExploreView', () => {
  const mock = new MockAdapter(client);

  afterEach(() => {
    queryClient.clear();
    mock.reset();

    jest.clearAllMocks();
  });

  it('should prompt for a search term before anything is typed', async () => {
    await renderWithProviders(<ExploreView />);

    expect(screen.getByTestId('explore-container')).toBeTruthy();
    expect(screen.getByTestId('explore-empty')).toBeTruthy();
  });

  it('should show the results once a search term is entered', async () => {
    const mockPosts: Post[] = generateMockPosts(3);

    mock.onGet(`${API_ENDPOINT.GET_POSTS}?_page=1&_limit=${DEFAULT_LIMIT}&q=lorem`).reply(200, mockPosts);

    await renderWithProviders(<ExploreView />);

    fireEvent.changeText(screen.getByTestId('explore-search-input'), 'lorem');

    await waitFor(() => expect(screen.getByTestId('data-list')).toBeTruthy());
    expect(screen.queryByTestId('explore-empty')).toBeNull();
  });

  it('should report when a search returns nothing', async () => {
    mock.onGet(`${API_ENDPOINT.GET_POSTS}?_page=1&_limit=${DEFAULT_LIMIT}&q=zzz`).reply(200, []);

    await renderWithProviders(<ExploreView />);

    fireEvent.changeText(screen.getByTestId('explore-search-input'), 'zzz');

    await waitFor(() => expect(screen.getByTestId('explore-no-results')).toBeTruthy());
  });

  it('should report a failed search', async () => {
    mock.onGet(`${API_ENDPOINT.GET_POSTS}?_page=1&_limit=${DEFAULT_LIMIT}&q=lorem`).reply(500);

    await renderWithProviders(<ExploreView />);

    fireEvent.changeText(screen.getByTestId('explore-search-input'), 'lorem');

    await waitFor(() => expect(screen.getByTestId('explore-error')).toBeTruthy());
  });
});
