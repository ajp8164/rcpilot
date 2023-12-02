import ChecklistActionEditorView from 'components/views/ChecklistActionEditorView';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native';
import { SetupNavigatorParamList } from 'types/navigation';
import { useTheme } from 'theme';

export type Props = NativeStackScreenProps<SetupNavigatorParamList, 'ChecklistActionEditor'>;

const ChecklistActionEditorScreen = ({ route }: Props) => {
  const { checklistTemplateId, actionIndex } = route.params;

  const theme = useTheme();

  return (
    <SafeAreaView
      edges={['left', 'right']}
      style={theme.styles.view}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior={'automatic'}>
        <ChecklistActionEditorView
          checklistTemplateId={checklistTemplateId}
          actionIndex={actionIndex}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default ChecklistActionEditorScreen;
