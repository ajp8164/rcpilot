import { AppTheme, useTheme } from 'theme';
import React, { useImperativeHandle } from 'react';
import { Text, View } from 'react-native';

import Icon from 'react-native-vector-icons/FontAwesome6';
import { ListItemInput as _ListItemInput } from '@react-native-ajp-elements/ui';
import { makeStyles } from '@rneui/themed';
import { useState } from 'react';

// Uncontrolled component. The `value` property acts as an initial value only.
// To change the value from outside this component create a ref on the component
// instance and call setValue(value: string).
//
// This prevents typing from causing parent re-renders on every key press.

interface Props extends Omit<_ListItemInput, 'value'> {
  inputDisabled?: boolean;
  label?: string;
  onChangeText: (value?: string) => void;
  value?: string;
}

export interface ListItemInputMethods {
  setValue: (value?: string) => void;
}

const ListItemInput = React.forwardRef<ListItemInputMethods, Props>((props, ref) => {
  const {
    inputDisabled,
    label,
    onChangeText: onUpdate,
    placeholder,
    title,
    value: initialValue,
  } = props;

  const theme = useTheme();
  const s = useStyles(theme);

  const [value, setValue] = useState<string | undefined>(initialValue);

  useImperativeHandle(ref, () => ({
    //  These functions exposed to the parent component through the ref.
    setValue,
  }));

  const handleChange = (text: string) => {
    setValue(text.length ? text : undefined);
    onUpdate(text.length ? text : undefined);
    // onUpdate(text);
  };

  const ts = Array.isArray(props.titleStyle)
    ? props.titleStyle.concat([s.title])
    : props.titleStyle
      ? [s.title, props.titleStyle]
      : [s.title];

  return (
    <_ListItemInput
      {...props}
      containerStyle={{ ...props.containerStyle, ...s.containerStyle }}
      contentStyle={s.inputContent}
      inputTextStyle={s.inputText}
      titleStyle={ts}
      value={value}
      placeholderTextColor={props.placeholderTextColor || theme.colors.text}
      onChangeText={handleChange}
      extraContentComponentRight={
        <View style={s.extraComponentContainer}>
          {label && <Text style={s.inputLabel}>{label}</Text>}
          <Icon
            name={'pencil'}
            size={18}
            style={[
              label ? s.inputIconWithLabel : s.inputIcon,
              placeholder && !title ? s.inputIconWithPlaceholder : s.inputIcon,
              inputDisabled ? s.inputIconDisabled : {},
            ]}
          />
        </View>
      }
    />
  );
});

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  containerStyle: {
    minHeight: 48,
    paddingRight: 0,
  },
  extraComponentContainer: {
    flexDirection: 'row',
  },
  inputIcon: {
    top: 0,
    marginLeft: 5,
    color: theme.colors.lightGray,
  },
  inputIconDisabled: {
    opacity: 0,
  },
  inputIconWithLabel: {
    top: 3,
    color: theme.colors.lightGray,
  },
  inputIconWithPlaceholder: {
    marginRight: 18,
    color: theme.colors.lightGray,
  },
  inputContent: {
    minWidth: '50%',
    justifyContent: 'flex-end',
  },
  inputLabel: {
    ...theme.styles.textNormal,
    color: theme.colors.textDim,
    marginLeft: 4,
  },
  inputText: {
    ...theme.styles.textDim,
  },
  title: {
    width: 200,
  },
}));

export { ListItemInput };
