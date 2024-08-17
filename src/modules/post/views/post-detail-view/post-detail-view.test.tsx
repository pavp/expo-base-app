import React from 'react';

import { mockPost, mockUser } from '@/test/entities';
import { renderWithProviders, screen, waitFor } from '@/test/test-utils';
import { ActivityIndicator } from '@/ui';

import * as hooks from '../../hooks';

import { PostDetailView } from './post-detail-view';

jest.mock('../../hooks', () => ({
  useDetailPost: jest.fn(),
}));

describe('PostDetailView', () => {
  const post = mockPost;
  const user = mockUser;

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should display ActivityIndicator while loading', async () => {
    jest.spyOn(hooks, 'useDetailPost').mockReturnValueOnce({
      post,
      user,
      isLoading: true,
    });

    renderWithProviders(<PostDetailView />);

    expect(screen.getByTestId('detail-container')).toBeTruthy();

    const activityIndicator = await waitFor(() => screen.getByTestId('detail-container').findByType(ActivityIndicator));

    expect(activityIndicator).toBeTruthy();
  });

  it('should render post details correctly when data is loaded', () => {
    jest.spyOn(hooks, 'useDetailPost').mockReturnValueOnce({
      post,
      user,
      isLoading: false,
    });

    renderWithProviders(<PostDetailView />);

    // Check if the container is rendered
    expect(screen.getByTestId('detail-container')).toBeTruthy();

    // Check if post details are rendered correctly
    expect(screen.getByText(user.name)).toBeTruthy();
    expect(screen.getByText(`@${user.username}`)).toBeTruthy();
    expect(screen.getByText(post.title)).toBeTruthy();
    expect(screen.getByText(post.body)).toBeTruthy();
  });
});
