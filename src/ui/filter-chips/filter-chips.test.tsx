import { ScrollView } from 'react-native';

import { fireEvent, renderWithProviders, screen } from '@/test/test-utils';

import { centreOffset, FilterChips } from './filter-chips';

const VIEWPORT_WIDTH = 400;
const CHIP_WIDTH = 120;

const options = [
  { value: null, label: 'All' },
  { value: 1, label: 'Leanne Graham' },
  { value: 2, label: 'Ervin Howell' },
  { value: 3, label: 'Clementine Bauch' },
  { value: 4, label: 'Patricia Lebsack' },
];

/**
 * Feeds the layout the component would receive on a device: a viewport
 * narrower than the row, with each chip laid out end to end.
 */
const layout = () => {
  fireEvent(screen.getByTestId('chips'), 'layout', {
    nativeEvent: { layout: { width: VIEWPORT_WIDTH, height: 40, x: 0, y: 0 } },
  });

  options.forEach(({ value }, index) => {
    fireEvent(screen.getByTestId(`chips-${value ?? 'all'}`), 'layout', {
      nativeEvent: { layout: { width: CHIP_WIDTH, height: 40, x: index * CHIP_WIDTH, y: 0 } },
    });
  });
};

describe('FilterChips', () => {
  const scrollTo = jest.spyOn(ScrollView.prototype, 'scrollTo');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should report the chip the user pressed', async () => {
    const onSelect = jest.fn();

    await renderWithProviders(
      <FilterChips options={options} selectedValue={null} onSelect={onSelect} testID="chips" />,
    );

    fireEvent.press(screen.getByText('Ervin Howell'));

    expect(onSelect).toHaveBeenCalledWith(2);
  });

  it('should centre a selected chip that sits past the viewport', async () => {
    const view = await renderWithProviders(
      <FilterChips options={options} selectedValue={null} onSelect={jest.fn()} testID="chips" />,
    );

    layout();
    scrollTo.mockClear();

    await view.rerender(
      <FilterChips options={options} selectedValue={4} onSelect={jest.fn()} testID="chips" />,
    );

    // Chip 4 spans 480-600, so its centre (540) lands 340 past the viewport's.
    expect(scrollTo).toHaveBeenCalledWith({ x: 340, animated: true });
  });

});

describe('centreOffset', () => {
  it('should centre a chip that sits past the viewport', () => {
    // Chip 4 spans 480-600: its centre (540) lands 340 past the viewport's.
    expect(centreOffset({ x: 480, width: 120 }, 400)).toBe(340);
  });

  it('should clamp to the start rather than scrolling backwards', () => {
    // Centring chip 1 (120-240) resolves to -20, which would ask the list to
    // move before its own beginning.
    expect(centreOffset({ x: 120, width: 120 }, 400)).toBe(0);
  });

  it('should leave the first chip where it is', () => {
    expect(centreOffset({ x: 0, width: 120 }, 400)).toBe(0);
  });
});
