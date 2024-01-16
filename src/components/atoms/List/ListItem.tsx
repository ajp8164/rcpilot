import { AppTheme, useTheme } from "theme";

import CollapsibleView from "@eliav2/react-native-collapsible-view";
import React from "react";
import { ListItem as _ListItem } from "@react-native-ajp-elements/ui";
import { makeStyles } from "@rneui/themed";
import { useRef } from  'react';

interface Props extends _ListItem {
  expanded?: boolean;
  ExpandableComponent?: JSX.Element;
  visible?: boolean;
};

const ListItem = (props: Props) => {
  const {
    expanded = false,
    ExpandableComponent,
    visible = true,
  } = props;

  const theme = useTheme();
  const s = useStyles(theme);

  // If 'visible' is defined (set either t/f) then this instance can be made visible/invisible
  // using the wrapping collapsible.
  const isCollapsible = useRef(visible !== undefined);
  const itemInitiallyExpanded = useRef(visible);
  const sectionInitiallyExpanded = useRef(expanded);

  const renderListItem = () => {
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
          disabled={props.disabled}
          disabledStyle={{...s.disabled, ...props.disabledStyle}}
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
  };

  if (isCollapsible.current) {
    return (
      <CollapsibleView
        initExpanded={itemInitiallyExpanded.current}
        expanded={visible}
        noArrow
        style={s.collapsible} 
        titleStyle={s.collapsibleTitle}>
        {renderListItem()}
      </CollapsibleView>
    );
  } else {
    return renderListItem();
  }
}

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
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
