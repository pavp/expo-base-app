import React from 'react';
import MockAdapter from 'axios-mock-adapter';

import { client, DEFAULT_LIMIT, Post, User } from '@/api';
import { API_ENDPOINT } from '@/api/endpoints';
import { generateMockPosts, generateMockUsers } from '@/test/entities';
import { fireEvent, queryClient, renderWithProviders, screen } from '@/test/test-utils';

import { ExploreView } from './explore-view';

describe('ExploreView', () => {
  const mock = new MockAdapter(client);
  // Stable across tests: react-query caches the author list, so regenerating it
  // per test would leave a stale set on screen with different ids.
  const mockUsers: User[] = generateMockUsers(3);

  beforeEach(() => {
    // Re-registered per test because `reset()` below clears every handler.
    mock.onGet(API_ENDPOINT.USERS).reply(200, mockUsers);
  });

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

    expect(await screen.findByTestId('data-list')).toBeTruthy();
    expect(screen.queryByTestId('explore-empty')).toBeNull();
  });

  it('should report when a search returns nothing', async () => {
    mock.onGet(`${API_ENDPOINT.GET_POSTS}?_page=1&_limit=${DEFAULT_LIMIT}&q=zzz`).reply(200, []);

    await renderWithProviders(<ExploreView />);

    fireEvent.changeText(screen.getByTestId('explore-search-input'), 'zzz');

    expect(await screen.findByTestId('explore-no-results')).toBeTruthy();
  });

  it('should report a failed search', async () => {
    mock.onGet(`${API_ENDPOINT.GET_POSTS}?_page=1&_limit=${DEFAULT_LIMIT}&q=lorem`).reply(500);

    await renderWithProviders(<ExploreView />);

    fireEvent.changeText(screen.getByTestId('explore-search-input'), 'lorem');

    expect(await screen.findByTestId('explore-error')).toBeTruthy();
  });

  it('should offer a chip per author plus an unfiltered option', async () => {
    await renderWithProviders(<ExploreView />);

    expect(await screen.findByTestId('explore-author-chips-all')).toBeTruthy();

    mockUsers.forEach(({ id }) => expect(screen.getByTestId(`explore-author-chips-${id}`)).toBeTruthy());
  });

  it('should filter by author without a search term', async () => {
    const [author] = mockUsers;
    const mockPosts: Post[] = generateMockPosts(2);

    mock.onGet(`${API_ENDPOINT.GET_POSTS}?_page=1&_limit=${DEFAULT_LIMIT}&userId=${author.id}`).reply(200, mockPosts);

    await renderWithProviders(<ExploreView />);

    expect(await screen.findByTestId(`explore-author-chips-${author.id}`)).toBeTruthy();
    fireEvent.press(screen.getByTestId(`explore-author-chips-${author.id}`));

    expect(await screen.findByTestId('data-list')).toBeTruthy();
  });

  it('should combine the search term with the author filter', async () => {
    const [author] = mockUsers;
    const mockPosts: Post[] = generateMockPosts(1);

    mock
      .onGet(`${API_ENDPOINT.GET_POSTS}?_page=1&_limit=${DEFAULT_LIMIT}&q=lorem&userId=${author.id}`)
      .reply(200, mockPosts);

    await renderWithProviders(<ExploreView />);

    expect(await screen.findByTestId(`explore-author-chips-${author.id}`)).toBeTruthy();

    fireEvent.changeText(screen.getByTestId('explore-search-input'), 'lorem');
    fireEvent.press(screen.getByTestId(`explore-author-chips-${author.id}`));

    expect(await screen.findByTestId('data-list')).toBeTruthy();
  });

});
