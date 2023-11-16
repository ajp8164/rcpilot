import { AppTheme, useTheme } from "theme";

import { ListItem as _ListItem } from "@react-native-ajp-elements/ui";
import { makeStyles } from "@rneui/themed";

interface Props extends _ListItem {};

const ListItem = (props: Props) => {
  const theme = useTheme();
  const s = useStyles(theme);
  return (
    <_ListItem
      {...props} 
      containerStyle={{...props.containerStyle, ...s.containerStyle}}
      valueStyle={s.valueStyle} />
    );
}

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  containerStyle: {
    minHeight: 48
  },
  valueStyle: {
    ...theme.styles.textDim
  }
}));

export { ListItem };
