import { Pressable, ScrollView, Text } from 'react-native';

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

export const FilterChips = ({ options, selectedValue, onSelect, testID }: FilterChipsProps) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.content}
    keyboardShouldPersistTaps="handled"
    testID={testID}
  >
    {options.map(({ value, label }) => {
      const isSelected = value === selectedValue;

      return (
        <Pressable
          key={value ?? 'all'}
          accessibilityRole="radio"
          accessibilityState={{ selected: isSelected }}
          onPress={() => onSelect(value)}
          style={styles.chip(isSelected)}
          testID={`${testID}-${value ?? 'all'}`}
        >
          <Text style={styles.label(isSelected)}>{label}</Text>
        </Pressable>
      );
    })}
  </ScrollView>
);
