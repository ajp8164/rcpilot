import React, { useEffect, useState } from 'react';

import { MultipleNavigatorParamList } from 'types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import TextView from 'components/views/TextView';
import { eqString } from 'realmdb/helpers';
import { useEvent } from 'lib/event';
import { useScreenEditHeader } from 'lib/useScreenEditHeader';

export type Props = NativeStackScreenProps<MultipleNavigatorParamList, 'Notes'>;

const NotesScreen = ({ navigation, route }: Props) => {
  const { title, text, eventName } = route.params;

  const event = useEvent();
  const setScreenEditHeader = useScreenEditHeader();

  const [newText, setNewText] = useState<string | undefined>(text);
  
  useEffect(() => {
    const canSave = !eqString(text, newText);

    const onDone = () => {
      event.emit(eventName, newText);
      navigation.goBack();
    };

    setScreenEditHeader({condition: canSave, action: onDone}, undefined, {title});
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

export default NotesScreen;
