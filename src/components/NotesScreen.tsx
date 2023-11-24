import { AppTheme, useTheme } from 'theme';
import React, { useEffect } from 'react';

import { Button } from '@rneui/base';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NewModelNavigatorParamList } from 'types/navigation';
import TextView from 'components/views/TextView';
import { makeStyles } from '@rneui/themed';

export type Props = NativeStackScreenProps<NewModelNavigatorParamList, 'Notes'>;

const NotesScreen = ({ navigation, route }: Props) => {  
  const theme = useTheme();
  const s = useStyles(theme);

  useEffect(() => {
    route.params.title && navigation.setOptions({
      title: route.params.title,
    });
    
    navigation.setOptions({
      headerLeft: () => (
        <Button
          title={'Cancel'}
          titleStyle={[theme.styles.buttonClearTitle, route.params.headerButtonStyle]}
          buttonStyle={[theme.styles.buttonClear, s.cancelButton]}
          onPress={navigation.goBack}
        />
      ),
      headerRight: () => (
        <Button
          title={'Save'}
          titleStyle={[theme.styles.buttonClearTitle, route.params.headerButtonStyle]}
          buttonStyle={[theme.styles.buttonClear, s.saveButton]}
          onPress={() => null}
        />
      ),
    });
  }, []);

  const onTextChanged = (text: string) => {
    console.log(`Notes: ${text}`);
  };

  return (
    <TextView
      characterLimit={5000}
      placeholder={'Type your notes here.'}
      onTextChanged={onTextChanged}
    />
  );
};

const useStyles = makeStyles((_theme, __theme: AppTheme) => ({
  cancelButton: {
    justifyContent: 'flex-start',
    paddingHorizontal: 0,
    minWidth: 0,
  },
  saveButton: {
    justifyContent: 'flex-start',
    paddingHorizontal: 0,
    minWidth: 0,
  },
}));


export default NotesScreen;
