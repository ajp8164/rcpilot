import { AppTheme, useTheme } from 'theme';
import { Divider, useListEditor } from '@react-native-ajp-elements/ui';
import { ListItem, listItemPosition, swipeableDeleteItem } from 'components/atoms/List';
import React, { useEffect } from 'react';
import { SectionList, SectionListData, SectionListRenderItem } from 'react-native';
import { useObject, useQuery, useRealm } from '@realm/react';

import { BSON } from 'realm';
import { Button } from '@rneui/base';
import { DateTime } from 'luxon';
import { EmptyView } from 'components/molecules/EmptyView';
import { Event } from 'realmdb/Event';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { Model } from 'realmdb/Model';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SetupNavigatorParamList } from 'types/navigation';
import { groupItems } from 'lib/sectionList';
import { makeStyles } from '@rneui/themed';
import { secondsToMSS } from 'lib/formatters';
import { useConfirmAction } from 'lib/useConfirmAction';

type Section = {
  title?: string;
  data: Event[];
};

export type Props = NativeStackScreenProps<SetupNavigatorParamList, 'Events'>;

const EventsScreen = ({ navigation, route }: Props) => {
  const { modelId } = route.params;

  const theme = useTheme();
  const s = useStyles(theme);

  const listEditor = useListEditor();
  const confirmAction = useConfirmAction();
  const realm = useRealm();

  const model = useObject(Model, new BSON.ObjectId(modelId));
  const allEvents = useQuery(Event, events => { return events.filtered('model == $0', model) }, []);

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => {
        return (
          <Button
            title={listEditor.enabled ? 'Done' : 'Edit'}
            titleStyle={theme.styles.buttonScreenHeaderTitle}
            buttonStyle={[theme.styles.buttonScreenHeader, s.headerButton]}
            disabled={!allEvents.length}
            disabledStyle={theme.styles.buttonScreenHeaderDisabled}
            onPress={listEditor.onEdit}
          />
        );
      },
      headerRight: ()  => {
        return (
          <>
            <Button
              buttonStyle={[theme.styles.buttonScreenHeader, s.headerButton]}
              disabledStyle={theme.styles.buttonScreenHeaderDisabled}
              disabled={listEditor.enabled || !allEvents.length}
              icon={
                <Icon
                  name={'filter'}
                  style={[s.headerIcon,
                    listEditor.enabled || !allEvents.length ? s.headerIconDisabled : {}
                  ]}
                />
              }
              // onPress={() => navigation.navigate('EventFiltersNavigator', {
              //   screen: 'EventFilters'
              // })}
            />
            <Button
              title={listEditor.enabled ? 'Done' : 'Edit'}
              titleStyle={theme.styles.buttonScreenHeaderTitle}
              buttonStyle={[theme.styles.buttonScreenHeader, s.headerButton]}
              disabled={!allEvents.length}
              disabledStyle={theme.styles.buttonScreenHeaderDisabled}
              onPress={listEditor.onEdit}
            />
          </>
        );
      },
    });
  }, [ listEditor.enabled, allEvents ]);

  const deleteEvent = (event: Event) => {
    realm.write(() => {
      realm.delete(event);
    });
  };

  const eventSummary = (event: Event) => {
    const number = `#${event.number}`;
    const duration = `${secondsToMSS(event.duration)}`;
    const time = DateTime.fromISO(event.createdOn).toLocaleString(DateTime.TIME_SIMPLE);
    const location = `${event.location?.name}`;
    const battery = `Battery: ${event.batteryCycle?.battery.name}`;
    
    return `${number}: ${duration} at ${time}, ${location}\n${battery}`;
  };

  const groupEvents = (events: Realm.Results<Event>): SectionListData<Event, Section>[] => {
    return groupItems<Event, Section>(events, (event) => {
      return DateTime.fromISO(event.createdOn).toFormat('MMMM dd,yyyy').toUpperCase();
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
        title={eventSummary(event)}
        titleStyle={s.eventText}
        position={listItemPosition(index, section.data.length)}
        onPress={() => {
          navigation.navigate('EventEditor', {
            eventId: event._id.toString(),
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
          rightItems: [{
            ...swipeableDeleteItem[theme.mode],
            onPress: () => {
              const label = 'Delete Event';
              confirmAction(label, event, deleteEvent);
            }
          }]
        }}
        onSwipeableWillOpen={() => listEditor.onItemWillOpen('events', event._id.toString())}
        onSwipeableWillClose={listEditor.onItemWillClose}
     />
    )
  };

  if (!allEvents.length) {
    return (
      <EmptyView info message={'No Events'} />
    );
  }

  return (
    <SectionList
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior={'automatic'}
      stickySectionHeadersEnabled={true}
      style={[theme.styles.view, s.sectionList]}
      sections={groupEvents(allEvents)}
      keyExtractor={item => item._id.toString()}
      renderItem={renderEvent}
      renderSectionHeader={({section: {title}}) => (
        <Divider text={title} />
      )}
    />
  );
};

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  eventText: {
    left: 15,
    maxWidth: '90%',
  },
  headerButton: {
    justifyContent: 'flex-start',
    paddingHorizontal: 0,
    minWidth: 0,
  },
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
  },}));

export default EventsScreen;