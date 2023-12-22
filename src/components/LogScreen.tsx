import {AgendaList, CalendarProvider, ExpandableCalendar, WeekCalendar} from 'react-native-calendars';
import { AppTheme, useTheme } from 'theme';
import { Event, EventOutcome } from 'types/event';
import React, { useEffect, useRef } from 'react';
import { SectionListData, Text, View } from 'react-native';
import {getTheme, themeColor} from '../mocks/calendarTheme';

import { DateTime } from 'luxon';
import { Divider } from '@react-native-ajp-elements/ui';
import { ListItem } from 'components/atoms/List';
import { LogNavigatorParamList } from 'types/navigation';
import { MarkedDates } from 'react-native-calendars/src/types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import isEmpty from 'lodash/isEmpty';
import { makeStyles } from '@rneui/themed';

const leftArrowIcon = require('theme/img/calendar/previous.png');
const rightArrowIcon = require('theme/img/calendar/next.png');

export type Props = NativeStackScreenProps<LogNavigatorParamList, 'Log'>;

const LogScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const s = useStyles(theme);

  const events: Event[] = [
    {
      id: '1',
      number: 1,
      outcome: EventOutcome.FourStar,
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
      outcome: EventOutcome.FourStar,
      date: '2023-11-20T03:28:04.651Z',
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
      id: '1.2',
      number: 1,
      outcome: EventOutcome.FourStar,
      date: '2023-11-20T03:28:04.651Z',
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
      id: '2',
      number: 1,
      outcome: EventOutcome.FourStar,
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
      outcome: EventOutcome.FourStar,
      date: '2023-12-19T03:28:04.651Z',
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
      id: '4',
      number: 1,
      outcome: EventOutcome.FourStar,
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
      outcome: EventOutcome.FourStar,
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
      outcome: EventOutcome.FourStar,
      date: '2023-12-22T03:28:04.651Z',
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
      id: '7',
      number: 1,
      outcome: EventOutcome.FourStar,
      date: '2023-12-23T03:28:04.651Z',
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
      id: '8',
      number: 1,
      outcome: EventOutcome.FourStar,
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
  const marked = useRef<MarkedDates>({});
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
    const marked: MarkedDates = {};
    groupedEvents.forEach(event => {
      if (event.data && event.data.length > 0 && !isEmpty(event.data[0])) {
        const d = event.data[0].date.split('T')[0];
        marked[d] = {marked: true};
      }
    });
    return marked;
  };

  return (
    <SafeAreaView
      edges={['left', 'right']}
      style={[theme.styles.view, { paddingHorizontal: 0 }]}>
      <CalendarProvider
        // date={selectedDate}
        date={new Date().toISOString().split('T')[0]}
        // onDateChanged={setSelectedDate}
        // onMonthChange={onMonthChange}
        // disabledOpacity={0.6}
        showTodayButton
        todayBottomMargin={30}
        theme={todayBtnTheme.current}>
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
            // headerStyle={s.sectionHeader} // for horizontal only
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
          showsVerticalScrollIndicator={false}
          contentInsetAdjustmentBehavior={'automatic'}
          stickySectionHeadersEnabled={true}
          keyExtractor={item => item.id}
          sections={groupEvents(events)}
          // contentContainerStyle={{ paddingHorizontal: 15 }}
          renderItem={({ item: logEntry, index, section }) => (
            <ListItem
              key={index}
              title={logEntry.modelId}
              subtitle={logEntry.locationId}
              position={section.data.length === 1 ? ['first', 'last'] : index === 0 ? ['first'] : index === section.data.length - 1 ? ['last'] : []}
              containerStyle={{marginHorizontal: 15}}
              onPress={() => {
                logEntry.modelId
                ? navigation.navigate('FlightDetails', {
                  flightId: logEntry.flightId,
                })
                : navigation.navigate('BatteryCycle', {
                  batteryCycleId: logEntry.batteryCycleId,
                });
              }}
           />
          )}
          // scrollToNextEvent
          // sectionStyle={s.section}
          // dayFormat={'yyyy-MM-d'}
          renderSectionHeader={(title: string | any) => (  // Lib typing is incorrect
            <View style={s.sectionHeaderContainer}>
              <Text style={s.sectionHeader}>
                {DateTime.fromISO(title).toFormat('MMMM d, yyyy')}
              </Text>
            </View>
          )}
        />
        <Divider />
      </CalendarProvider>
    </SafeAreaView>
  );
};

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  calendar: {
    paddingLeft: 20,
    paddingRight: 20
  },
  sectionHeaderContainer: {
    height: 35,
    paddingTop: 12,
    paddingHorizontal: 25,
    backgroundColor: theme.colors.listHeaderBackground,
  },
  sectionHeader: {
    ...theme.styles.textSmall,
    ...theme.styles.textDim
  },
  // section: {
  //   backgroundColor: theme.colors.viewBackground,
  //   color: 'grey',
  //   textTransform: 'capitalize'
  // }
}));

export default LogScreen;
