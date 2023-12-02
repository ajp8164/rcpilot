import { AppTheme, useTheme } from 'theme';
import React, { useEffect } from 'react';

import { Button } from '@rneui/base';
import ChecklistActionEditorView from 'components/views/ChecklistActionEditorView';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NewChecklistActionNavigatorParamList } from 'types/navigation';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native';
import { makeStyles } from '@rneui/themed';

export type Props = NativeStackScreenProps<NewChecklistActionNavigatorParamList, 'NewChecklistAction'>;

const NewChecklistActionScreen = ({ navigation, route }: Props) => {
  const { checklistTemplateId } = route.params;
  
  const theme = useTheme();
  const s = useStyles(theme);

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => {
        return (
          <Button
            title={'Cancel'}
            titleStyle={theme.styles.buttonClearTitle}
            buttonStyle={[theme.styles.buttonClear, s.cancelButton]}
            onPress={navigation.goBack}
          />
        )
      },
      headerRight: ()  => {
        return (
          <Button
            title={'Done'}
            titleStyle={theme.styles.buttonClearTitle}
            buttonStyle={[theme.styles.buttonClear, s.doneButton]}
            onPress={onDone}
          />
        )
      },
    });
  }, []);

  const onDone = () => {};

  return (
    <SafeAreaView
      edges={['left', 'right']}
      style={theme.styles.view}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior={'automatic'}>
        <ChecklistActionEditorView checklistTemplateId={checklistTemplateId}/>
      </ScrollView>
    </SafeAreaView>
  );
};

const useStyles = makeStyles((_theme, __theme: AppTheme) => ({
  cancelButton: {
    justifyContent: 'flex-start',
    paddingHorizontal: 0,
    minWidth: 0,
  },
  doneButton: {
    justifyContent: 'flex-start',
    paddingHorizontal: 0,
    minWidth: 0,
  },
}));

export default NewChecklistActionScreen;
