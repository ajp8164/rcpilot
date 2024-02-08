import { AppTheme, useTheme } from 'theme';
import { NavigationProp, useNavigation } from '@react-navigation/native';

import { Button } from '@rneui/base';
import { MultipleNavigatorParamList } from 'types/navigation';
import type { StackNavigationOptions } from '@react-navigation/stack';
import { makeStyles } from '@rneui/themed';

/**
 * Provides a common screen edit header for the "cancel of done" pattern.
 * Accepts an additional navigation screen options for convenience.
 */
export const useScreenEditHeader = () => {
  const theme = useTheme();
  const s = useStyles(theme);
  const navigation: NavigationProp<MultipleNavigatorParamList> = useNavigation();

  const setScreenEditHeader = (
    canSave: boolean,
    onDone: () => void,
    onCancel?: () => void,
    navigationOpts?: StackNavigationOptions) => {
      
    let options = navigationOpts || {};

    options.headerLeft = () => {
      return (
        <Button
          title={'Cancel'}
          titleStyle={theme.styles.buttonScreenHeaderTitle}
          buttonStyle={[theme.styles.buttonScreenHeader, s.headerButton]}
          onPress={onCancel && onCancel() || navigation.goBack}
        />
      )
    };

    options.headerRight = () => {
      if (canSave) {
        return (
          <Button
            title={'Done'}
            titleStyle={theme.styles.buttonScreenHeaderTitle}
            buttonStyle={[theme.styles.buttonScreenHeader, s.headerButton]}
            onPress={onDone}
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
