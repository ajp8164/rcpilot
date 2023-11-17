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
        {...props}
        containerStyle={{...props.containerStyle, ...s.containerStyle}}
      />
      <ExpandableSection expanded={expanded}>
        {ExpandableComponent}
      </ExpandableSection>
    </>
  );
}

const useStyles = makeStyles((_theme, __theme: AppTheme) => ({
  containerStyle: {
    minHeight: 48
  },
}));

export { ListItemSwitch };
