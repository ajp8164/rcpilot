import { Colors, Theme, useTheme as useRNETheme } from '@rn-vui/themed';
import { EdgeInsets, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Styles as RNEULStyles,
  useStyles as useRNEULStyles,
} from '@react-native-hello/ui';

import { Styles } from './types/Styles';
import { useStyles } from './styles';

export { theme } from './theme';

export * from './svg';

export const useTheme = () => {
  const { theme, updateTheme } = useRNETheme();
  const rneulStyles = useRNEULStyles();
  const styles = useStyles(theme);
  const insets = useSafeAreaInsets();
  return {
    ...theme,
    styles: {
      ...rneulStyles,
      ...styles,
    },
    insets,
    updateTheme,
  };
};

export interface AppTheme extends Theme {
  colors: Colors;
  insets: EdgeInsets;
  styles: Partial<RNEULStyles & Styles>;
}
