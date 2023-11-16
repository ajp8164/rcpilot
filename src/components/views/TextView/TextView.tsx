import { AppTheme, useTheme } from 'theme';
import { InputAccessoryView, LayoutChangeEvent, Text, TextInput, View } from 'react-native';
import React, { useContext, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { TextViewMethods, TextViewProps } from './types';

// See https://github.com/react-native-elements/react-native-elements/issues/3202#issuecomment-1505878539
import { Input as BaseInput } from '@rneui/base';
import { Input } from '@rneui/base';
import NavContext from 'components/navigation/NavContext';
import { makeStyles } from '@rneui/themed';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useKeyboardHeight } from 'lib/useKeyboardHeight';

type TextView = TextViewMethods;

const TextView = React.forwardRef<TextView, TextViewProps>((props, ref) => {
  const {
    characterLimit,
    containerStyle,
    onTextChanged,
    placeholder = 'Enter text here',
    value,
  } = props;

  const theme = useTheme();
  const s = useStyles(theme);

  const {isModal} = useContext(NavContext);

  const refInput = useRef<BaseInput & TextInput>(null);
  const [text, setText] = useState(value);
  const [countRemaining, setCountRemaining] = useState(characterLimit);

  const kbHeight = useKeyboardHeight();
  const viewHeight = useRef(0);
  const tabBarHeight = useBottomTabBarHeight();
  const [visibleHeight, setVisibleHeight] = useState(0);

  useEffect(() => {
    if (visibleHeight === 0 && kbHeight > 0)  {
      if (isModal) {
        setVisibleHeight(viewHeight.current - kbHeight);
      } else {
        setVisibleHeight(viewHeight.current + tabBarHeight - kbHeight);
      }
    }
  }, [kbHeight, viewHeight.current]);

  // Open the keyboard after the view has animated in.
  useEffect(() => {
    setTimeout(() => {
      if (refInput.current) {
        refInput.current.focus();
      }
    }, 600);
    return () => { 
      refInput.current?.blur();
    }
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
        { height: visibleHeight || '100%'},
        containerStyle,
      ]}
      onLayout={(event: LayoutChangeEvent) => {
        viewHeight.current = event.nativeEvent.layout.height;
      }}>
      <View>
        <Input
          ref={refInput}
          style={[s.text]}
          inputContainerStyle={{ borderBottomWidth: 0 }}
          // containerStyle={{borderWidth: 1}}
          multiline={true}
          placeholder={placeholder}
           // Positions the error message inside the text area.
           // Needed to remove space taken up by the error message (we don't need it).
          //  Allows to accurately position the bottom of the text input view.
          errorStyle={{marginTop: -10}}
          inputAccessoryViewID={'inputAccessoryViewID'}
          value={text}
          onChangeText={t => {
            setText(t.slice(0, characterLimit));
            characterLimit && setCountRemaining(characterLimit - t.length);
            onTextChanged(t);
          }}
        />
        {characterLimit ? (
        <InputAccessoryView
          nativeID={'inputAccessoryViewID'}>
          <View style={s.remainingView}>
            <Text style={s.remaining}>
              {`Characters left: ${countRemaining}`}
            </Text>
          </View>
        </InputAccessoryView>
        ) : null}
      </View>
    </View>
  );
});

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  view: {
    backgroundColor: theme.colors.viewAltBackground,
  },
  text: {
    ...theme.styles.textNormal,
    textAlignVertical: 'top',
  },
  remainingView: {
    justifyContent: 'center',
    height: 20,
    backgroundColor: theme.colors.wispGray,
  },
  remaining: {
    ...theme.styles.textSmall,
    ...theme.styles.textDim,
    textAlign: 'left',
    paddingLeft: 10,
  },
}));

export default TextView;
