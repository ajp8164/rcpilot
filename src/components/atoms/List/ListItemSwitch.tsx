import { AppTheme, useTheme } from "theme";

import { ExpandableSection } from "react-native-ui-lib";
import { ListItemSwitch as _ListItemSwitch } from "@react-native-ajp-elements/ui";
import { makeStyles } from "@rneui/themed";

interface Props extends _ListItemSwitch {
  expanded?: boolean;
  ExpandableComponent?: JSX.Element;
};

const ListItemSwitch = (props: Props) => {
  const { 
    expanded = false,
    ExpandableComponent,
  } = props;

  const theme = useTheme();
  const s = useStyles(theme);
  return (
    <>
      <_ListItemSwitch
        titleStyle={s.title}
        {...props}
        containerStyle={{...props.containerStyle, ...s.container}}
      />
      <ExpandableSection expanded={expanded}>
        {ExpandableComponent}
      </ExpandableSection>
    </>
  );
}

const useStyles = makeStyles((_theme, __theme: AppTheme) => ({
  container: {
    minHeight: 48,
  },
  title: {
    width: '120%',
  }
}));

export { ListItemSwitch };
