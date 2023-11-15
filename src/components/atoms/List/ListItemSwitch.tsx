import { AppTheme, useTheme } from "theme";

import { ListItemSwitch as _ListItemSwitch } from "@react-native-ajp-elements/ui";
import { makeStyles } from "@rneui/themed";

interface Props extends _ListItemSwitch {};

const ListItemSwitch = (props: Props) => {
  const theme = useTheme();
  const s = useStyles(theme);
  return (
    <_ListItemSwitch
      {...props} />
    );
}

const useStyles = makeStyles((_theme, __theme: AppTheme) => ({
}));

export { ListItemSwitch };
