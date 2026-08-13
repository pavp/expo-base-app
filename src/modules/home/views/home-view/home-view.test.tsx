import React from 'react';
import MockAdapter from 'axios-mock-adapter';

import { client, DEFAULT_LIMIT, Post, User } from '@/api';
import { API_ENDPOINT } from '@/api/endpoints';
import { generateMockPosts, generateMockUsers } from '@/test/entities';
import { queryClient, renderWithProviders, screen } from '@/test/test-utils';

import { HomeView } from './home-view';

describe('HomeView', () => {
  const mock = new MockAdapter(client);
  // Stable across tests: react-query caches the author list, so regenerating it
  // per test would leave a stale set on screen with different ids.
  const mockUsers: User[] = generateMockUsers(3);
  const postsUrl = `${API_ENDPOINT.GET_POSTS}?_page=1&_limit=${DEFAULT_LIMIT}`;

  beforeEach(() => {
    // Re-registered per test because `reset()` below clears every handler.
    mock.onGet(API_ENDPOINT.USERS).reply(200, mockUsers);
  });

  afterEach(() => {
    queryClient.clear();
    mock.reset();

    jest.clearAllMocks();
  });

  it('should render correctly', async () => {
    mock.onGet(postsUrl).reply(200, generateMockPosts(3));

    await renderWithProviders(<HomeView />);

    expect(screen.getByTestId('home-container')).toBeTruthy();
  });

  it('should report a failed posts request', async () => {
    mock.onGet(postsUrl).reply(500);

    await renderWithProviders(<HomeView />);

    expect(await screen.findByTestId('home-error')).toBeTruthy();
  });

  it('should report when there are no posts', async () => {
    mock.onGet(postsUrl).reply(200, []);

    await renderWithProviders(<HomeView />);

    expect(await screen.findByTestId('home-empty')).toBeTruthy();
  });

  it('should not show the empty state while the posts are loading', async () => {
    // Never resolves, so the view stays in its loading state for the assertion.
    mock.onGet(postsUrl).reply(() => new Promise(() => {}));

    await renderWithProviders(<HomeView />);

    expect(screen.queryByTestId('home-empty')).toBeNull();
    expect(screen.queryByTestId('home-error')).toBeNull();
    expect(screen.getByTestId('indicator')).toBeTruthy();
  });

  it('should render the posts once they load', async () => {
    const mockPosts: Post[] = generateMockPosts(3);

    mock.onGet(postsUrl).reply(200, mockPosts);

    await renderWithProviders(<HomeView />);

    expect(await screen.findByTestId('data-list')).toBeTruthy();
    expect(screen.queryByTestId('home-empty')).toBeNull();
  });
});
