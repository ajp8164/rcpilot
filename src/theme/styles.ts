import {
  fontSizes as defaultFontSizes,
  fontFamily,
} from '@react-native-ajp-elements/ui';

import { Styles } from 'theme/types/Styles';
import { makeStyles } from '@rneui/themed';

export const fontSizes = {
  ...defaultFontSizes,
  giant: 54,
  micro: 10,
};

export const useStyles = makeStyles(
  (theme): Styles => ({
    navigationBarTitle: {
      color: theme.colors.black,
      fontSize: fontSizes.heading5,
      fontFamily,
      // fontWeight: 'normal',
    },

    /**
     * Styles
     */

    swipeableListMask: {
      borderRadius: 10,
      overflow: 'hidden',
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

    // Aligns items in viewport.width without using view padding (which clips shadows).
    viewHorizontalInset: {
      paddingHorizontal: 15,
    },
  }),
);
