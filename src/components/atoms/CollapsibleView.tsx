import { AppTheme, useTheme } from "theme";
import { ReactNode, useRef } from "react";

import  _CollapsibleView from "@eliav2/react-native-collapsible-view";
import { makeStyles } from "@rneui/themed";

interface Props {
  children: ReactNode | ReactNode[];
  expanded?: boolean;
};

const CollapsibleView = (props: Props) => {
  const {
    children,
    expanded = true,
  } = props;

  const theme = useTheme();
  const s = useStyles(theme);
  const sectionInitiallyExpanded = useRef(expanded);

  return (
    <_CollapsibleView
      initExpanded={sectionInitiallyExpanded.current}
      expanded={expanded}
      style={s.collapsible}
      titleStyle={s.collapsibleTitle}
      noArrow>
        <>{children}</>
    </_CollapsibleView>
  );
}

const useStyles = makeStyles((_theme, __theme: AppTheme) => ({
  collapsible: {
    padding: 0,
    marginVertical: 0,
    marginHorizontal: 0,
    borderWidth: 0,
    overflow: 'hidden',
  },
  collapsibleTitle: {
    height: 0,
  },
}));

export { CollapsibleView };
