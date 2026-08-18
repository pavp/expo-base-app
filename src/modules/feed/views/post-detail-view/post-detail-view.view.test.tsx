import React from 'react';

import { mockPost, mockUser } from '@/test/entities';
import { fireEvent, renderWithProviders, screen, waitFor } from '@/test/test-utils';

import * as hooks from './hooks';
import { PostDetailView } from './post-detail-view.view';

jest.mock('./hooks', () => ({
  usePostDetailBusiness: jest.fn(),
}));

describe('PostDetailView', () => {
  const post = mockPost;
  const user = mockUser;
  const favoriteDefaults = {
    isFavorite: false,
    onToggleFavorite: jest.fn(),
  };

  it('should display ActivityIndicator while loading', async () => {
    jest.spyOn(hooks, 'usePostDetailBusiness').mockReturnValueOnce({
      post,
      user,
      isLoading: true,
      isError: false,
      ...favoriteDefaults,
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
      ...favoriteDefaults,
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
      ...favoriteDefaults,
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
      ...favoriteDefaults,
    });

    await renderWithProviders(<PostDetailView />);

    expect(screen.getByText(post.title)).toBeTruthy();
    expect(screen.queryByTestId('detail-error')).toBeNull();
  });

  it('should render the favorite button for a post that is not favorite', async () => {
    jest.spyOn(hooks, 'usePostDetailBusiness').mockReturnValue({
      post,
      user,
      isLoading: false,
      isError: false,
      ...favoriteDefaults,
    });

    await renderWithProviders(<PostDetailView />);

    expect(screen.getByLabelText('postDetail.favorite.add')).toBeTruthy();
  });

  it('should toggle the favorite from the detail view', async () => {
    const onToggleFavorite = jest.fn();

    jest.spyOn(hooks, 'usePostDetailBusiness').mockReturnValue({
      post,
      user,
      isLoading: false,
      isError: false,
      ...favoriteDefaults,
      isFavorite: true,
      onToggleFavorite,
    });

    await renderWithProviders(<PostDetailView />);

    fireEvent(screen.getByLabelText('postDetail.favorite.remove'), 'press');

    expect(onToggleFavorite).toHaveBeenCalledTimes(1);
  });
});
