import { fonts } from './fonts';
import { IBaseThemeSchema } from '@react-native-hello/ui';
import { DeepPartial } from 'types/custom';

export const baseTheme: DeepPartial<IBaseThemeSchema> = {
  radius: {},
  fontSize: {
    giant: 54,
    medium: 14,
    micro: 10,
  },
  fonts: {
    bold: fonts.bold,
    semiBold: fonts.semiBold,
    medium: fonts.medium,
    regular: fonts.regular,
    light: fonts.light,
  },
  lineHeight: {
    giant: 56,
    medium: 18,
    micro: 12,
  },
  spacing: {},
};
