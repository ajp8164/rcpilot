import { AppTheme, useTheme } from 'theme';
import React, { useEffect, useRef, useState } from 'react';

import { Button } from '@rneui/base';
import { EditorState } from 'lib/useEditorOnChange';
import EventStyleEditorView from 'components/views/EventStyleEditorView';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SetupNavigatorParamList } from 'types/navigation';
import { makeStyles } from '@rneui/themed';

export type Props =
  NativeStackScreenProps<SetupNavigatorParamList, 'EventStyleEditor'> |
  NativeStackScreenProps<SetupNavigatorParamList, 'NewEventStyle'>;

const EventStyleEditorScreen = ({ navigation, route }: Props) => {
  const { eventStyleId } = route.params || {};
  const theme = useTheme();
  const s = useStyles(theme);

  console.log('eventStyleId',  eventStyleId);
  const editorView = useRef<EventStyleEditorView>(null);
  const [editorState, setEditorState] = useState<EditorState>({});

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
      headerRight: () => {
        if (editorState?.canSave) {
          return (
            <Button
              title={'Done'}
              titleStyle={theme.styles.buttonClearTitle}
              buttonStyle={[theme.styles.buttonClear, s.doneButton]}
              onPress={onDone}
            />
          )
        }
      },
    });
  }, [editorState.canSave]);

  const onDone = () => {
    editorView.current?.save();
    navigation.goBack();
  };

  return (
    <SafeAreaView
      edges={['left', 'right']}
      style={theme.styles.view}>
      <EventStyleEditorView ref={editorView} eventStyleId={eventStyleId} onChange={ setEditorState } />
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

export default EventStyleEditorScreen;
