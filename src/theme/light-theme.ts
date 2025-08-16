import { baseTheme } from './base-theme';
import { palette } from './palette';
import { shadow } from './shadow';
import { createElementsStyles } from './styles';
import { createTextStyles } from './text';
import {
  IBaseThemeSchema,
  type IBaseThemeSchema as IParentBaseThemeSchema,
  IThemeManagerSchema,
} from '@react-native-hello/ui';
import { Platform } from 'react-native';
import { DeepPartial } from 'types/custom';

export const themeBase: DeepPartial<IBaseThemeSchema> = {
  ...baseTheme,
  colors: {
    avatarColors: [
      '#ff6767',
      '#66e0da',
      '#f5a2d9',
      '#f0c722',
      '#6a85e5',
      '#fd9a6f',
      '#92db6e',
      '#73b8e5',
      '#fd7590',
      '#c78ae5',
    ],
    brandPrimary: palette.secondary,
    brandSecondary: palette.primary,
    disabled: '#787878',
    listItemBackgroundAlt: '#f7f7f7',
    listItemIcon: palette.primary,
    listItemIconNav: palette.primary,
    screenHeaderButtonText: palette.primary,
    tabBarActiveTint: palette.primary,
    tabBarBackgroundActive: palette.white,
    tabBarBackgroundInactive: palette.white,
    tabBarBorder: '#aaaaaa',
    tabBarInactiveTint: '#aaaaaa',

    // iOS
    clearButtonText: palette.primary,
    switchOffThumb: palette.white,
    switchOnThumb: palette.white,
    switchOffTrack: '#787878',
    switchOnTrack: palette.primary,
    ...Platform.select({
      android: {
        clearButtonText: palette.black,
        switchOffThumb: '#cccccc',
        switchOnThumb: palette.primary,
        switchOffTrack: '#787878',
        switchOnTrack: `${palette.primary}40`,
      },
    }),
  },
};

export const lightTheme: DeepPartial<IThemeManagerSchema> = {
  ...themeBase,
  palette,
  text: createTextStyles({
    theme: themeBase as IParentBaseThemeSchema & IBaseThemeSchema,
  }),
  styles: createElementsStyles({
    theme: themeBase as IParentBaseThemeSchema & IBaseThemeSchema,
  }),
  shadow,
};
