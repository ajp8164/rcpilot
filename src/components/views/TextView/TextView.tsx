import React, {
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  InputAccessoryView,
  LayoutChangeEvent,
  Text,
  View,
} from 'react-native';

import { Input, InputMethods, ThemeManager } from '@react-native-hello/ui';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
// See https://github.com/react-native-elements/react-native-elements/issues/3202#issuecomment-1505878539
import NavContext from 'components/navigation/NavContext';
import { useKeyboardHeight } from 'lib/useKeyboardHeight';

import { TextViewMethods, TextViewProps } from './types';

type TextView = TextViewMethods;

const TextView = React.forwardRef<TextView, TextViewProps>((props, ref) => {
  const {
    characterLimit,
    containerStyle,
    onTextChanged,
    placeholder = 'Enter text here',
    value,
  } = props;

  const s = useStyles();

  const { isModal } = useContext(NavContext);

  const refInput = useRef<InputMethods>(null);
  const [text, setText] = useState(value);
  const [countRemaining, setCountRemaining] = useState(characterLimit);

  const kbHeight = useKeyboardHeight();
  const viewHeight = useRef(0);
  const tabBarHeight = useBottomTabBarHeight();
  const [visibleHeight, setVisibleHeight] = useState(0);

  useEffect(() => {
    if (visibleHeight === 0 && kbHeight > 0) {
      if (isModal) {
        setVisibleHeight(viewHeight.current - kbHeight);
      } else {
        setVisibleHeight(viewHeight.current + tabBarHeight - kbHeight);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <View
      style={[
        s.view,
        // View will initially open to 100% to get the layout height followed by sizing to the visible height.
        { height: visibleHeight || '100%' },
        containerStyle,
      ]}
      onLayout={(event: LayoutChangeEvent) => {
        viewHeight.current = event.nativeEvent.layout.height;
      }}>
      <View>
        <Input
          ref={refInput}
          style={[s.text]}
          inputContainerStyle={s.inputContainer}
          inputStyle={s.input}
          multiline={true}
          placeholder={placeholder}
          inputAccessoryViewID={'inputAccessoryViewID'}
          value={text || ''}
          onChangeText={t => {
            setText(t.slice(0, characterLimit));
            characterLimit && setCountRemaining(characterLimit - t.length);
            onTextChanged(t);
          }}
        />
        {characterLimit ? (
          <InputAccessoryView nativeID={'inputAccessoryViewID'}>
            <View style={s.remainingContainer}>
              <Text
                style={
                  s.remaining
                }>{`Characters left: ${countRemaining}`}</Text>
            </View>
          </InputAccessoryView>
        ) : null}
      </View>
    </View>
  );
});

const useStyles = ThemeManager.createStyleSheet(({ theme }) => ({
  input: {
    height: '100%',
  },
  inputContainer: {
    borderBottomWidth: 0,
  },
  remaining: {
    ...theme.text.small,
    ...theme.styles.textDim,
    textAlign: 'left',
    paddingLeft: 10,
  },
  remainingContainer: {
    justifyContent: 'center',
    height: 20,
    backgroundColor: theme.colors.wispGray,
  },
  text: {
    ...theme.text.normal,
    textAlignVertical: 'top',
  },
  view: {
    backgroundColor: theme.colors.viewAltBackground,
  },
}));

export default TextView;
