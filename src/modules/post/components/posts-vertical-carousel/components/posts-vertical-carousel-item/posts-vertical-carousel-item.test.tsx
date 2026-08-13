import { mockPost } from '@/test/entities';
import { fireEvent, render, screen } from '@/test/test-utils';

import { PostVerticalCarouselItem } from './posts-vertical-carousel-item';

describe('PostVerticalCarouselItem', () => {
  const mockHandlePressItem = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render correctly with title and body', async () => {
    await render(<PostVerticalCarouselItem item={mockPost} handlePressItem={mockHandlePressItem} />);

    // Check if title and body are rendered correctly
    expect(screen.getByText(mockPost.title)).toBeTruthy();
    expect(screen.getByText(mockPost.body)).toBeTruthy();
  });

  it('should render the author only when authorName is provided', async () => {
    const authorName = 'Leanne Graham';

    await render(
      <PostVerticalCarouselItem item={mockPost} authorName={authorName} handlePressItem={mockHandlePressItem} />,
    );

    expect(screen.getByText(authorName)).toBeTruthy();

    await screen.rerender(<PostVerticalCarouselItem item={mockPost} handlePressItem={mockHandlePressItem} />);

    expect(screen.queryByText(authorName)).toBeNull();
  });

  it('should call handlePressItem when TouchableOpacity is pressed', async () => {
    await render(<PostVerticalCarouselItem item={mockPost} handlePressItem={mockHandlePressItem} />);

    // Simulate press event
    await fireEvent.press(screen.getByTestId('item-onpress'));

    // Check if handlePressItem function is called
    expect(mockHandlePressItem).toHaveBeenCalled();
  });
});
