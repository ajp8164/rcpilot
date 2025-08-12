import {
  fontSizes as defaultFontSizes,
  fontFamily,
  fontFamilyBold,
} from '@react-native-hello/ui';
import { makeStyles } from '@rn-vui/themed';
import { Platform } from 'react-native';

export const fontSizes = {
  ...defaultFontSizes,
  giant: 54,
  micro: 10,
};

export const useStyles = makeStyles(theme => ({
  /**
   * Divider
   */

  dividerButton: {
    backgroundColor: theme.colors.transparent,
    height: 20,
    paddingHorizontal: 5,
    paddingVertical: 0,
    marginVertical: -1,
    justifyContent: 'flex-start',
  },
  dividerButtonDisabled: {
    opacity: 0.4,
    backgroundColor: theme.colors.transparent,
    height: 20,
    paddingHorizontal: 5,
    paddingVertical: 0,
    marginVertical: -1,
    justifyContent: 'flex-start',
  },

  /**
   * List Item
   */

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
   * Button
   */

  buttonAssertive: {
    backgroundColor: theme.colors.transparent,
    borderColor: theme.colors.assertive,
    borderWidth: 2,
  },
  buttonAssertiveTitle: {
    fontSize: fontSizes.normal,
    fontWeight: '400',
    fontFamily,
    color: theme.colors.assertive,
  },
  buttonContainer: {
    marginHorizontal: 15,
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
    // lineHeight: 24,
    fontSize: fontSizes.normal,
    fontFamily,
    fontWeight: '500',
  },
  textSmall: {
    color: theme.colors.text,
    lineHeight: 14,
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
}));
