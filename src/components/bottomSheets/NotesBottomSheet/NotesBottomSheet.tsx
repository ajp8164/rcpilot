import React, { useImperativeHandle, useRef, useState } from 'react';
import { View } from 'react-native';

import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useEvent } from '@react-native-hello/core';
import { ModalHeader, ThemeManager, useTheme } from '@react-native-hello/ui';
import IconCloseX from 'components/atoms/IconCloseX';
import { NotesEditorResult } from 'types/notes';

import TextView from '../../views/TextView';
import { NotesBottomSheetMethods, NotesBottomSheetProps } from './types';

type NotesBottomSheet = NotesBottomSheetMethods;

const NotesBottomSheet = React.forwardRef<
  NotesBottomSheet,
  NotesBottomSheetProps
>((props, ref) => {
  const { eventName, snapPoints = ['92%'] } = props;

  const theme = useTheme();
  const s = useStyles();
  const event = useEvent();

  const innerRef = useRef<BottomSheet>(null);

  const [text, setText] = useState<string | undefined>();
  const [title, setTitle] = useState<string | undefined>();
  const [textViewHeight, setTextViewHeight] = useState(0);
  const [enableAutoKeyboard, setEnableAutoKeyboard] = useState(false);

  useImperativeHandle(ref, () => ({
    //  These functions exposed to the parent component through the ref.
    dismiss,
    present,
  }));

  const dismiss = () => {
    setEnableAutoKeyboard(false);
    innerRef.current?.close();

    event.emit(eventName, {
      text,
    } as NotesEditorResult);
  };

  const present = (text?: string, title?: string) => {
    if (text) setText(text);
    setTitle(title || 'Notes');
    setEnableAutoKeyboard(true);
    innerRef.current?.expand();
  };

  return (
    <BottomSheet
      ref={innerRef}
      index={-1}
      snapPoints={snapPoints}
      enableHandlePanningGesture={false}
      enableContentPanningGesture={false}
      handleComponent={() => <View style={s.handle} />}>
      <ModalHeader
        title={title}
        size={'small'}
        containerStyle={{ backgroundColor: theme.colors.viewBackground }}
        rightButtonIcon={<IconCloseX />}
        onRightButtonPress={dismiss}
      />
      <View
        style={{ flex: 1 }}
        onLayout={e => setTextViewHeight(e.nativeEvent.layout.height)}>
        <BottomSheetScrollView>
          <TextView
            characterLimit={5000}
            placeholder={'Type your notes here.'}
            enableAutoKeyboard={enableAutoKeyboard}
            value={text}
            onTextChanged={setText}
            height={textViewHeight}
          />
        </BottomSheetScrollView>
      </View>
    </BottomSheet>
  );
});

const useStyles = ThemeManager.createStyleSheet(({ theme }) => ({
  handle: {
    backgroundColor: theme.colors.viewBackground,
    paddingTop: 10,
  },
}));

export { NotesBottomSheet };
