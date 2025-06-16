import { ThemeMode } from '@rn-vui/themed';

export type ThemeTarget = 'device' | 'app';

export type ThemeSettings = {
  followDevice: boolean;
  app: ThemeMode;
};
