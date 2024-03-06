import { AppTheme, useTheme } from "theme";
import React, { useImperativeHandle } from "react";
import { ListItem as _ListItem, ListItemMethods as _ListItemMethods } from "@react-native-ajp-elements/ui";

import CollapsibleView from "@eliav2/react-native-collapsible-view";
import CustomIcon from 'theme/icomoon/CustomIcon';
import { Icon } from "@rneui/base";
import { Pressable } from "react-native";
import { makeStyles } from "@rneui/themed";
import { useRef } from  'react';

interface Props extends _ListItem {
  expanded?: boolean;
  ExpandableComponent?: JSX.Element;
  onPressInfo?: () => void;
  showInfo?: boolean;
  visible?: boolean;
};

export interface ListItemMethods {
  resetEditor: () => void;
}

const ListItem = React.forwardRef<ListItemMethods, Props>((props, ref) => {
  const {
    expanded = false,
    ExpandableComponent,
    onPressInfo,
    showInfo,
    visible = true,
  } = props;

  const theme = useTheme();
  const s = useStyles(theme);

  // If 'visible' is defined (set either t/f) then this instance can be made visible/invisible
  // using the wrapping collapsible.
  const isCollapsible = useRef(visible !== undefined);
  const itemInitiallyExpanded = useRef(visible);
  const sectionInitiallyExpanded = useRef(expanded);
  const first = props.position?.includes('first') ?  'first' : undefined;

  const liRef = useRef<_ListItemMethods>(null);

  useImperativeHandle(ref, () => ({
    //  These functions exposed to the parent component through the ref.
    resetEditor,
  }));

  const resetEditor = () => {
    liRef.current?.resetEditor();
  };

  const renderListItem = () => {
    return (
      <>
        <_ListItem
          ref={liRef}
          {...props}
          containerStyle={[
            {...props.containerStyle, ...s.container},
            props.swipeable ? theme.styles.swipeableListItemContainer : {}
          ]}
          valueStyle={[
            {...props.valueStyle, ...s.value},
            props.disabled ? s.valuePosition : {},
            (props.rightImage === undefined || props.rightImage === true) && props.value ? {} : s.valuePosition
          ]}
          position={expanded ? [first] : props.position}
          disabled={props.disabled}
          disabledStyle={{...s.disabled, ...props.disabledStyle}}
          rightImage={
            showInfo && onPressInfo ?
              <Pressable
                style={s.infoPressable}
                onPress={onPressInfo}>
                <CustomIcon
                  name={'circle-info'}
                  size={20}
                  color={theme.colors.clearButtonText}
                  style={{right: 5}}
                />
                <Icon
                  name={'chevron-forward'}
                  type={'ionicon'}
                  size={20}
                  color={theme.colors.midGray}
                />
              </Pressable>            
            : 
              props.rightImage
          }
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
});

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
    backgroundColor: theme.colors.listItem,
  },
  infoPressable: {
    flexDirection: 'row',
    height: '100%',
    alignItems: 'center',
  },
  value: {
    ...theme.styles.textDim,
  },
  valuePosition: {
    paddingRight: 25,
  }
}));

export { ListItem };
