import { AppTheme, useTheme } from "theme";

import CustomIcon from "theme/icomoon/CustomIcon";
import Icon from 'react-native-vector-icons/FontAwesome6';
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
  return (
    <>
    <_ListItem
      {...props}
      containerStyle={{...props.containerStyle, ...s.container}}
      leftImage={
        <Icon
          name={checked ? iconChecked : iconUnchecked}
          size={iconSize}
          style={checked ? {opacity: 1} : {opacity: 0}}
        />
      }
      rightImage={
        <CustomIcon
          name={'circle-info'}
          size={22}
          color={theme.colors.screenHeaderBackButton}
          style={hideInfo ? {opacity: 0} : {opacity: 1}}
          onPress={onPressInfo}
        />
      }
  />
  </>);
}

const useStyles = makeStyles((_theme, __theme: AppTheme) => ({
  container: {
    minHeight: 48
  },
}));

export { ListItemCheckboxInfo };
