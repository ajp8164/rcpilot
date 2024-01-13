import { AppTheme, useTheme } from "theme";

import CollapsibleView from "@eliav2/react-native-collapsible-view";
import { Icon } from "@rneui/base";
import { Pressable } from "react-native";
import React from "react";
import { Swipeable } from "react-native-gesture-handler";
import { ListItem as _ListItem } from "@react-native-ajp-elements/ui";
import { makeStyles } from "@rneui/themed";
import { useRef } from  'react';

interface Props extends _ListItem {
  drag?: () => void;
  dragEnabled?: boolean;
  editEnabled?: boolean;
  expanded?: boolean;
  ExpandableComponent?: JSX.Element;
  visible?: boolean;
};

const ListItem = (props: Props) => {
  const {
    drag = () => { return },
    dragEnabled = false,
    editEnabled = false,
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
  const swipeable = useRef<Swipeable>(null);

  const openEdit = () => {
    swipeable?.current?.openRight();
  };  

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
          disabled={editEnabled || dragEnabled || props.disabled}
          disabledStyle={{...s.disabled, ...props.disabledStyle}}
          swipeable={swipeable}
          leftImage={editEnabled ? (
            <Pressable
              style={s.editTouchContainer}
              onPress={openEdit}>
              <Icon
                name={'remove-circle'}
                type={'ionicon'}
                size={22}
                color={theme.colors.assertive}
                style={s.editIcon}
              />
            </Pressable>
          ) : props.leftImage}
          rightImage={dragEnabled ? (
            <Pressable
              style={s.dragTouchContainer}
              onPressIn={drag}>
              <Icon
                name={'menu'}
                type={'ionicon'}
                size={22}
                color={theme.colors.midGray}
                style={s.dragIcon}
              />
            </Pressable>
          ) : props.rightImage
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
  dragIcon: {
    justifyContent: 'center',
    height: '100%',
    width: 50,
    left: -12,
  },
  dragTouchContainer: {
    width: 50,
    height: '100%',
    position: 'absolute',
    right: -16,
    paddingLeft: 10,
  },
  editIcon: {
    justifyContent: 'center',
    height: '100%',
    width: 50,
  },
  editTouchContainer: {
    width: 50,
    height: '100%',
    position: 'absolute',
    left: -16,
  },
  value: {
    ...theme.styles.textDim
  },
  valuePosition: {
    paddingRight: 18,
  }
}));

export { ListItem };
