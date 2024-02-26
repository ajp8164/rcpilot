import { AppTheme, useTheme } from "theme";

import CollapsibleView from "@eliav2/react-native-collapsible-view";
import { ListItemSwitch as _ListItemSwitch } from "@react-native-ajp-elements/ui";
import { makeStyles } from "@rneui/themed";
import { useRef } from  'react';

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

  const sectionInitiallyExpanded = useRef(expanded);
  const first = props.position?.includes('first') ?  'first' : undefined;

  return (
    <>
      <_ListItemSwitch
        titleStyle={s.title}
        subtitleStyle={s.subtitle}
        {...props}
        containerStyle={{...props.containerStyle, ...s.container}}
        position={expanded ? [first] : props.position}
      />
      <CollapsibleView
        initExpanded={sectionInitiallyExpanded.current}
        expanded={expanded}
        noArrow
        style={s.collapsible} 
        titleStyle={s.collapsibleTitle}>
        {ExpandableComponent}
      </CollapsibleView>
    </>
  );
}

const useStyles = makeStyles((_theme, __theme: AppTheme) => ({
  collapsible: {
    padding: 0,
    marginVertical: 0,
    marginHorizontal: 0,
    borderWidth: 0,
  },
  collapsibleTitle: {
    height: 0,
  },
  container: {
    minHeight: 48,
  },
  title: {
    width: '120%',
  },
  subtitle: {
    width: '120%',
  }
}));

export { ListItemSwitch };
