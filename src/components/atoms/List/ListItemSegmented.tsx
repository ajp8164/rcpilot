import { AppTheme, useTheme } from 'theme';
import React, { useRef } from 'react';

import CollapsibleView from '@eliav2/react-native-collapsible-view';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { View } from 'react-native';
import { ListItem as _ListItem } from '@react-native-ajp-elements/ui';
import { makeStyles } from '@rneui/themed';

export interface ListItemSegmentedInterface extends _ListItem {
  expanded?: boolean;
  ExpandableComponent?: JSX.Element;
  fullWidth?: boolean;
  index?: number;
  onChangeIndex: (index: number) => void;
  segments: string[];
  segmentBackgroundColor?: string;
  segmentTintColor?: string;
}

const ListItemSegmented = (props: ListItemSegmentedInterface) => {
  const {
    expanded = false,
    ExpandableComponent,
    fullWidth = false,
    index = 0,
    onChangeIndex,
    segments,
    segmentBackgroundColor,
    segmentTintColor,
  } = props;

  const theme = useTheme();
  const s = useStyles(theme);

  const sectionInitiallyExpanded = useRef(expanded);
  const first = props.position?.includes('first') ? 'first' : undefined;

  return (
    <>
      <_ListItem
        {...props}
        containerStyle={[
          fullWidth ? s.containerFullWidth : {},
          { ...props.containerStyle, ...s.container },
          props.swipeable ? theme.styles.swipeableListItemContainer : {},
        ]}
        leftContainerStyle={s.containerLeft}
        position={expanded ? [first] : props.position}
        rightImage={false}
        extraContentComponent={
          <View
            style={[s.segmentedView, fullWidth ? s.segmentedViewFullWidth : s.segmentedViewRight]}>
            <SegmentedControl
              values={segments}
              // eslint-disable-next-line react-native/no-inline-styles
              style={[{ width: fullWidth ? '100%' : segments.length * 50 }]}
              tintColor={segmentTintColor || theme.colors.viewAltBackground}
              backgroundColor={segmentBackgroundColor || theme.colors.wispGray}
              fontStyle={s.segmentedFont}
              activeFontStyle={s.segmentedActiveFont}
              enabled={props.disabled !== true}
              selectedIndex={index}
              onChange={event => {
                onChangeIndex(event.nativeEvent.selectedSegmentIndex);
              }}
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
};

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
  containerFullWidth: {
    paddingLeft: 0,
  },
  containerLeft: {
    flex: 0,
  },
  segmentedView: {
    position: 'absolute',
    right: 0,
    alignSelf: 'center',
    zIndex: 1,
  },
  segmentedViewFullWidth: {
    right: 0,
    left: 0,
  },
  segmentedViewRight: {
    paddingRight: 10,
  },
  segmentedFont: {
    fontSize: 12,
    color: theme.colors.text,
  },
  segmentedActiveFont: {
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
}));

export { ListItemSegmented };
