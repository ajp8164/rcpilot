import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { AppTheme, useTheme } from 'theme';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import React from 'react';

import { CollapsibleView } from 'components/atoms/CollapsibleView';
import { DateTime } from 'luxon';
import { ISODateString } from 'types/common';
import { ViewStyle } from 'react-native';
import { ListItem as _ListItem } from '@react-native-ajp-elements/ui';
import { makeStyles } from '@rn-vui/themed';

type IOSMode = 'date' | 'time' | 'datetime' | 'countdown';

interface Props extends _ListItem {
  datePickerContainerStyle?: ViewStyle;
  expanded?: boolean;
  expandableContainerStyle?: ViewStyle;
  mode?: IOSMode;
  onDateChange: (date?: Date) => void;
  pickerValue: ISODateString | undefined;
}

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

  const first = props.position?.includes('first') ? 'first' : undefined;

  return (
    <>
      <_ListItem
        {...props}
        containerStyle={[
          { ...props.containerStyle, ...s.containerStyle },
          props.swipeable ? theme.styles.swipeableListItemContainer : {},
        ]}
        position={expanded ? [first] : props.position}
        valueStyle={s.valueStyle}
      />
      <CollapsibleView
        expanded={expanded}
        style={[
          expandableContainerStyle || {},
          props.position?.includes('last') ? s.collapsibleBorder : {},
        ]}>
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
};

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  collapsibleBorder: {
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  containerStyle: {
    minHeight: 48,
  },
  datePickerContainer: {
    paddingTop: 15,
    right: 15,
  },
  valueStyle: {
    ...theme.styles.textDim,
  },
}));

export { ListItemDate };
