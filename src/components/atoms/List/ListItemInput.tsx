import { AppTheme, useTheme } from "theme";
import { Text, View } from "react-native";

import Icon from 'react-native-vector-icons/FontAwesome6';
import { ListItemInput as _ListItemInput } from "@react-native-ajp-elements/ui";
import { makeStyles } from "@rneui/themed";

interface Props extends _ListItemInput {
  label?: string;
};

const ListItemInput = (props: Props) => {
  const {
    inputDisabled,
    label
  } = props;

  const theme = useTheme();
  const s = useStyles(theme);

  return (
    <_ListItemInput
      {...props}
      inputTextStyle={s.inputText}
      containerStyle={s.inputContainer}
      extraContentComponentRight={
        <View style={{flexDirection: 'row'}}>
          {label && <Text style={s.inputLabel}>{label}</Text>}
          <Icon
            name={'pencil'}
            style={[
              label ? s.inputIconWithLabel : s.inputIcon,
              inputDisabled ? s.inputIconDisabled : {},
            ]}
          />
        </View>
      } />
  )
}

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  inputContainer: {
    paddingRight: 0
  },
  inputIcon: {
    top: -4.5,
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
  inputLabel: {
    ...theme.styles.textNormal,
    color: theme.colors.subtleGray,
    marginHorizontal: 4
  },
  inputText: {
    ...theme.styles.textDim,
  },
}));

export { ListItemInput };