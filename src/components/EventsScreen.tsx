import { AppTheme, useTheme } from 'theme';
import {
  ListItem,
  SectionListHeader,
  listItemPosition,
  swipeableDeleteItem,
} from 'components/atoms/List';
import { ModelsNavigatorParamList, SetupNavigatorParamList } from 'types/navigation';
import React, { useEffect, useState } from 'react';
import { SectionList, SectionListData, SectionListRenderItem } from 'react-native';
import { useObject, useRealm } from '@realm/react';

import { BSON } from 'realm';
import { Button } from '@rneui/base';
import { CompositeScreenProps } from '@react-navigation/core';
import CustomIcon from 'theme/icomoon/CustomIcon';
import { DateTime } from 'luxon';
import { EmptyView } from 'components/molecules/EmptyView';
import { Event } from 'realmdb/Event';
import { FilterType } from 'types/filter';
import { Model } from 'realmdb/Model';
import { ModelType } from 'types/model';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { eventKind } from 'lib/modelEvent';
import { groupItems } from 'lib/sectionList';
import { makeStyles } from '@rneui/themed';
import { secondsToMSS } from 'lib/formatters';
import { selectFilters } from 'store/selectors/filterSelectors';
import { useConfirmAction } from 'lib/useConfirmAction';
import { useEventsFilter } from 'lib/modelEvent';
import { useListEditor } from '@react-native-ajp-elements/ui';
import { useSelector } from 'react-redux';

type Section = {
  title?: string;
  data: Event[];
};

export type Props = CompositeScreenProps<
  NativeStackScreenProps<ModelsNavigatorParamList, 'Events'>,
  NativeStackScreenProps<SetupNavigatorParamList>
>;

const EventsScreen = ({ navigation, route }: Props) => {
  const { filterType, batteryId, modelId, pilotId } = route.params;

  const theme = useTheme();
  const s = useStyles(theme);
  const listEditor = useListEditor();
  const confirmAction = useConfirmAction();
  const realm = useRealm();

  const filterId = useSelector(selectFilters(FilterType.EventsModelFilter));
  const events = useEventsFilter({
    filterType: filterType || FilterType.BypassFilter,
    batteryId,
    modelId,
    pilotId,
  });

  const model = useObject(Model, new BSON.ObjectId(modelId));
  const [kind] = useState(eventKind(model?.type));

  useEffect(() => {
    navigation.setOptions({
      // eslint-disable-next-line react/no-unstable-nested-components
      headerRight: () => {
        return (
          <>
            {filterType !== FilterType.BypassFilter && (
              <Button
                buttonStyle={theme.styles.buttonScreenHeader}
                disabledStyle={theme.styles.buttonScreenHeaderDisabled}
                disabled={!filterId && listEditor.enabled}
                icon={
                  <CustomIcon
                    name={filterId ? 'filter-check' : 'filter'}
                    style={[
                      s.headerIcon,
                      listEditor.enabled || !model?.events.length ? s.headerIconDisabled : {},
                    ]}
                  />
                }
                onPress={() =>
                  navigation.navigate('EventFiltersNavigator', {
                    screen: 'EventFilters',
                    params: {
                      filterType: FilterType.EventsModelFilter,
                      modelType: model?.type,
                      useGeneralFilter: true,
                    },
                  })
                }
              />
            )}
            <Button
              title={listEditor.enabled ? 'Done' : 'Edit'}
              titleStyle={theme.styles.buttonScreenHeaderTitle}
              buttonStyle={theme.styles.buttonScreenHeader}
              disabled={!model?.events.length}
              disabledStyle={theme.styles.buttonScreenHeaderDisabled}
              onPress={listEditor.onEdit}
            />
          </>
        );
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterId, listEditor.enabled]);

  const deleteEvent = (event: Event) => {
    realm.write(() => {
      realm.delete(event);
    });
  };

  const eventTitle = (event: Event) => {
    const number = `#${event.number}`;
    const duration = `${secondsToMSS(event.duration, { format: 'm:ss' })}`;
    const time = DateTime.fromISO(event.createdOn).toLocaleString(DateTime.TIME_SIMPLE);
    const location = `${event.location?.name || 'Unknown location'}`;
    return `${number}: ${duration} at ${time}, ${location}`;
  };

  const eventSummary = (event: Event) => {
    let battery = '';
    if (model?.logsBatteries) {
      if (event.batteryCycles.length === 0) {
        battery = 'no batteries used during this event';
      } else if (event.batteryCycles.length === 1) {
        battery = `Battery: ${event.batteryCycles[0].battery.name}`;
      } else {
        battery = `${event.batteryCycles.length} batteries used during this event`;
      }
    }

    let fuel = '';
    if (model?.logsFuel) {
      if (event.fuelConsumed !== undefined) {
        fuel = `Fuel: ${event.fuelConsumed}oz`;
      }
    }
    const summary = `${fuel}${fuel && battery ? ', ' : ''}${battery}`;
    return summary.length ? summary : undefined;
  };

  const groupEvents = (events: Event[]): SectionListData<Event, Section>[] => {
    return groupItems<Event, Section>(events, event => {
      return DateTime.fromISO(event.createdOn).toFormat('MMMM dd, yyyy').toUpperCase();
    }).sort();
  };

  const renderEvent: SectionListRenderItem<Event, Section> = ({
    item: event,
    section,
    index,
  }: {
    item: Event;
    section: Section;
    index: number;
  }) => {
    return (
      <ListItem
        ref={ref => ref && listEditor.add(ref, 'events', event._id.toString())}
        key={event._id.toString()}
        title={eventTitle(event)}
        subtitle={eventSummary(event)}
        titleNumberOfLines={1}
        subtitleNumberOfLines={1}
        position={listItemPosition(index, section.data.length)}
        onPress={() => {
          navigation.navigate('EventEditor', {
            eventId: event._id.toString(),
            modelType: model?.type || ModelType.Airplane,
          });
        }}
        editable={{
          item: {
            icon: 'remove-circle',
            color: theme.colors.assertive,
            action: 'open-swipeable',
          },
          reorder: true,
        }}
        showEditor={listEditor.show}
        swipeable={{
          rightItems: [
            {
              ...swipeableDeleteItem[theme.mode],
              onPress: () =>
                confirmAction(deleteEvent, {
                  label: `Delete ${kind.name}`,
                  title: `This action cannot be undone.\nAre you sure you don't want to log this ${kind.name}?`,
                  value: event,
                }),
            },
          ],
        }}
        onSwipeableWillOpen={() => listEditor.onItemWillOpen('events', event._id.toString())}
        onSwipeableWillClose={listEditor.onItemWillClose}
      />
    );
  };

  if (filterId && !events.length) {
    return <EmptyView message={`No ${eventKind(model?.type).namePlural} Match Your Filter`} />;
  }

  if (!events.length) {
    return <EmptyView info message={`No ${kind.namePlural}`} />;
  }

  return (
    <SectionList
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior={'automatic'}
      stickySectionHeadersEnabled={true}
      style={[theme.styles.view, s.sectionList]}
      sections={groupEvents([...events].reverse())}
      keyExtractor={item => item._id.toString()}
      renderItem={renderEvent}
      renderSectionHeader={({ section: { title } }) => <SectionListHeader title={title} />}
    />
  );
};

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  headerIcon: {
    color: theme.colors.screenHeaderButtonText,
    fontSize: 22,
    marginHorizontal: 10,
  },
  headerIconDisabled: {
    color: theme.colors.disabled,
  },
  sectionList: {
    flex: 1,
    flexGrow: 1,
  },
}));

export default EventsScreen;
