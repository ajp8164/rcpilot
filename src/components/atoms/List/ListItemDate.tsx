import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { AppTheme, useTheme } from "theme";
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';

import CollapsibleView from "@eliav2/react-native-collapsible-view";
import { DateTime } from 'luxon';
import { ISODateString } from 'types/common';
import { ViewStyle } from "react-native";
import { ListItem as _ListItem } from "@react-native-ajp-elements/ui";
import { makeStyles } from "@rneui/themed";
import {useRef} from 'react';

type IOSMode = 'date' | 'time' | 'datetime' | 'countdown';

interface Props extends _ListItem {
  datePickerContainerStyle?: ViewStyle;
  expanded?: boolean;
  expandableContainerStyle?: ViewStyle;
  mode?: IOSMode;
  onDateChange: (date?: Date) => void;
  pickerValue: ISODateString | undefined;
};

const ListItemDate = (props: Props) => {
  const {
    datePickerContainerStyle,
    expanded = false,
    expandableContainerStyle,
    mode = 'datetime',
    onDateChange,
    pickerValue,
  } = props;

  const theme = useTheme();
  const s = useStyles(theme);

  const sectionInitiallyExpanded = useRef(expanded);
  const first = props.position?.includes('first') ?  'first' : undefined;

  return (
    <>
      <_ListItem
        {...props}
        containerStyle={[
          {...props.containerStyle, ...s.containerStyle},
          props.swipeable ? theme.styles.swipeableListItemContainer : {}
        ]}
        position={expanded ? [first] : props.position}
        valueStyle={s.valueStyle}
      />
      <CollapsibleView
        initExpanded={sectionInitiallyExpanded.current}
        expanded={expanded}
        noArrow
        style={[
          s.collapsible,
          expandableContainerStyle,
          props.position?.includes('last') ? s.collapsibleBorder : {}
        ]}
        titleStyle={s.collapsibleTitle}>
          <Animated.View entering={FadeIn} exiting={FadeOut}>
            <DateTimePicker
              mode={mode}
              maximumDate={new Date()}
              style={[s.datePickerContainer, datePickerContainerStyle]}
              accentColor={theme.colors.brandSecondary}
              value={DateTime.fromISO(pickerValue || new Date().toISOString()).toJSDate()}
              onChange={(_event: DateTimePickerEvent, date?: Date) => onDateChange(date)}
            />
          </Animated.View>
      </CollapsibleView>
    </>
    );
  }

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  collapsible: {
    padding: 0,
    marginVertical: 0,
    marginHorizontal: 0,
    borderWidth: 0,
    overflow: 'hidden',
  },
  collapsibleBorder: {
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  collapsibleTitle: {
    height: 0,
  },
  containerStyle: {
    minHeight: 48,
  },
  datePickerContainer: {
    paddingTop: 15,
    right: 15,
  },
  valueStyle: {
    ...theme.styles.textDim
  }
}));

export { ListItemDate };
