import { AppTheme, useTheme } from 'theme';
import { LayoutChangeEvent, Text, TextInput, View } from 'react-native';
import React, { useEffect, useImperativeHandle, useRef, useState } from 'react';
import { TextViewMethods, TextViewProps } from './types';

// See https://github.com/react-native-elements/react-native-elements/issues/3202#issuecomment-1505878539
import { Input as BaseInput } from '@rneui/base';
import { Input } from '@rneui/base';
import { makeStyles } from '@rneui/themed';
import { useKeyboardHeight } from 'lib/useKeyboardHeight';

const REMAINING_VIEW_HEIGHT = 20;
const INPUT_VERTICAL_MARGIN = 5;

type TextView = TextViewMethods;

const TextView = React.forwardRef<TextView, TextViewProps>((props, ref) => {
  const {
    characterLimit = 0,
    containerStyle,
    onTextChanged,
    placeholder = 'Enter text here',
    value,
  } = props;

  const theme = useTheme();
  const s = useStyles(theme);

  const refInput = useRef<BaseInput & TextInput>(null);
  const [text, setText] = useState(value);
  const [countRemaining, setCountRemaining] = useState(characterLimit);

  const kbHeight = useKeyboardHeight();
  const viewHeight = useRef(0);
  const [visibleHeight, setVisibleHeight] = useState(0);

  useEffect(() => {
    if (visibleHeight === 0 && kbHeight > 0)  {
      setVisibleHeight(viewHeight.current - kbHeight - REMAINING_VIEW_HEIGHT - INPUT_VERTICAL_MARGIN);
    }
  }, [kbHeight, viewHeight.current]);

  // Open the keyboard after the view has animated in.
  useEffect(() => {
    setTimeout(() => {
      if (refInput.current) {
        refInput.current.focus();
      }
    }, 600);
  }, []);

  useImperativeHandle(ref, () => ({
    //  These functions exposed to the parent component through the ref.
    getText,
  }));

  const getText = () => {
    return text;
  };

  return (
    <>
      {characterLimit ? (
        <View  style={s.remainingView}>
          <Text style={s.remaining}>{`Characters left: ${countRemaining}`}</Text>
        </View>
      ) : null}
      <View
        onLayout={(event: LayoutChangeEvent) => {
          viewHeight.current = event.nativeEvent.layout.height;
        }}
        style={[
          theme.styles.viewAlt,
          s.view,
          // View will initially open to 100% to get the layout height followed by sizing to the visible height.
          { height: visibleHeight || '100%'},
          containerStyle,
        ]}>
        <Input
          ref={refInput}
          style={[s.text]}
          inputContainerStyle={{ borderBottomWidth: 0 }}
          multiline={true}
          placeholder={placeholder}
          value={text}
          onChangeText={t => {
            setText(t.slice(0, characterLimit));
            setCountRemaining(characterLimit - t.length);
            onTextChanged(t);
          }}
        />
      </View>
    </>
  );
});

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  view: {
    paddingHorizontal: 5,
  },
  text: {
    ...theme.styles.textNormal,
    textAlignVertical: 'top',
  },
  remainingView: {
    justifyContent: 'center',
    height: REMAINING_VIEW_HEIGHT,
    backgroundColor: theme.colors.wispGray
  },
  remaining: {
    ...theme.styles.textSmall,
    ...theme.styles.textDim,
    textAlign: 'left',
    paddingLeft: 15,
  },
}));

export default TextView;
