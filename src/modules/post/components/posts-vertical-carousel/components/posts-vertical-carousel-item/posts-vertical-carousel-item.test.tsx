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

  it('should render correctly separator when showSeparator is true', async () => {
    await render(<PostVerticalCarouselItem item={mockPost} handlePressItem={mockHandlePressItem} showSeparator />);

    expect(screen.getByTestId('item-separator')).toBeTruthy();
  });

  it('should call handlePressItem when TouchableOpacity is pressed', async () => {
    await render(<PostVerticalCarouselItem item={mockPost} handlePressItem={mockHandlePressItem} />);

    // Simulate press event
    await fireEvent.press(screen.getByTestId('item-onpress'));

    // Check if handlePressItem function is called
    expect(mockHandlePressItem).toHaveBeenCalled();
  });
});
