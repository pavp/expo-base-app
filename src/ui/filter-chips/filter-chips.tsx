import { useCallback, useEffect, useRef } from 'react';
import { LayoutChangeEvent, Pressable, ScrollView, Text } from 'react-native';

import { styles } from './styles';

export interface FilterChip {
  /** `null` represents the unfiltered option. */
  value: number | null;
  label: string;
}

interface FilterChipsProps {
  options: FilterChip[];
  selectedValue: number | null;
  onSelect: (value: number | null) => void;
  testID?: string;
}

export interface ChipLayout {
  x: number;
  width: number;
}

const keyOf = (value: number | null) => value ?? 'all';

/**
 * Offset that puts a chip in the middle of the viewport, clamped so a chip near
 * the start does not ask the list to scroll before its own beginning.
 */
export const centreOffset = ({ x, width }: ChipLayout, viewport: number) =>
  Math.max(0, x + width / 2 - viewport / 2);

export const FilterChips = ({ options, selectedValue, onSelect, testID }: FilterChipsProps) => {
  const scrollRef = useRef<ScrollView>(null);
  const layouts = useRef<Record<string, ChipLayout>>({});
  const viewportWidth = useRef(0);

  const onChipLayout = useCallback(
    (value: number | null) =>
      ({ nativeEvent }: LayoutChangeEvent) => {
        layouts.current[keyOf(value)] = {
          x: nativeEvent.layout.x,
          width: nativeEvent.layout.width,
        };
      },
    [],
  );

  // A chip near either end is only partly on screen, and selecting it leaves it
  // clipped against the edge. Centring it keeps the current filter legible and
  // reveals that there are more options past it.
  useEffect(() => {
    const chip = layouts.current[keyOf(selectedValue)];

    if (!chip || !viewportWidth.current) return;

    scrollRef.current?.scrollTo({ x: centreOffset(chip, viewportWidth.current), animated: true });
  }, [selectedValue]);

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      onLayout={({ nativeEvent }) => {
        viewportWidth.current = nativeEvent.layout.width;
      }}
      testID={testID}
    >
      {options.map(({ value, label }) => {
        const isSelected = value === selectedValue;

        return (
          <Pressable
            key={keyOf(value)}
            accessibilityRole="radio"
            accessibilityState={{ selected: isSelected }}
            onPress={() => onSelect(value)}
            onLayout={onChipLayout(value)}
            style={styles.chip(isSelected)}
            testID={`${testID}-${keyOf(value)}`}
          >
            <Text style={styles.label(isSelected)}>{label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
};
