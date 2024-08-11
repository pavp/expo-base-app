import React from 'react';
import { router } from 'expo-router';

import { Post } from '@/api/services/post';
import { mockPost } from '@/test/entities';
import { fireEvent, renderWithProviders, screen } from '@/test/test-utils';

import { MockPostItemCard } from '../post-item-card/__mocks__';

import { PostsVerticalCarousel } from './posts-vertical-carousel';

const postItemTestID = 'post-item-onpress';

jest.mock('../post-item-card/post-item-card', () => ({
  PostItemCard: ({ item, handlePressItem }) => (
    <MockPostItemCard item={item} handlePressItem={handlePressItem} testID={postItemTestID} />
  ),
}));

describe('PostsVerticalCarousel', () => {
  const mockPosts: Post[] = [mockPost];

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render carousel with 1 element', () => {
    renderWithProviders(<PostsVerticalCarousel data={mockPosts} isLoading={false} />);

    expect(screen.getAllByTestId('data-list')).toHaveLength(1);
  });

  it('should display ActivityIndicator when loading', () => {
    renderWithProviders(<PostsVerticalCarousel data={mockPosts} isLoading={true} />);

    expect(screen.getByTestId('indicator')).toBeTruthy();

    screen.rerender(<PostsVerticalCarousel data={mockPosts} isLoading={false} />);

    expect(screen.queryByTestId('indicator')).toBeNull();
  });

  it('should navigate to the correct post when an item is pressed', () => {
    router.navigate = jest.fn();

    renderWithProviders(<PostsVerticalCarousel data={mockPosts} isLoading={false} />);

    fireEvent.press(screen.getByTestId(postItemTestID));

    expect(router.navigate).toHaveBeenCalledWith({
      pathname: '/post/[id]',
      params: { id: mockPosts[0].id, userId: mockPosts[0].userId },
    });
  });
});
