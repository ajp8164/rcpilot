import { AppTheme, useTheme } from "theme";
import { Text, View } from "react-native";

import Icon from 'react-native-vector-icons/FontAwesome6';
import { ListItemInput as _ListItemInput } from "@react-native-ajp-elements/ui";
import { makeStyles } from "@rneui/themed";

interface Props extends _ListItemInput {
  inputDisabled?: boolean;
  label?: string;
};

const ListItemInput = (props: Props) => {
  const {
    inputDisabled,
    label,
    placeholder,
    title,
  } = props;

  const theme = useTheme();
  const s = useStyles(theme);

  const ts = Array.isArray(props.titleStyle) ?
    props.titleStyle.concat([s.title])
    : props.titleStyle ?
    [s.title, props.titleStyle]
    : [s.title];

  return (
    <_ListItemInput
      {...props}
      containerStyle={{...props.containerStyle, ...s.containerStyle}}
      contentStyle={s.inputContent}
      inputTextStyle={s.inputText}
      titleStyle={ts}
      extraContentComponentRight={
        <View style={{flexDirection: 'row'}}>
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
      } />
  )
}

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  containerStyle: {
    minHeight: 48,
    paddingRight: 0
  },
  inputIcon: {
    top: 0,
    marginLeft: 5,
    color: theme.colors.subtleGray,
  },
  inputIconDisabled: {
    opacity: 0,
  },
  inputIconWithLabel: {
    top: 3,
    color: theme.colors.subtleGray,
  },
  inputIconWithPlaceholder: {
    marginRight: 18,
    color: theme.colors.subtleGray,
  },
  inputContent: {
    minWidth: '50%',
    justifyContent: 'flex-end',
  },
  inputLabel: {
    ...theme.styles.textNormal,
    color: theme.colors.subtleGray,
    marginLeft: 4,
  },
  inputText: {
    ...theme.styles.textDim,
  },
  title: {
    width: 200,
  }
}));

export { ListItemInput };