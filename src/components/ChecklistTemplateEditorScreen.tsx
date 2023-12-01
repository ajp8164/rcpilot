import ChecklistTemplateEditorView from 'components/views/ChecklistTemplateEditorView';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native';
import { SetupNavigatorParamList } from 'types/navigation';
import { useTheme } from 'theme';

export type Props = NativeStackScreenProps<SetupNavigatorParamList, 'ChecklistTemplateEditor'>;

const ChecklistTemplateEditorScreen = ({ route }: Props) => {
  const { checklistTemplateId } = route.params;

  const theme = useTheme();

  return (
    <SafeAreaView
      edges={['left', 'right']}
      style={theme.styles.view}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior={'automatic'}>
        <ChecklistTemplateEditorView checklistTemplateId={checklistTemplateId} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default ChecklistTemplateEditorScreen;
