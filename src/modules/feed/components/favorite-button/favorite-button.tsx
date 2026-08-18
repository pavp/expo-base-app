import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { MaterialIcon } from '@/ui';

import { styles } from './styles';

interface FavoriteButtonProps {
  isFavorite: boolean;
  onToggle: () => void;
}

export const FavoriteButton = ({ isFavorite, onToggle }: FavoriteButtonProps) => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <MaterialIcon
        name={isFavorite ? 'favorite' : 'favorite-border'}
        color={styles.icon(isFavorite).color}
        accessibilityLabel={t(isFavorite ? 'postDetail.favorite.remove' : 'postDetail.favorite.add')}
        onPress={onToggle}
      />
    </View>
  );
};
