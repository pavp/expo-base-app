import React from 'react';

import { mockPost, mockUser } from '@/test/entities';
import { renderWithProviders, screen, waitFor } from '@/test/test-utils';

import * as hooks from './hooks';
import { PostDetailView } from './post-detail-view.view';

jest.mock('./hooks', () => ({
  usePostDetailBusiness: jest.fn(),
}));

describe('PostDetailView', () => {
  const post = mockPost;
  const user = mockUser;

  it('should display ActivityIndicator while loading', async () => {
    jest.spyOn(hooks, 'usePostDetailBusiness').mockReturnValueOnce({
      post,
      user,
      isLoading: true,
      isError: false,
    });

    await renderWithProviders(<PostDetailView />);

    expect(screen.getByTestId('detail-container')).toBeTruthy();

    const activityIndicators = await waitFor(() =>
      screen.getByTestId('detail-container').queryAll((instance) => instance.type === 'ActivityIndicator'),
    );

    expect(activityIndicators).toHaveLength(1);
  });

  it('should render post details correctly when data is loaded', async () => {
    jest.spyOn(hooks, 'usePostDetailBusiness').mockReturnValueOnce({
      post,
      user,
      isLoading: false,
      isError: false,
    });

    await renderWithProviders(<PostDetailView />);

    // Check if the container is rendered
    expect(screen.getByTestId('detail-container')).toBeTruthy();

    // Check if post details are rendered correctly
    expect(screen.getByText(user.name)).toBeTruthy();
    expect(screen.getByText(`@${user.username}`)).toBeTruthy();
    expect(screen.getByText(post.title)).toBeTruthy();
    expect(screen.getByText(post.body)).toBeTruthy();
  });

  it('should report a failed post request instead of crashing', async () => {
    jest.spyOn(hooks, 'usePostDetailBusiness').mockReturnValue({
      post: undefined,
      user: undefined,
      isLoading: false,
      isError: true,
    });

    await renderWithProviders(<PostDetailView />);

    expect(screen.getByTestId('detail-error')).toBeTruthy();
  });

  it('should still render the post when only the author is missing', async () => {
    jest.spyOn(hooks, 'usePostDetailBusiness').mockReturnValue({
      post,
      user: undefined,
      isLoading: false,
      isError: false,
    });

    await renderWithProviders(<PostDetailView />);

    expect(screen.getByText(post.title)).toBeTruthy();
    expect(screen.queryByTestId('detail-error')).toBeNull();
  });
});
