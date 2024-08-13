import { useEffect } from 'react';
import { UnistylesRuntime } from 'react-native-unistyles';

export const useChangeNavigationBarColor = () => {
  const setNavigationBarColor = () => {
    UnistylesRuntime.navigationBar.setColor('transparent');
  };

  useEffect(() => {
    setNavigationBarColor();
  }, []);
};
