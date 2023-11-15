import { AppTheme, useTheme } from 'theme';
import React, { useEffect } from 'react';

import { Button } from '@rneui/base';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NewModelNavigatorParamList } from 'types/navigation';
import { SafeAreaView } from 'react-native-safe-area-context';
import TextView from 'components/views/TextView';
import { makeStyles } from '@rneui/themed';

export type Props = NativeStackScreenProps<NewModelNavigatorParamList, 'Notes'>;

const NotesScreen = ({ navigation }: Props) => {  
  const theme = useTheme();
  const s = useStyles(theme);


  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <Button
          title={'Cancel'}
          titleStyle={theme.styles.buttonClearTitle}
          buttonStyle={[theme.styles.buttonClear, s.cancelButton]}
          onPress={navigation.goBack}
        />
      ),
      headerRight: () => (
        <Button
          title={'Save'}
          titleStyle={theme.styles.buttonClearTitle}
          buttonStyle={[theme.styles.buttonClear, s.saveButton]}
          onPress={() => null}
        />
      ),
    });
  }, [navigation]);

  const onTextChanged = (text: string) => {
    console.log(`Notes: ${text}`);
  };

  return (
    <SafeAreaView
      edges={['left', 'right']}
      style={[theme.styles.viewAlt, s.view]}>
        <TextView
          characterLimit={5000}
          onTextChanged={onTextChanged}
        />
    </SafeAreaView>
  );
};

const useStyles = makeStyles((_theme, __theme: AppTheme) => ({
  view: {
    paddingHorizontal: 0,
  },
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
