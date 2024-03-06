import {AgendaList, CalendarProvider, ExpandableCalendar, WeekCalendar} from 'react-native-calendars';
import { AppTheme, useTheme } from 'theme';
import { DateData, MarkedDates } from 'react-native-calendars/src/types';
import { ListItem, SectionListHeader, listItemPosition } from 'components/atoms/List';
import React, { useEffect, useRef } from 'react';
import { SectionListData, Text, TouchableOpacity, View } from 'react-native';
import {getTheme, themeColor} from '../mocks/calendarTheme';

import { DateTime } from 'luxon';
import { DayProps } from 'react-native-calendars/src/calendar/day';
import { Divider } from '@react-native-ajp-elements/ui';
import { Event } from 'realmdb/Event';
import { EventOutcome } from 'types/event';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { LogNavigatorParamList } from 'types/navigation';
import { MarkingProps } from 'react-native-calendars/src/calendar/day/marking';
import { ModelType } from 'types/model';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import isEmpty from 'lodash/isEmpty';
import { makeStyles } from '@rneui/themed';

// Enable passing specific day mark data through the marked dates.
// This allows the presentation of specific icons on the calendar day to show
// flights or battery cycles.
interface ExtendedMarkingProps extends MarkingProps {
  hasEvent?: boolean;
  hasBatteryCycle?: boolean;
};

type ExtendedMarkedDates =  {
  [key: string]: ExtendedMarkingProps;
};

const leftArrowIcon = require('theme/img/calendar/previous.png');
const rightArrowIcon = require('theme/img/calendar/next.png');

export type Props = NativeStackScreenProps<LogNavigatorParamList, 'Log'>;

const LogScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const s = useStyles(theme);

  const events: Event[] = [
    {
      id: '123456789012',
      number: 1,
      outcome: EventOutcome.Star4,
      date: '2023-11-18T03:28:04.651Z',
      duration: '30:25',
      modelId: '1',
      pilotId: '1',
      locationId: '1',
      fuelId: '1',
      propellerId: '1',
      styleId: '1',
      fuelConsumed: 0,
      batteryCycleId: '1',
      notes: '',
    },
    {
      id: '1.1',
      number: 1,
      outcome: EventOutcome.Star4,
      date: '2023-11-20T03:28:04.651Z',
      duration: '30:25',
      modelId: '0',
      pilotId: '1',
      locationId: '1',
      fuelId: '1',
      propellerId: '1',
      styleId: '1',
      fuelConsumed: 0,
      batteryCycleId: '1',
      notes: '',
    },
    {
      id: '1.2',
      number: 1,
      outcome: EventOutcome.Star4,
      date: '2023-11-20T03:28:04.651Z',
      duration: '30:25',
      modelId: '',
      pilotId: '1',
      locationId: '1',
      fuelId: '1',
      propellerId: '1',
      styleId: '1',
      fuelConsumed: 0,
      batteryCycleId: '1',
      notes: '',
    },
    {
      id: '2',
      number: 1,
      outcome: EventOutcome.Star4,
      date: '2023-12-18T03:28:04.651Z',
      duration: '30:25',
      modelId: '1',
      pilotId: '1',
      locationId: '1',
      fuelId: '1',
      propellerId: '1',
      styleId: '1',
      fuelConsumed: 0,
      batteryCycleId: '1',
      notes: '',
    },
    {
      id: '3',
      number: 1,
      outcome: EventOutcome.Star4,
      date: '2023-12-19T03:28:04.651Z',
      duration: '30:25',
      modelId: '',
      pilotId: '1',
      locationId: '1',
      fuelId: '1',
      propellerId: '1',
      styleId: '1',
      fuelConsumed: 0,
      batteryCycleId: '',
      notes: '',
    },
    {
      id: '4',
      number: 1,
      outcome: EventOutcome.Star4,
      date: '2023-12-20T03:28:04.651Z',
      duration: '30:25',
      modelId: '1',
      pilotId: '1',
      locationId: '1',
      fuelId: '1',
      propellerId: '1',
      styleId: '1',
      fuelConsumed: 0,
      batteryCycleId: '1',
      notes: '',
    },
    {
      id: '5',
      number: 1,
      outcome: EventOutcome.Star4,
      date: '2023-12-21T03:28:04.651Z',
      duration: '30:25',
      modelId: '1',
      pilotId: '1',
      locationId: '1',
      fuelId: '1',
      propellerId: '1',
      styleId: '1',
      fuelConsumed: 0,
      batteryCycleId: '1',
      notes: '',
    },
    {
      id: '6',
      number: 1,
      outcome: EventOutcome.Star4,
      date: '2023-12-22T03:28:04.651Z',
      duration: '30:25',
      modelId: '1',
      pilotId: '1',
      locationId: '1',
      fuelId: '1',
      propellerId: '1',
      styleId: '1',
      fuelConsumed: 0,
      batteryCycleId: '',
      notes: '',
    },
    {
      id: '7',
      number: 1,
      outcome: EventOutcome.Star4,
      date: '2023-12-23T03:28:04.651Z',
      duration: '30:25',
      modelId: '',
      pilotId: '1',
      locationId: '1',
      fuelId: '1',
      propellerId: '1',
      styleId: '1',
      fuelConsumed: 0,
      batteryCycleId: '',
      notes: '',
    },
    {
      id: '8',
      number: 1,
      outcome: EventOutcome.Star4,
      date: '2023-12-24T03:28:04.651Z',
      duration: '30:25',
      modelId: '1',
      pilotId: '1',
      locationId: '1',
      fuelId: '1',
      propellerId: '1',
      styleId: '1',
      fuelConsumed: 0,
      batteryCycleId: '1',
      notes: '',
    },
  ];

  const groupedEvents = useRef<SectionListData<Event>[]>([]);
  const weekView = false;
  const marked = useRef<ExtendedMarkedDates>({});
  const calendarTheme = useRef(getTheme());
  const todayBtnTheme = useRef({
    todayButtonTextColor: themeColor
  });

  useEffect(() => {
    groupedEvents.current = groupEvents(events);
    marked.current = getMarkedDates(groupedEvents.current);
  }, [events]);

  const groupEvents = (events: Event[]): SectionListData<Event>[] => {
    const groupedEvents: {
      [key in string]: Event[];
    } = {};

    events.forEach(event => {
      // Calendar wants the group title to be formatted as 'yyyy-MM-dd'.
      const groupTitle = event.date.split('T')[0];
      groupedEvents[groupTitle] = groupedEvents[groupTitle] || [];
      groupedEvents[groupTitle].push(event);
    });

    const eventsSectionData: SectionListData<Event>[] = [];
    Object.keys(groupedEvents).forEach(group => {
      eventsSectionData.push({
        title: group,
        data: groupedEvents[group],
      });
    });
    return eventsSectionData;
  };

  const getMarkedDates = (groupedEvents: SectionListData<Event>[]) => {
    const marked: ExtendedMarkedDates = {};
    groupedEvents.forEach(event => {
      if (event.data && event.data.length > 0 && !isEmpty(event.data[0])) {
        // Check for flights and/or battery cycles on this day. Return an indication
        // fpr each in the marked data.
        const hasEvent = event.data.findIndex(e => {
          return e && e.modelId === '1'; // test is temp for testing
        }) >= 0;
        const hasBatteryCycle = event.data.findIndex(e => {
          return e && e.batteryCycleId === '1'; // test is temp for testing
        }) >= 0;

        const d = event.data[0].date.split('T')[0];
        marked[d] = { marked: true, hasEvent, hasBatteryCycle };
      }
    });
    return marked;
  };

  // Render a day on the calendar with flight/battery icons as required.
  // For onPress see https://github.com/wix/react-native-calendars/issues/1147
  const renderDay = ({date, state, marking: m, onPress}: DayProps & { date?: DateData; }) => {
    const marking = m as ExtendedMarkingProps | undefined;
    return (
      <TouchableOpacity onPress={() => onPress && onPress(date)}>
      <View style={s.eventDayContainer}>
        <View style={[
          s.eventDayNumberContainer,
          {backgroundColor: state === 'selected' ? theme.colors.brandPrimary : theme.colors.transparent}]}>
          <Text style={[
            s.eventDayNumber,
            {color: state === 'disabled' ? theme.colors.textDim : state === 'selected' ? theme.colors.stickyWhite : theme.colors.text,
          }]}>
            {date?.day}
          </Text>
        </View>
        <View style={s.eventIcons}>
          {marking?.hasEvent &&
            <View style={s.eventFlightIcon}>
              <Icon
                name={'plane-up'}
                size={8}
                color={theme.colors.stickyWhite}
              />
            </View>
          }
          {marking?.hasBatteryCycle &&
            <View style={s.eventBatteryIcon}>
              <Icon
                name={'battery-full'}
                size={8}
                color={theme.colors.stickyWhite}
              />
            </View>
          }
        </View>
      </View>
      </TouchableOpacity>
    );
  };

  return (
    <CalendarProvider
      style={[theme.styles.view, { paddingHorizontal: 0 }]}
      // date={selectedDate}
      date={new Date().toISOString().split('T')[0]}
      // onDateChanged={setSelectedDate}
      // onMonthChange={onMonthChange}
      // disabledOpacity={0.6}
      showTodayButton
      todayBottomMargin={30}
      theme={todayBtnTheme.current}>
      {weekView ? (
        <WeekCalendar firstDay={1} markedDates={marked.current as MarkedDates}/>
      ) : (
        <ExpandableCalendar
          // horizontal={false}
          // hideArrows
          // disablePan
          // hideKnob
          // initialPosition={ExpandableCalendar.positions.OPEN}
          // calendarStyle={styles.calendar}
          // headerStyle={s.sectionHeader} // for horizontal only
          // disableWeekScroll
          theme={calendarTheme.current}
          // disableAllTouchEventsForDisabledDays
          firstDay={1}
          markedDates={marked.current as MarkedDates}
          leftArrowImageSource={leftArrowIcon}
          rightArrowImageSource={rightArrowIcon}
          // animateScroll
          // closeOnDayPress={false}
          dayComponent={renderDay}
        />
      )}
      <AgendaList
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior={'automatic'}
        stickySectionHeadersEnabled={true}
        keyExtractor={item => item.id}
        sections={groupEvents(events)}
        renderItem={({ item: logEntry, index, section }) => (
          <ListItem
            key={index}
            title={logEntry.modelId}
            subtitle={logEntry.locationId}
            position={listItemPosition(index, section.data.length)}
            containerStyle={{marginHorizontal: 15}}
            onPress={() => {
              logEntry.modelId
              ? navigation.navigate('EventEditor', {
                eventId: logEntry.eventId,
                modelType: ModelType.Car,
              })
              : navigation.navigate('BatteryCycleEditor', {
                batteryId: logEntry.batteryId,
                cycleNumber: logEntry.batteryCycleNumber,
              });
            }}
          />
        )}
        // scrollToNextEvent
        // sectionStyle={s.section}
        // dayFormat={'yyyy-MM-d'}
        renderSectionHeader={(title: string | any) => (  // Lib typing is incorrect
          <SectionListHeader title={DateTime.fromISO(title).toFormat('MMMM d, yyyy')} />
        )}
      />
      <Divider />
    </CalendarProvider>
  );
};

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  calendar: {
    paddingLeft: 20,
    paddingRight: 20
  },
  eventDayContainer: {
    alignItems: 'center',
  },
  eventDayNumberContainer: {
    borderRadius: 22,
    height: 22,
    width: 22,
    justifyContent: 'center',
    alignContent: 'center',
  },
  eventDayNumber: {
    ...theme.styles.textSmall,
    textAlign: 'center',
  },
  eventIcons:  {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 26,
  },
  eventFlightIcon: {
    borderRadius: 12,
    backgroundColor: theme.colors.success,
    width: 12,
    height: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventBatteryIcon: {
    borderRadius: 12,
    backgroundColor: theme.colors.warning,
    width: 12,
    height: 12,
    justifyContent: 'center',
    alignItems: 'center',
  }
}));

export default LogScreen;
