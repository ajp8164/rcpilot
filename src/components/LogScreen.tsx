import {
  AgendaList,
  CalendarProvider,
  ExpandableCalendar,
  WeekCalendar,
} from 'react-native-calendars';
import { AppTheme, useTheme } from 'theme';
import { DateData, MarkedDates } from 'react-native-calendars/src/types';
import {
  ListItem,
  SectionListHeader,
  listItemPosition,
} from 'components/atoms/List';
import React, { useEffect, useRef } from 'react';
import {
  SectionListData,
  SectionListRenderItem,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { getTheme, themeColor } from '../mocks/calendarTheme';

import { DateTime } from 'luxon';
import { DayProps } from 'react-native-calendars/src/calendar/day';
import { Divider } from '@react-native-ajp-elements/ui';
import { Event } from 'realmdb/Event';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { LogNavigatorParamList } from 'types/navigation';
import { MarkingProps } from 'react-native-calendars/src/calendar/day/marking';
import { ModelType } from 'types/model';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import isEmpty from 'lodash/isEmpty';
import { makeStyles } from '@rn-vui/themed';
import { BSON } from 'realm';
import { useEventsFilter } from 'lib/modelEvent';
import { FilterType } from 'types/filter';
import { groupItems } from 'lib/sectionList';

// Enable passing specific day mark data through the marked dates.
// This allows the presentation of specific icons on the calendar day to show
// flights or battery cycles.
interface ExtendedMarkingProps extends MarkingProps {
  hasEvent?: boolean;
  hasBatteryCycle?: boolean;
}

type ExtendedMarkedDates = {
  [key: string]: ExtendedMarkingProps;
};

type Section = {
  title?: string;
  data: readonly Event[];
};

const leftArrowIcon = require('theme/img/calendar/previous.png');
const rightArrowIcon = require('theme/img/calendar/next.png');

export type Props = NativeStackScreenProps<LogNavigatorParamList, 'Log'>;

const LogScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const s = useStyles(theme);

  const modelEvents = useEventsFilter({
    filterType: FilterType.EventsModelFilter,
  });

  const groupedEvents = useRef<SectionListData<Event, Section>[]>([]);
  const weekView = false;
  const marked = useRef<ExtendedMarkedDates>({});
  const calendarTheme = useRef(getTheme());
  const todayBtnTheme = useRef({
    todayButtonTextColor: themeColor,
  });

  useEffect(() => {
    groupedEvents.current = groupEvents(modelEvents);
    marked.current = getMarkedDates(groupedEvents.current);
  }, [modelEvents]);

  const groupEvents = (
    events: Realm.Results<Event>,
  ): SectionListData<Event, Section>[] => {
    return groupItems<Event, Section>(events, modelEvent => {
      return modelEvent.date;
    }).sort();
  };

  const getMarkedDates = (groupedEvents: SectionListData<Event, Section>[]) => {
    const marked: ExtendedMarkedDates = {};
    groupedEvents.forEach(event => {
      if (event.data && event.data.length > 0 && !isEmpty(event.data[0])) {
        // Check for flights and/or battery cycles on this day. Return an indication
        // for each in the marked data.
        const hasEvent =
          event.data.findIndex(e => {
            return e && e.model._id === new BSON.ObjectId('1'); // test is temp for testing
          }) >= 0;
        const hasBatteryCycle =
          event.data.findIndex(e => {
            return e && e.batteryCycles.length; // test is temp for testing
          }) >= 0;

        const d = event.data[0].date.split('T')[0];
        marked[d] = { marked: true, hasEvent, hasBatteryCycle };
      }
    });
    return marked;
  };

  // Render a day on the calendar with flight/battery icons as required.
  // For onPress see https://github.com/wix/react-native-calendars/issues/1147
  const renderDay = ({
    date,
    state,
    marking: m,
    onPress,
  }: DayProps & { date?: DateData }) => {
    const marking = m as ExtendedMarkingProps | undefined;
    return (
      <TouchableOpacity onPress={() => onPress && onPress(date)}>
        <View style={s.eventDayContainer}>
          <View
            style={[
              s.eventDayNumberContainer,
              {
                backgroundColor:
                  state === 'selected'
                    ? theme.colors.brandPrimary
                    : theme.colors.transparent,
              },
            ]}>
            <Text
              style={[
                s.eventDayNumber,
                {
                  color:
                    state === 'disabled'
                      ? theme.colors.textDim
                      : state === 'selected'
                        ? theme.colors.stickyWhite
                        : theme.colors.text,
                },
              ]}>
              {date?.day}
            </Text>
          </View>
          <View style={s.eventIcons}>
            {marking?.hasEvent && (
              <View style={s.eventFlightIcon}>
                <Icon
                  name={'plane-up'}
                  size={8}
                  color={theme.colors.stickyWhite}
                />
              </View>
            )}
            {marking?.hasBatteryCycle && (
              <View style={s.eventBatteryIcon}>
                <Icon
                  name={'battery-full'}
                  size={8}
                  color={theme.colors.stickyWhite}
                />
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEventItem: SectionListRenderItem<Event, Section> = ({
    item: logEntry,
    index,
    section,
  }: {
    item: Event;
    section: Section;
    index: number;
  }) => {
    return (
      <ListItem
        key={index}
        title={logEntry.model.name}
        subtitle={logEntry.location?.name}
        position={listItemPosition(index, section.data.length)}
        containerStyle={{ marginHorizontal: 15 }}
        onPress={() => {
          logEntry.model._id
            ? navigation.navigate('EventEditor', {
                eventId: logEntry._id.toString(),
                modelType: ModelType.Car,
              })
            : navigation.navigate('BatteryCycleEditor', {
                batteryId: logEntry.batteryCycles[0]._id.toString(), // TODO
                cycleNumber: 0, // TODO
              });
        }}
      />
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
        <WeekCalendar
          firstDay={1}
          markedDates={marked.current as MarkedDates}
        />
      ) : (
        <ExpandableCalendar
          // hideArrows
          // disablePan
          // hideKnob
          // initialPosition={ExpandableCalendar.positions.OPEN}
          calendarStyle={s.calendar}
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
        sections={groupEvents(modelEvents) as readonly SectionListData<any>[]}
        renderItem={renderEventItem as SectionListRenderItem<any>}
        // scrollToNextEvent
        // sectionStyle={s.section}
        // dayFormat={'yyyy-MM-d'}
        renderSectionHeader={(
          title: string | any, // Lib typing is incorrect
        ) => (
          <SectionListHeader
            title={DateTime.fromISO(title).toFormat('MMMM d, yyyy')}
          />
        )}
      />
      <Divider />
    </CalendarProvider>
  );
};

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  calendar: {
    paddingLeft: 20,
    paddingRight: 20,
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
  eventIcons: {
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
  },
}));

export default LogScreen;
