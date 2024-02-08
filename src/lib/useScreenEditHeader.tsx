import { AppTheme, useTheme } from 'theme';
import { NavigationProp, useNavigation } from '@react-navigation/native';

import { Button } from '@rneui/base';
import { MultipleNavigatorParamList } from 'types/navigation';
import type { StackNavigationOptions } from '@react-navigation/stack';
import { makeStyles } from '@rneui/themed';

export type ScreenEditHeaderAction = {
  action: () => void;
  condition?: boolean | (() => boolean);
  label?: string;
};

/**
 * Provides a common screen edit header for the "cancel of done" pattern.
 * Accepts an additional navigation screen options for convenience.
 * 
 * Left button is typically 'Cancel' and defaults to shown.
 * Right button is typically 'Done' and defaults to hidden.
 */
export const useScreenEditHeader = () => {
  const theme = useTheme();
  const s = useStyles(theme);
  const navigation: NavigationProp<MultipleNavigatorParamList> = useNavigation();

  const setScreenEditHeader = (
    rightButton?: ScreenEditHeaderAction,
    leftButton?: ScreenEditHeaderAction,
    navigationOpts?: StackNavigationOptions) => {
      
    let options = navigationOpts || {};

    options.headerLeft = () => {
      if (leftButton?.condition ? leftButton.condition : true) {
        return (
          <Button
            title={leftButton?.label || 'Cancel'}
            titleStyle={theme.styles.buttonScreenHeaderTitle}
            buttonStyle={[theme.styles.buttonScreenHeader, s.headerButton]}
            onPress={() => leftButton ? leftButton.action() : navigation.goBack()}
          />
        )
      }
    };

    options.headerRight = () => {
      if (rightButton?.condition ? rightButton.condition : false) {
        return (
          <Button
            title={rightButton?.label || 'Done'}
            titleStyle={theme.styles.buttonScreenHeaderTitle}
            buttonStyle={[theme.styles.buttonScreenHeader, s.headerButton]}
            onPress={() => rightButton ? rightButton.action() : () => { return }}
          />
        )
      }
    };

    navigation.setOptions(options);
  }

  return setScreenEditHeader;
};

const useStyles = makeStyles((_theme, __theme: AppTheme) => ({
  headerButton: {
    justifyContent: 'flex-start',
    paddingHorizontal: 0,
    minWidth: 0,
  },
}));
