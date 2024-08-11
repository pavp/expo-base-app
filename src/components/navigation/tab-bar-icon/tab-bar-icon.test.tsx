import React from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';

import { render } from '@/test/test-utils';

import { TabBarIcon } from './tab-bar-icon';

describe('TabBarIcon', () => {
  it('should render Ionicons with correct props', () => {
    const mockName = 'analytics';
    const mockColor = 'blue';
    const mockStyle = { marginBottom: -5 };

    render(<TabBarIcon name={mockName} color={mockColor} style={mockStyle} />);

    // Assert that Ionicons was called with correct props
    expect(Ionicons).toHaveBeenCalledWith(
      expect.objectContaining({
        name: mockName,
        color: mockColor,
        size: 28,
        style: [{ marginBottom: -3 }, mockStyle],
      }),
      {},
    );
  });
});
