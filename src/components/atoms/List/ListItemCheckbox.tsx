import { AppTheme, useTheme } from "theme";

import { ListItemCheckbox as _ListItemCheckbox } from "@react-native-ajp-elements/ui";
import { makeStyles } from "@rneui/themed";

interface Props extends _ListItemCheckbox {};

const ListItemCheckbox = (props: Props) => {
  const theme = useTheme();
  const s = useStyles(theme);
  return (
    <_ListItemCheckbox
      {...props} />
    );
}

const useStyles = makeStyles((_theme, __theme: AppTheme) => ({
}));

export { ListItemCheckbox };
