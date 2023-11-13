import {AgendaList, CalendarProvider, ExpandableCalendar, WeekCalendar} from 'react-native-calendars';
import { AppTheme, useTheme } from 'theme';
import React, { useCallback, useRef } from 'react';
import {getMarkedDates, logEntryItems} from '../mocks/logEntryItems';
import {getTheme, lightThemeColor, themeColor} from '../mocks/calendarTheme';

import LogEntryItem from 'components/molecules/LogEntryItem';
import { SafeAreaView } from 'react-native-safe-area-context';
import { makeStyles } from '@rneui/themed';

const leftArrowIcon = require('theme/img/calendar/previous.png');
const rightArrowIcon = require('theme/img/calendar/next.png');
const ITEMS: any[] = logEntryItems;

const LogScreen = () => {
  const theme = useTheme();
  const s = useStyles(theme);

  const weekView = false;
  const marked = useRef(getMarkedDates());
  const calendarTheme = useRef(getTheme());
  const todayBtnTheme = useRef({
    todayButtonTextColor: themeColor
  });

  const renderItem = useCallback(({item}: any) => {
    return <LogEntryItem item={item}/>;
  }, []);

  return (
    <SafeAreaView
      edges={['left', 'right']}
      style={[theme.styles.view, { paddingHorizontal: 0 }]}
    >
 <CalendarProvider
      date={ITEMS[1]?.title}
      // onDateChanged={onDateChanged}
      // onMonthChange={onMonthChange}
      showTodayButton
      // disabledOpacity={0.6}
      theme={todayBtnTheme.current}
      // todayBottomMargin={16}
    >
      {weekView ? (
        <WeekCalendar firstDay={1} markedDates={marked.current}/>
      ) : (
        <ExpandableCalendar
          // horizontal={false}
          // hideArrows
          // disablePan
          // hideKnob
          // initialPosition={ExpandableCalendar.positions.OPEN}
          // calendarStyle={styles.calendar}
          // headerStyle={styles.header} // for horizontal only
          // disableWeekScroll
          theme={calendarTheme.current}
          // disableAllTouchEventsForDisabledDays
          firstDay={1}
          markedDates={marked.current}
          leftArrowImageSource={leftArrowIcon}
          rightArrowImageSource={rightArrowIcon}
          // animateScroll
          // closeOnDayPress={false}
        />
      )}
      <AgendaList
        sections={ITEMS}
        renderItem={renderItem}
        // scrollToNextEvent
        sectionStyle={s.section}
        // dayFormat={'yyyy-MM-d'}
      />
    </CalendarProvider>


    </SafeAreaView>
  );
};

const useStyles = makeStyles((_theme, __theme: AppTheme) => ({
  calendar: {
    paddingLeft: 20,
    paddingRight: 20
  },
  header: {
    backgroundColor: 'lightgrey'
  },
  section: {
    backgroundColor: lightThemeColor,
    color: 'grey',
    textTransform: 'capitalize'
  }
}));

export default LogScreen;
