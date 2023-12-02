import { AppTheme, useTheme } from "theme";
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';

import { Appearance } from 'react-native';
import CollapsibleView from "@eliav2/react-native-collapsible-view";
import { DateTime } from 'luxon';
import { ISODateString } from 'types/common';
import { ListItem as _ListItem } from "@react-native-ajp-elements/ui";
import { makeStyles } from "@rneui/themed";
import {useRef} from 'react';

type IOSMode = 'date' | 'time' | 'datetime' | 'countdown';

interface Props extends _ListItem {
  expanded: boolean;
  mode?: IOSMode;
  onDateChange: (date?: Date) => void;
  pickerValue: ISODateString | undefined;
};

const ListItemDate = (props: Props) => {
  const { 
    expanded = false,
    mode = 'datetime',
    onDateChange,
    pickerValue,
  } = props;

  const theme = useTheme();
  const s = useStyles(theme);

  const sectionInitiallyExpanded = useRef(expanded);

  return (
    <>
      <_ListItem
        {...props} 
        containerStyle={{...props.containerStyle, ...s.containerStyle}}
        valueStyle={s.valueStyle}
      />
      <CollapsibleView
        initExpanded={sectionInitiallyExpanded.current}
        expanded={expanded}
        noArrow
        style={s.collapsible} 
        titleStyle={s.collapsibleTitle}>
        <DateTimePicker
          mode={mode}
          maximumDate={new Date()}          
          style={
            Appearance.getColorScheme() !== 'light' ||
            theme.mode !== 'light'
              ? { backgroundColor: `${theme.colors.brandSecondary}60` }
              : { backgroundColor: theme.colors.hintGray }
          }
          accentColor={theme.colors.brandSecondary}
          value={DateTime.fromISO(pickerValue || new Date().toISOString()).toJSDate()}
          onChange={(_event: DateTimePickerEvent, date?: Date) => onDateChange(date)}
        />
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
  },
  collapsibleTitle: {
    height: 0,
  },
  containerStyle: {
    minHeight: 48
  },
  valueStyle: {
    ...theme.styles.textDim
  }
}));

export { ListItemDate };
