import { ThemeManager } from '@react-native-hello/ui';
import { DeckCardColors } from 'types/preferences';

export * from './Back';
export * from './Front';

export const defaultDinnCardColors: DeckCardColors = {
  primary: ThemeManager.get('light').colors.lightGray,
  accent1: ThemeManager.get('light').colors.darkGray,
  accent2: ThemeManager.get('light').colors.midGray,
};
