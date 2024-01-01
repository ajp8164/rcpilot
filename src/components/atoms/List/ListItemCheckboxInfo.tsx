import { AppTheme, useTheme } from "theme";

import CustomIcon from "theme/icomoon/CustomIcon";
import Icon from 'react-native-vector-icons/FontAwesome6';
import { Pressable } from "react-native";
import { ListItem as _ListItem } from "@react-native-ajp-elements/ui";
import { makeStyles } from "@rneui/themed";

interface Props extends _ListItem {
  checked: boolean;
  onPressInfo?: () => void;
  hideInfo?: boolean;
  iconChecked?: string;
  iconUnchecked?: string;
  iconSize?: number;
};

const ListItemCheckboxInfo = (props: Props) => {
  const { 
    checked,
    onPressInfo,
    hideInfo,
    iconChecked = 'check',
    iconUnchecked = '',
    iconSize = 18,
    } = props;

  const theme = useTheme();
  const s = useStyles(theme);

  const checkIcon = checked ? iconChecked : iconUnchecked;
  
  return (
    <_ListItem
      {...props}
      containerStyle={{...props.containerStyle, ...s.container}}
      leftImage={
        checkIcon ?
          <Icon
            name={checkIcon}
            size={iconSize}
          />
        :
          <></>
      }
      rightImage={
        <Pressable onPress={onPressInfo}>
          <CustomIcon
            name={'circle-info'}
            size={22}
            color={theme.colors.screenHeaderBackButton}
            style={hideInfo ? {opacity: 0} : {opacity: 1}}
          />
        </Pressable>
      }
    />
  );
}

const useStyles = makeStyles((_theme, __theme: AppTheme) => ({
  container: {
    minHeight: 48
  },
}));

export { ListItemCheckboxInfo };
