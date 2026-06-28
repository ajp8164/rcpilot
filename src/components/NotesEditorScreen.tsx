import React, { useEffect, useState } from 'react';
import { View } from 'react-native';

import { useEvent } from '@react-native-hello/core';
import { useHeaderHeight } from '@react-navigation/elements';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HeaderIconButton, headerOptions } from 'components/atoms/navigation';
import TextView from 'components/views/TextView';
import { Check, X } from 'lucide-react-native';
import { MultipleNavigatorParamList } from 'types/navigation';
import { NotesEditorResult } from 'types/notes';

export type Props = NativeStackScreenProps<
  MultipleNavigatorParamList,
  'NotesEditor'
>;

const NotesEditorScreen = ({ navigation, route }: Props) => {
  const { title, text, headerButtonStyle, headerBackgroundColor, extraData, eventName } =
    route.params;

  const event = useEvent();
  const headerHeight = useHeaderHeight();

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

    const buttonColor = headerButtonStyle?.color as string | undefined;

    // When a header background color is provided, use an opaque header.
    // Otherwise use transparent (notes screen content fills behind header).
    const headerStyle = headerBackgroundColor
      ? {
          headerTransparent: false as const,
          headerStyle: { backgroundColor: headerBackgroundColor },
          headerShadowVisible: false,
        }
      : { headerTransparent: true as const };

    navigation.setOptions(
      headerOptions({
        title,
        ...headerStyle,
        left: [
          <HeaderIconButton
            Icon={X}
            color={buttonColor}
            onPress={navigation.goBack}
          />,
        ],
        right: [
          <HeaderIconButton
            Icon={Check}
            color={buttonColor}
            disabled={!canSubmit}
            onPress={onDone}
          />,
        ],
      }),
    );
  }, [
    event,
    eventName,
    extraData,
    headerBackgroundColor,
    headerButtonStyle,
    navigation,
    newText,
    text,
    title,
  ]);

  return (
    <View style={{ flex: 1, paddingTop: headerBackgroundColor ? 0 : headerHeight }}>
      <TextView
        characterLimit={5000}
        placeholder={'Type your notes here.'}
        value={newText}
        onTextChanged={setNewText}
      />
    </View>
  );
};

export default NotesEditorScreen;
