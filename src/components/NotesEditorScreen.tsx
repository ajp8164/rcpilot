import React, { useEffect, useState } from 'react';

import { MultipleNavigatorParamList } from 'types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import TextView from 'components/views/TextView';
import { eqString } from 'realmdb/helpers';
import { useEvent } from 'lib/event';
import { useScreenEditHeader } from 'lib/useScreenEditHeader';

export type NotesEditorResult = {
  text: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  extraData?: any;
};

export type Props = NativeStackScreenProps<MultipleNavigatorParamList, 'NotesEditor'>;

const NotesEditorScreen = ({ navigation, route }: Props) => {
  const { title, text, headerButtonStyle, extraData, eventName } = route.params;

  const event = useEvent();
  const setScreenEditHeader = useScreenEditHeader();

  const [newText, setNewText] = useState<string | undefined>(text);

  useEffect(() => {
    const canSave = !eqString(text, newText);

    const onDone = () => {
      event.emit(eventName, {
        text: newText,
        extraData,
      } as NotesEditorResult);
      navigation.goBack();
    };

    setScreenEditHeader(
      { enabled: canSave, action: onDone, style: headerButtonStyle },
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
