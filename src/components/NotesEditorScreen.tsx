import React, { useEffect, useState } from 'react';

import { useEvent } from '@react-native-hello/core';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import TextView from 'components/views/TextView';
import { useScreenEditHeader } from 'lib/useScreenEditHeader';
import { MultipleNavigatorParamList } from 'types/navigation';
import { NotesEditorResult } from 'types/notes';

export type Props = NativeStackScreenProps<
  MultipleNavigatorParamList,
  'NotesEditor'
>;

const NotesEditorScreen = ({ navigation, route }: Props) => {
  const { title, text, headerButtonStyle, extraData, eventName } = route.params;

  const event = useEvent();
  const setScreenEditHeader = useScreenEditHeader();

  const [newText, setNewText] = useState<string | undefined>(text);

  useEffect(() => {
    const canSubmit = text !== newText;

    const onDone = () => {
      event.emit(eventName, {
        text: newText,
        extraData,
      } as NotesEditorResult);
      navigation.goBack();
    };

    setScreenEditHeader(
      { enabled: canSubmit, action: onDone, style: headerButtonStyle },
      { style: headerButtonStyle },
      title ? { title } : {},
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

export default NotesEditorScreen;
