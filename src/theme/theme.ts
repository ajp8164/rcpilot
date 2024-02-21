import { Platform } from 'react-native';
import { createTheme } from '@rneui/themed';
import lodash from 'lodash';
import { theme as rneulTheme } from '@react-native-ajp-elements/ui';

export const theme = createTheme(
  lodash.merge({}, rneulTheme, {
    darkColors: {
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
      brandPrimary: '#002e5a',
      brandSecondary: '#007bff',
      calm: '#b260ea',
      cardBackground: '#202020',
      disabled: '#787878',
      listItemBackgroundAlt: '#101010',
      shadowColor: '#00000000',

      ...Platform.select({
        ios: {
          screenHeaderButtonText: '#007bff',
          switchOffThumb: '#ffffff',
          switchOnThumb: '#ffffff',
          switchOffTrack: '#e5e5e5',
          switchOnTrack: '#007bff',
        },
        android: {
          switchOffThumb: '#787878',
          switchOnThumb: '#007bff',
          switchOffTrack: '#e5e5e5',
          switchOnTrack: '#007bff40',
        },
      }),
    },
    lightColors: {
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
      brandPrimary: '#002e5a',
      brandSecondary: '#007bff',
      calm: '#b260ea',
      cardBackground: '#ffffff',
      disabled: '#787878',
      listItemBackgroundAlt: '#f7f7f7',
      shadowColor: '#000000',

      ...Platform.select({
        ios: {
          screenHeaderButtonText: '#007bff',
          switchOffThumb: '#ffffff',
          switchOnThumb: '#ffffff',
          switchOffTrack: '#787878',
          switchOnTrack: '#007bff',
        },
        android: {
          switchOffThumb: '#cccccc',
          switchOnThumb: '#007bff',
          switchOffTrack: '#787878',
          switchOnTrack: '#007bff40',
          screenHeaderButtonText: '#000000',
          screenHeaderInvBackButton: '#ffffff',
        },
      }),
    },
  }),
);
