import React from 'react';

import { mockPost } from '@/test/entities';
import { fireEvent, render, screen } from '@/test/test-utils';

import { PostItemCard } from './post-item-card';

describe('PostItemCard', () => {
  const mockHandlePressItem = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render correctly with title and body', () => {
    render(<PostItemCard item={mockPost} handlePressItem={mockHandlePressItem} />);

    // Check if title and body are rendered correctly
    expect(screen.getByText(mockPost.title)).toBeTruthy();
    expect(screen.getByText(mockPost.body)).toBeTruthy();
  });

  it('should call handlePressItem when TouchableOpacity is pressed', () => {
    render(<PostItemCard item={mockPost} handlePressItem={mockHandlePressItem} />);

    // Simulate press event
    fireEvent.press(screen.getByTestId('item-onpress'));

    // Check if handlePressItem function is called
    expect(mockHandlePressItem).toHaveBeenCalled();
  });
});
