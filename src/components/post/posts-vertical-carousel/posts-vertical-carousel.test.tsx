import React from 'react';
import { router } from 'expo-router';

import { Post } from '@/api/services/post';
import { mockPost } from '@/test/entities';
import { fireEvent, renderWithProviders, screen } from '@/test/test-utils';

import { PostsVerticalCarousel } from './posts-vertical-carousel';

describe('PostsVerticalCarousel', () => {
  const data: Post[] = [mockPost];
  let isLoading = false;

  afterEach(() => {
    isLoading = false;
    jest.clearAllMocks();
  });

  it('should render carousel with 1 element', () => {
    renderWithProviders(<PostsVerticalCarousel data={data} isLoading={isLoading} />);

    expect(screen.getAllByTestId('data-list')).toHaveLength(1);
  });

  it('should render indicator when isLoading is true', () => {
    isLoading = true;
    renderWithProviders(<PostsVerticalCarousel data={data} isLoading={isLoading} />);

    expect(screen.getByTestId('indicator')).toBeTruthy();

    isLoading = false;
    screen.rerender(<PostsVerticalCarousel data={data} isLoading={isLoading} />);

    expect(screen.queryByTestId('indicator')).toBeNull();
  });

  it('should call handle press item', () => {
    router.navigate = jest.fn();

    renderWithProviders(<PostsVerticalCarousel data={data} isLoading={isLoading} />);

    fireEvent.press(screen.getAllByTestId('item-onpress')[0]);

    expect(router.navigate).toHaveBeenCalledWith({
      pathname: '/post/[id]',
      params: { id: data[0].id, userId: data[0].userId },
    });
  });
});
