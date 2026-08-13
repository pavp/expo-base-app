import { GestureResponderEvent, OpaqueColorValue } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface MaterialIconProps {
  name: keyof typeof MaterialIcons.glyphMap;
  accessibilityLabel?: string;
  backgroundColor?: string | OpaqueColorValue;
  color?: string | OpaqueColorValue;
  size?: number;
  /** Omit for decorative icons: without it the icon is not interactive. */
  onPress?: (event: GestureResponderEvent) => void;
}

export const MaterialIcon = ({
  name,
  accessibilityLabel,
  backgroundColor = 'transparent',
  color = 'white',
  size = 24,
  onPress,
}: MaterialIconProps) => {
  return (
    <MaterialIcons
      name={name}
      accessibilityLabel={accessibilityLabel}
      backgroundColor={backgroundColor}
      onPress={onPress}
      size={size}
      color={color}
    />
  );
};
