import { AppTheme, useTheme } from "theme";
import { ColorValue, Pressable } from "react-native";
import React, { useImperativeHandle, useRef } from "react";

import CollapsibleView from "@eliav2/react-native-collapsible-view";
import CustomIcon from "theme/icomoon/CustomIcon";
import Icon from 'react-native-vector-icons/FontAwesome6';
import { ListItem as _ListItem } from "@react-native-ajp-elements/ui";
import { makeStyles } from "@rneui/themed";

interface Props extends _ListItem {
  checked: boolean;
  expanded?: boolean;
  ExpandableComponent?: JSX.Element;
  onPressInfo?: () => void;
  hideInfo?: boolean;
  iconChecked?: string;
  iconUnchecked?: string;
  iconSize?: number;
  iconColor?: ColorValue;
};

export interface ListItemCheckboxInfoMethods {
  resetEditor: () => void;
}

const ListItemCheckboxInfo = React.forwardRef<ListItemCheckboxInfoMethods, Props>((props, ref) => {
  const { 
    checked,
    expanded = false,
    ExpandableComponent,
    onPressInfo,
    hideInfo,
    iconChecked = 'check',
    iconUnchecked = 'check',
    iconSize = 18,
    iconColor,
  } = props;

  const theme = useTheme();
  const s = useStyles(theme);
  const liRef = useRef<ListItemCheckboxInfoMethods>(null);

  const checkIcon = checked ? iconChecked : iconUnchecked;
  const sectionInitiallyExpanded = useRef(expanded);

  useImperativeHandle(ref, () => ({
    //  These functions exposed to the parent component through the ref.
    resetEditor,
  }));

  const resetEditor = () => {
    liRef.current?.resetEditor();
  };

  return (
    <>
      <_ListItem
        ref={liRef}
        {...props}
        containerStyle={[
          {...props.containerStyle, ...s.container},
          props.swipeable ? theme.styles.swipeableListItemContainer : {}
        ]}
        leftImage={
          <Icon
            name={checkIcon}
            size={iconSize}
            color={iconColor}
            solid={checked}
            style={[
              s.icon,
              (checked && (iconChecked === iconUnchecked)) || (iconChecked !== iconUnchecked)
                ? {}
                : s.uncheckedIcon
            ]}
          />
        }
        rightImage={
          <Pressable onPress={onPressInfo}>
            <CustomIcon
              name={'circle-info'}
              size={22}
              color={theme.colors.clearButtonText}
              style={hideInfo ? {opacity: 0} : {opacity: 1}}
            />
          </Pressable>
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
});

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
    minHeight: 48
  },
  icon: {
    paddingRight: 5,
  },
  uncheckedIcon: {
    opacity: 0,
  },
}));

export { ListItemCheckboxInfo };
