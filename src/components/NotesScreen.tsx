import { AppTheme, useTheme } from 'theme';
import React, { useEffect, useState } from 'react';

import { Button } from '@rneui/base';
import { MultipleNavigatorParamList } from 'types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import TextView from 'components/views/TextView';
import { makeStyles } from '@rneui/themed';
import { useEvent } from 'lib/event';

export type Props = NativeStackScreenProps<MultipleNavigatorParamList, 'Notes'>;

const NotesScreen = ({ navigation, route }: Props) => {
  const { title, text, eventName } = route.params;

  const theme = useTheme();
  const s = useStyles(theme);
  const event = useEvent();

  const [newText, setNewText] = useState<string | undefined>(text);
  
  useEffect(() => {
    navigation.setOptions({
      title,
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
          onPress={save}
        />
      ),
    });

    const save = () => {
      console.log(newText);
      event.emit(eventName, newText);
      navigation.goBack();
    };
  
  }, [newText]);

  return (
    <TextView
      characterLimit={5000}
      placeholder={'Type your notes here.'}
      value={newText}
      onTextChanged={setNewText}
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
