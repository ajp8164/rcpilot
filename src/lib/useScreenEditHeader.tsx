import { AppTheme, useTheme } from 'theme';
import { NavigationProp, useNavigation } from '@react-navigation/native';

import { Button } from '@rneui/base';
import { MultipleNavigatorParamList } from 'types/navigation';
import { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { makeStyles } from '@rneui/themed';

export type ScreenEditHeaderAction = {
  action?: () => void;
  enabled?: boolean;
  label?: string;
  visible?: boolean;
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
    navigationOpts?: NativeStackNavigationOptions) => {
      
    let options = navigationOpts || {};

    options.headerLeft = () => {
      if (leftButton?.visible !== undefined ? leftButton.visible : true) {
        return (
          <Button
            title={leftButton?.label || 'Cancel'}
            titleStyle={theme.styles.buttonScreenHeaderTitle}
            buttonStyle={[theme.styles.buttonScreenHeader, s.headerButton]}
            disabled={leftButton?.enabled !== undefined ? !leftButton.enabled : false}
            disabledStyle={theme.styles.buttonScreenHeaderDisabled}
            onPress={() => leftButton && leftButton.action ? leftButton.action() : navigation.goBack()}
          />
        )
      }
    };

    options.headerRight = () => {
      if (rightButton?.visible !== undefined ? rightButton.visible : true) {
        return (
          <Button
            title={rightButton?.label || 'Save'}
            titleStyle={theme.styles.buttonScreenHeaderTitle}
            buttonStyle={[theme.styles.buttonScreenHeader, s.headerButton]}
            disabled={rightButton?.enabled !== undefined ? !rightButton.enabled : false}
            disabledStyle={theme.styles.buttonScreenHeaderDisabled}
            onPress={() => rightButton && rightButton.action ? rightButton.action() : () => { return }}
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
