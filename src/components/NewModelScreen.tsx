import { AppTheme, useTheme } from 'theme';
import React, { useEffect } from 'react';

import { Button } from '@rneui/base';
import ModelView from 'components/views/ModelView';
import { ModelsNavigatorParamList } from 'types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { makeStyles } from '@rneui/themed';

export type Props = NativeStackScreenProps<ModelsNavigatorParamList, 'NewModel'>;

const NewModelScreen = ({ navigation }: Props) => {  
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

  return (
    <SafeAreaView
      edges={['left', 'right']}
      style={[theme.styles.view, { paddingHorizontal: 0 }]}>
      <ModelView />
    </SafeAreaView>
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

export default NewModelScreen;
