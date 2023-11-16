import { AppTheme, useTheme } from "theme";

import { ExpandableSection } from "react-native-ui-lib";
import { ListItem as _ListItem } from "@react-native-ajp-elements/ui";
import { makeStyles } from "@rneui/themed";

interface Props extends _ListItem {
  expanded?: boolean;
  ExpandableComponent?: JSX.Element;
};

const ListItem = (props: Props) => {
  const { 
    expanded = false,
    ExpandableComponent,
  } = props;

  const theme = useTheme();
  const s = useStyles(theme);
  return (
    <>
    <_ListItem
      {...props}
      containerStyle={{...props.containerStyle, ...s.container}}
      valueStyle={[
        {...props.valueStyle, ...s.value},
        props.disabled ? s.valuePosition : {},
        props.rightImage === undefined && props.value ? {} : s.valuePosition
      ]}
      disabledStyle={s.disabled}
      rightImage={props.disabled === undefined ? props.rightImage : !props.disabled}
    />
    <ExpandableSection expanded={expanded}>
      {ExpandableComponent}
    </ExpandableSection>
  </>);
}

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  container: {
    minHeight: 48
  },
  disabled: {
    backgroundColor: theme.colors.listItem
  },
  value: {
    ...theme.styles.textDim
  },
  valuePosition: {
    paddingRight: 18,
  }
}));

export { ListItem };
