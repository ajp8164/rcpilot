import {
  fontSizes as defaultFontSizes,
  fontFamily,
  fontFamilyBold,
  Styles as RNEULStyles,
} from '@react-native-hello/ui';

import { Styles } from 'theme/types/Styles';
import { makeStyles } from '@rn-vui/themed';
import { Platform } from 'react-native';

export const fontSizes = {
  ...defaultFontSizes,
  giant: 54,
  micro: 10,
};

export const useStyles = makeStyles(
  (theme): Partial<RNEULStyles & Styles> => ({
    listItemButtonTitle: {
      alignSelf: 'center',
      textAlign: 'center',
      color: theme.colors.clearButtonText,
    },
    listItemButtonDisabled: {
      opacity: 0.3,
    },
    swipeableListItemContainer: {
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
      borderTopLeftRadius: 0,
      borderTopRightRadius: 0,
    },

    /**
     * Text
     */

    textHeading1: {
      color: theme.colors.text,
      lineHeight: 48,
      fontSize: fontSizes.heading1,
      ...Platform.select({
        android: {
          fontFamily: fontFamilyBold,
        },
        ios: {
          fontFamily,
          fontWeight: '700',
        },
      }),
    },
    textHeading2: {
      color: theme.colors.text,
      lineHeight: 36,
      fontSize: fontSizes.heading2,
      ...Platform.select({
        android: {
          fontFamily: fontFamilyBold,
        },
        ios: {
          fontFamily,
          fontWeight: '700',
        },
      }),
    },
    textHeading3: {
      color: theme.colors.text,
      lineHeight: 32,
      fontSize: fontSizes.heading3,
      ...Platform.select({
        android: {
          fontFamily: fontFamilyBold,
        },
        ios: {
          fontFamily,
          fontWeight: '700',
        },
      }),
    },
    textHeading4: {
      color: theme.colors.text,
      lineHeight: 32,
      fontSize: fontSizes.heading4,
      ...Platform.select({
        android: {
          fontFamily: fontFamilyBold,
        },
        ios: {
          fontFamily,
          fontWeight: '700',
        },
      }),
    },
    textXL: {
      color: theme.colors.text,
      lineHeight: 24,
      fontSize: fontSizes.XL,
      fontFamily,
      fontWeight: '600',
    },
    textLarge: {
      color: theme.colors.text,
      lineHeight: 24,
      fontSize: fontSizes.large,
      fontFamily,
      fontWeight: '400',
    },
    textNormal: {
      color: theme.colors.text,
      lineHeight: 24,
      fontSize: fontSizes.normal,
      fontFamily,
      fontWeight: '500',
    },
    textSmall: {
      color: theme.colors.text,
      lineHeight: 18,
      fontSize: fontSizes.small,
      fontFamily,
      fontWeight: '500',
    },
    textTiny: {
      color: theme.colors.text,
      lineHeight: 15,
      fontSize: fontSizes.tiny,
      fontFamily,
      fontWeight: '500',
    },
    textGiant: {
      color: theme.colors.text,
      fontSize: fontSizes.giant,
      fontFamily,
      fontWeight: 'normal',
    },
    textMicro: {
      color: theme.colors.text,
      fontSize: fontSizes.micro,
      fontFamily,
      fontWeight: 'normal',
    },

    /**
     * View
     */

    view: {
      height: '100%',
      paddingHorizontal: 7,
      backgroundColor: theme.colors.viewBackground,
    },
    viewAlt: {
      height: '100%',
      paddingHorizontal: 7,
      backgroundColor: theme.colors.viewAltBackground,
    },
    viewInv: {
      height: '100%',
      paddingHorizontal: 7,
      backgroundColor: theme.colors.viewInvBackground,
    },
  }),
);
