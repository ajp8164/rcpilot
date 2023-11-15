import { AppTheme, useTheme } from "theme";
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';

import { Appearance } from 'react-native';
import { DateTime } from 'luxon';
import { ExpandableSection } from 'react-native-ui-lib';
import { ISODateString } from 'types/common';
import { ListItem as _ListItem } from "@react-native-ajp-elements/ui";
import { makeStyles } from "@rneui/themed";

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
  return (
    <>
      <_ListItem
        {...props} 
        valueStyle={s.valueStyle} />
      <ExpandableSection expanded={expanded}>
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
      </ExpandableSection>
    </>
    );
  }

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  valueStyle: {
    ...theme.styles.textDim
  }
}));

export { ListItemDate };
