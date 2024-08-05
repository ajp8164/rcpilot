/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { DeckCardColors } from 'types/preferences';
import { theme } from 'theme';

export * from './Back';
export * from './Front';

export const defaultDinnCardColors: DeckCardColors = {
  primary: theme.lightColors!.lightGray!,
  accent1: theme.lightColors!.darkGray!,
  accent2: theme.lightColors!.midGray!,
};
