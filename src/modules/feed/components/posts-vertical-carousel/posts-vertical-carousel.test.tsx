import { router } from 'expo-router';

import { mockPost } from '@/test/entities';
import { fireEvent, renderWithProviders, screen } from '@/test/test-utils';

import type { Post } from '../../feed.types';

import { MockPostVerticalCarouselItem } from './components/posts-vertical-carousel-item/__mocks__';
import type { PostItemCardProps } from './components/posts-vertical-carousel-item/posts-vertical-carousel-item';
import { PostsVerticalCarousel } from './posts-vertical-carousel';

const postItemTestID = 'post-item-onpress';

jest.mock('./components/posts-vertical-carousel-item/posts-vertical-carousel-item', () => ({
  PostVerticalCarouselItem: ({ item, handlePressItem }: PostItemCardProps) => (
    <MockPostVerticalCarouselItem item={item} handlePressItem={handlePressItem} testID={postItemTestID} />
  ),
}));

describe('PostsVerticalCarousel', () => {
  const mockPosts: Post[] = [mockPost];

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render data list when isLoading is false', async () => {
    await renderWithProviders(
      <PostsVerticalCarousel
        data={mockPosts}
        isLoading={false}
        isFetchingNextPage={false}
        isRefetching={false}
        onEndReached={jest.fn()}
        onRefresh={jest.fn()}
      />,
    );

    expect(screen.getAllByTestId('data-list')).toHaveLength(1);
  });

  it('should display ActivityIndicator when loading', async () => {
    await renderWithProviders(
      <PostsVerticalCarousel
        data={mockPosts}
        isLoading={true}
        isFetchingNextPage={false}
        isRefetching={false}
        onEndReached={jest.fn()}
        onRefresh={jest.fn()}
      />,
    );

    expect(screen.getByTestId('indicator')).toBeTruthy();

    await screen.rerender(
      <PostsVerticalCarousel
        data={mockPosts}
        isLoading={false}
        isFetchingNextPage={false}
        isRefetching={false}
        onEndReached={jest.fn()}
        onRefresh={jest.fn()}
      />,
    );

    expect(screen.queryByTestId('indicator')).toBeNull();
  });

  it('should show ActivityIndicator in footer when isFetchingNextPage is true', async () => {
    await renderWithProviders(
      <PostsVerticalCarousel
        data={mockPosts}
        isLoading={false}
        isFetchingNextPage={true}
        isRefetching={false}
        onEndReached={jest.fn()}
        onRefresh={jest.fn()}
      />,
    );

    expect(screen.getByTestId('activity-indicator-footer')).toBeTruthy();
  });

  it('should navigate to the correct post when an item is pressed', async () => {
    router.navigate = jest.fn();

    await renderWithProviders(
      <PostsVerticalCarousel
        data={mockPosts}
        isLoading={false}
        isFetchingNextPage={false}
        isRefetching={false}
        onEndReached={jest.fn()}
        onRefresh={jest.fn()}
      />,
    );

    await fireEvent.press(screen.getByTestId(postItemTestID));

    expect(router.navigate).toHaveBeenCalledWith({
      pathname: '/post/[id]',
      params: { id: mockPosts[0].id, userId: mockPosts[0].userId },
    });
  });

  it('should trigger onRefresh when refresh is called', async () => {
    const onRefresh = jest.fn();

    await renderWithProviders(
      <PostsVerticalCarousel
        data={mockPosts}
        isLoading={false}
        isFetchingNextPage={false}
        isRefetching={false}
        onEndReached={jest.fn()}
        onRefresh={onRefresh}
      />,
    );

    await fireEvent(screen.getByTestId('data-list'), 'refresh');

    expect(onRefresh).toHaveBeenCalled();
  });

  it('should trigger onEndReached when end of the list is reached', async () => {
    const onEndReached = jest.fn();

    await renderWithProviders(
      <PostsVerticalCarousel
        data={mockPosts}
        isLoading={false}
        isFetchingNextPage={false}
        isRefetching={false}
        onEndReached={onEndReached}
        onRefresh={jest.fn()}
      />,
    );

    const eventData = {
      nativeEvent: {
        contentOffset: {
          y: 500,
        },
        contentSize: {
          // Dimensions of the scrollable content
          height: 500,
          width: 100,
        },
        layoutMeasurement: {
          // Dimensions of the device
          height: 100,
          width: 100,
        },
      },
    };

    // Simulate reaching end of the list
    await fireEvent.scroll(screen.getByTestId('data-list'), eventData);

    expect(onEndReached).toHaveBeenCalled();
  });
});
