import { AppTheme, useTheme } from "theme";

import Icon from 'react-native-vector-icons/FontAwesome6';
import { ListItemCheckbox as _ListItemCheckbox } from "@react-native-ajp-elements/ui";
import { makeStyles } from '@rneui/themed';

interface Props extends _ListItemCheckbox {};

const ListItemCheckbox = (props: Props) => {
  const theme = useTheme();
  const s = useStyles(theme);

  return (
    <_ListItemCheckbox
      {...props}
      containerStyle={{...props.containerStyle, ...s.containerStyle}}
      checkedIcon={
        <Icon
          name={'check'}
          size={18}
          color={theme.colors.brandPrimary}
        />
      }
      uncheckedIcon={
        <Icon
          name={'check'}
          size={18}
          style={s.uncheckedIcon}
        />
      }
    />
  )
}

const useStyles = makeStyles((_theme, __theme: AppTheme) => ({
  containerStyle: {
    minHeight: 48
  },
  uncheckedIcon: {
    opacity: 0,
  },
}));
export { ListItemCheckbox };
