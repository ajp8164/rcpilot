import React, { useEffect, useRef, useState } from 'react';
import {
  Image,
  Pressable,
  SectionList,
  SectionListData,
  SectionListRenderItem,
  Text,
  View,
} from 'react-native';
import { CalendarProvider, ExpandableCalendar } from 'react-native-calendars';
import { DayProps } from 'react-native-calendars/src/calendar/day';
import { MarkingProps } from 'react-native-calendars/src/calendar/day/marking';
import { CalendarHeaderProps } from 'react-native-calendars/src/calendar/header';
import { CalendarContextProviderImperativeMethods } from 'react-native-calendars/src/expandableCalendar/Context/Provider';
import { DateData, MarkedDates } from 'react-native-calendars/src/types';
import { SvgXml } from 'react-native-svg';

import { ISODateString } from '@react-native-hello/common';
import {
  Divider,
  ListItem,
  ThemeManager,
  getColoredSvg,
  listItemPosition,
  useDevice,
  useTheme,
} from '@react-native-hello/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from 'components/atoms/Button';
import { EmptyView } from 'components/molecules/EmptyView';
import { modelTypeIconProps } from 'lib/model';
import { eventSummary, useEventsFilter } from 'lib/modelEvent';
import { groupItems } from 'lib/sectionList';
import lodash from 'lodash';
import isEmpty from 'lodash/isEmpty';
import {
  BatteryFull,
  ChevronLeft,
  ChevronRight,
  Plane,
} from 'lucide-react-native';
import { DateTime } from 'luxon';
import { Event } from 'realmdb/Event';
import { FilterType } from 'types/filter';
import { ModelType } from 'types/model';
import { LogNavigatorParamList } from 'types/navigation';

const sectionItemHeight = 80;
const sectionHeaderHeight = 54;

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

export type Props = NativeStackScreenProps<LogNavigatorParamList, 'Log'>;

const LogScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const s = useStyles();
  const device = useDevice();

  const modelEvents = useEventsFilter({
    filterType: FilterType.EventsModelFilter,
  });

  const [groupedEvents, setGroupedEvents] = useState<SectionListData<Event>[]>(
    [],
  );
  const [marked, setMarked] = useState<ExtendedMarkedDates>({});
  const [current, setCurrent] = useState<ISODateString>(
    DateTime.now().toISODate(),
  );

  const calendarRef = useRef<CalendarContextProviderImperativeMethods>(null);
  const sectionListRef = useRef<SectionList<Event>>(null);

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => {
        return (
          <Button
            title={'Today'}
            titleStyle={theme.styles.buttonScreenHeaderTitle}
            buttonStyle={theme.styles.buttonScreenHeader}
            onPress={() =>
              calendarRef.current?.setDate(DateTime.now().toISODate())
            }
          />
        );
      },
      headerRight: () => {
        return (
          <View style={s.arrowsContainer}>
            <Button
              buttonStyle={theme.styles.buttonScreenHeader}
              headerRight
              icon={
                <ChevronLeft
                  color={theme.colors.screenHeaderButtonText}
                  size={33}
                />
              }
              onPress={() => subtractMonth()}
            />
            <Button
              buttonStyle={theme.styles.buttonScreenHeader}
              headerRight
              icon={
                <ChevronRight
                  color={theme.colors.screenHeaderButtonText}
                  size={33}
                />
              }
              onPress={() => addMonth()}
            />
          </View>
        );
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, theme]);

  useEffect(() => {
    setGroupedEvents(groupEvents(modelEvents) as SectionListData<Event>[]);
  }, [modelEvents]);

  useEffect(() => {
    const previous = marked;
    const updated = getMarkedDates(groupedEvents);
    if (!lodash.isEqual(previous, updated)) {
      setMarked(updated);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupedEvents, modelEvents, marked]);

  // Scroll the event list to today.
  useEffect(() => {
    const sectionTitle = DateTime.now().toFormat('MMMM dd, yyyy');
    scrollToSection(sectionTitle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupedEvents]);

  const addMonth = () => {
    const newDate = DateTime.fromISO(current).plus({ month: 1 }).toISODate();
    if (newDate) {
      calendarRef.current?.setDate(newDate);
      setCurrent(newDate);
    }
  };

  const subtractMonth = () => {
    const newDate = DateTime.fromISO(current).minus({ month: 1 }).toISODate();
    if (newDate) {
      calendarRef.current?.setDate(newDate);
      setCurrent(newDate);
    }
  };

  const groupEvents = (
    events: Realm.Results<Event>,
  ): SectionListData<Event, Section>[] => {
    return groupItems<Event, Section>(events, modelEvent => {
      return DateTime.fromISO(modelEvent.createdOn).toFormat('MMMM dd, yyyy');
    }).sort();
  };

  const getMarkedDates = (groupedEvents: SectionListData<Event, Section>[]) => {
    const _marked: ExtendedMarkedDates = marked;
    groupedEvents.forEach(event => {
      if (event.data?.length > 0 && !isEmpty(event.data[0])) {
        // Check for events and/or battery cycles on this day. Return an indication
        // for each in the marked data.
        const hasEvent =
          event.data.findIndex(e => {
            return e?.model?._id;
          }) >= 0;
        const hasBatteryCycle =
          event.data.findIndex(e => {
            return e?.batteryCycles.length;
          }) >= 0;

        const d = event.data[0].date.split('T')[0];
        _marked[d] = { marked: true, hasEvent, hasBatteryCycle };
      }
    });
    return _marked;
  };

  const sectionHeaderCount = (flatIndex: number) => {
    let count = 0;
    let currentIndex = 0;
    groupedEvents.forEach(section => {
      if (currentIndex >= flatIndex) return;
      count++;
      currentIndex += section.data.length + 1; // +1 for the header
    });
    return count;
  };

  const getItemLayout = (
    _data: SectionListData<Event>[] | null,
    index: number,
  ) => {
    return {
      length: sectionItemHeight,
      offset:
        sectionItemHeight * index +
        sectionHeaderHeight * sectionHeaderCount(index),
      index,
    };
  };

  const scrollToSection = (sectionName: string) => {
    const sectionIndex = groupedEvents.findIndex(
      section => section.title === sectionName,
    );
    if (sectionIndex !== -1) {
      sectionListRef.current?.scrollToLocation({
        sectionIndex,
        itemIndex: 0,
        animated: true,
        viewPosition: 0,
      });
    }
  };

  // Render a day on the calendar with event/battery icons as required.
  // For onPress see https://github.com/wix/react-native-calendars/issues/1147
  const renderDay = ({
    date,
    state,
    marking: m,
    onPress,
  }: DayProps & { date?: DateData }) => {
    const marking = m as ExtendedMarkingProps | undefined;
    return (
      <Pressable onPress={() => onPress && onPress(date)}>
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
                state === 'selected' ? { fontFamily: theme.fonts.bold } : {},
                {
                  color:
                    state === 'disabled'
                      ? theme.colors.disabled
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
                <Plane color={theme.colors.stickyWhite} size={12} />
              </View>
            )}
            {marking?.hasBatteryCycle && (
              <View style={s.eventBatteryIcon}>
                <BatteryFull color={theme.colors.stickyWhite} size={12} />
              </View>
            )}
          </View>
        </View>
      </Pressable>
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
        key={logEntry._id.toString()}
        title={logEntry.model?.name}
        subtitle={eventSummary(logEntry)}
        subtitleLines={0}
        position={listItemPosition(index, section.data.length)}
        rightContent={'chevron-right'}
        leftContentStyle={{ paddingLeft: 0 }}
        leftContent={
          <View>
            {logEntry.model?.image ? (
              <Image
                source={{ uri: logEntry.model.image }}
                resizeMode={'cover'}
                style={s.modelImage}
              />
            ) : logEntry?.model?.type ? (
              <View style={s.modelSvgContainer}>
                {logEntry.model?.type && (
                  <SvgXml
                    xml={getColoredSvg(
                      modelTypeIconProps[logEntry.model.type]?.name,
                    )}
                    width={s.modelImage.width}
                    height={s.modelImage.height}
                    color={theme.colors.brandSecondary}
                    style={s.modelIcon}
                  />
                )}
              </View>
            ) : null}
          </View>
        }
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

  const CalendarHeader = (props: CalendarHeaderProps) => {
    const { current } = props;
    const monthName =
      current && DateTime.fromISO(current).toFormat('MMMM yyyy');
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return (
      <View>
        <View style={s.calendarHeaderDate}>
          <Text style={[theme.text.h3]}>{monthName}</Text>
        </View>
        {/* Weekday labels */}
        <View style={s.calendarHeaderWeekdays}>
          {weekDays.map(day => (
            <Text key={day} style={s.weekdayLabel}>
              {day}
            </Text>
          ))}
        </View>
      </View>
    );
  };

  return (
    <CalendarProvider ref={calendarRef} date={DateTime.now().toISODate()}>
      <View style={{ marginTop: device.headerBar.height }}>
        <ExpandableCalendar
          key={ThemeManager.name}
          date={DateTime.now().toISODate()}
          headerStyle={{ display: 'none' }}
          customHeader={CalendarHeader}
          onDayPress={day => {
            const sectionTitle = DateTime.fromISO(day.dateString).toFormat(
              'MMMM dd, yyyy',
            );
            scrollToSection(sectionTitle);
          }}
          calendarStyle={s.calendar}
          theme={{
            calendarBackground: theme.colors.viewBackground,
            // @ts-expect-error
            expandableKnobColor: theme.colors.brandPrimary,
          }}
          animateScroll={true}
          firstDay={0}
          markedDates={marked as MarkedDates}
          dayComponent={renderDay}
        />
      </View>
      {/* This view create separation between the scrolling list and the large title header.
      This separation decouples the scrolling list from collapsing the large title header. */}
      <View style={{ borderWidth: 0 }} />
      <SectionList
        ref={sectionListRef}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior={'automatic'}
        stickySectionHeadersEnabled={true}
        bounces={true}
        alwaysBounceVertical={true}
        style={theme.styles.view}
        contentContainerStyle={{ flexGrow: 1 }}
        sections={groupedEvents}
        keyExtractor={item => item._id.toString()}
        getItemLayout={getItemLayout}
        renderItem={renderEventItem as SectionListRenderItem<Event>}
        renderSectionHeader={({ section: { title } }) => (
          <View style={s.sectionHeader}>
            <Divider text={title} />
          </View>
        )}
        ListFooterComponent={<Divider />}
        ListEmptyComponent={
          <EmptyView
            info
            message={'No Events'}
            details={'You have not logged any events yet.'}
          />
        }
      />
    </CalendarProvider>
  );
};

const useStyles = ThemeManager.createStyleSheet(({ theme }) => ({
  arrowsContainer: {
    flexDirection: 'row',
    right: -5,
  },
  calendar: {
    paddingLeft: 5,
    paddingRight: 5,
  },
  calendarHeaderDate: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  calendarHeaderWeekdays: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 6,
  },
  eventDayContainer: {
    alignItems: 'center',
    top: -7,
  },
  eventDayNumberContainer: {
    borderRadius: 30,
    height: 30,
    width: 30,
    justifyContent: 'center',
    alignContent: 'center',
    marginBottom: 5,
  },
  eventDayNumber: {
    ...theme.text.medium,
    textAlign: 'center',
  },
  eventIcons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 26,
    top: -4,
  },
  eventFlightIcon: {
    borderRadius: 15,
    backgroundColor: theme.colors.success,
    width: 15,
    height: 15,
    justifyContent: 'center',
    alignItems: 'center',
    left: -5,
    position: 'absolute',
  },
  eventBatteryIcon: {
    borderRadius: 15,
    backgroundColor: theme.colors.warning,
    width: 15,
    height: 15,
    justifyContent: 'center',
    alignItems: 'center',
    right: -5,
    position: 'absolute',
  },
  modelIcon: {
    transform: [{ rotate: '-45deg' }],
  },
  modelImage: {
    width: 100,
    height: 80,
  },
  modelSvgContainer: {
    backgroundColor: theme.colors.subtleGray,
  },
  sectionHeader: {
    backgroundColor: theme.colors.viewBackground,
  },
  weekdayLabel: {
    ...theme.text.small,
    fontFamily: theme.fonts.bold,
    width: 32,
    textAlign: 'center',
  },
}));

export default LogScreen;
