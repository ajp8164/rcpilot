import { AppTheme, useTheme } from "theme";

import Icon from 'react-native-vector-icons/FontAwesome6';
import { ListItem as _ListItem } from "@react-native-ajp-elements/ui";
import { makeStyles } from "@rneui/themed";

interface Props extends _ListItem {
  checked: boolean;
  onPressInfo?: () => void;
  hideInfo?: boolean;
};

const ListItemCheckboxInfo = (props: Props) => {
  const { 
    checked,
    onPressInfo,
    hideInfo,
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
          name={'check'}
          size={18}
          style={checked ? {opacity: 1} : {opacity: 0}}
        />
      }
      rightImage={
        <Icon
          name={'circle-info'}
          size={22}
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
