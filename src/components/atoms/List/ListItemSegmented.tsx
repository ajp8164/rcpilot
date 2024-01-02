import { AppTheme, useTheme } from "theme";
import { SegmentedControl, SegmentedControlItemProps } from "react-native-ui-lib";

import CollapsibleView from "@eliav2/react-native-collapsible-view";
import { View } from "react-native";
import { ListItem as _ListItem } from "@react-native-ajp-elements/ui";
import { makeStyles } from "@rneui/themed";
import { useRef } from 'react';

export interface ListItemSegmentedInterface extends _ListItem {
  expanded?: boolean;
  ExpandableComponent?: JSX.Element;
  fullWidth?: boolean;
  initialIndex?: number;
  onChangeIndex: (index: number) => void;
  segments: SegmentedControlItemProps[];
};

const ListItemSegmented = (props: ListItemSegmentedInterface) => {
  const {
    expanded = false,
    ExpandableComponent,
    fullWidth = false,
    initialIndex = 0,
    onChangeIndex,
    segments,
    } = props;

  const theme = useTheme();
  const s = useStyles(theme);
  
  const sectionInitiallyExpanded = useRef(expanded);

  return (
    <>
      <_ListItem
        {...props}
        containerStyle={{...props.containerStyle, ...s.container}}
        titleStyle={s.title}
        rightImage={false}
        extraContentComponent={
          <View style={[s.segmentedView, fullWidth ? s.segmentedViewFullWidth : {}]} >
            <SegmentedControl
              initialIndex={initialIndex}
              onChangeIndex={onChangeIndex}
              segments={segments}
              borderRadius={fullWidth ? 9 : 8}
              outlineColor={theme.colors.subtleGray}
              backgroundColor={fullWidth ? theme.colors.subtleGray : theme.colors.viewBackground}
              activeBackgroundColor={theme.colors.white}
              activeColor={theme.colors.text}
              inactiveColor={theme.colors.text}
              style={s.segmented}
              segmentsStyle={fullWidth ? s.segmentsStyle : {}}
              containerStyle={props.disabled ? s.segmentedDisabled : {}}
            />
        </View>
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
  segmented: {
    borderWidth: 0,
    paddingLeft: 1,
    marginRight: -1,
    alignSelf: 'center',
  },
  segmentedDisabled: {
    pointerEvents: 'none',
  },
  segmentedView: {
    position: 'absolute',
    right: 15,
    justifyContent: 'flex-start',
    zIndex: 1,
  },
  segmentedViewFullWidth: {
    right: 0,
    left: 0,
  },
  segmentsStyle: {
    minHeight: 48,
  },
  title: {
    left: -16
  }
}));

export { ListItemSegmented };
