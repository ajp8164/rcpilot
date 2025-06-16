import { fontSizes as defaultFontSizes, fontFamily } from '@react-native-ajp-elements/ui';

import { Styles } from 'theme/types/Styles';
import { makeStyles } from '@rn-vui/themed';

export const fontSizes = {
  ...defaultFontSizes,
  giant: 54,
  micro: 10,
};

export const useStyles = makeStyles(
  (theme): Styles => ({
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
