import React, { useEffect, useRef, useState } from 'react';
import {
  LayoutRectangle,
  SectionList,
  SectionListData,
  SectionListRenderItem,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';

import {
  Divider,
  ListEditor,
  ListEditorMethods,
  ListEditorState,
  ListItemSwipeable,
  ThemeManager,
  listItemPosition,
  useTheme,
} from '@react-native-hello/ui';
import { CompositeScreenProps } from '@react-navigation/core';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useObject, useRealm } from '@realm/react';
import {
  HeaderButton,
  HeaderIconButton,
  headerOptions,
} from 'components/atoms/navigation';
import { EmptyView } from 'components/molecules/EmptyView';
import {
  eventKind,
  eventPower,
  eventSummary,
  useEventsFilter,
} from 'lib/modelEvent';
import { groupItems } from 'lib/sectionList';
import { useConfirmAction } from 'lib/useConfirmAction';
import { CircleMinus, Funnel, FunnelPlus, Trash2 } from 'lucide-react-native';
import { DateTime } from 'luxon';
import { BSON } from 'realm';
import { Event } from 'realmdb/Event';
import { Model } from 'realmdb/Model';
import { selectFilters } from 'store/selectors/filterSelectors';
import { FilterType } from 'types/filter';
import {
  ModelsNavigatorParamList,
  SetupNavigatorParamList,
} from 'types/navigation';

type Section = {
  title?: string;
  data: Event[];
};

export type Props = CompositeScreenProps<
  NativeStackScreenProps<ModelsNavigatorParamList, 'Events'>,
  NativeStackScreenProps<SetupNavigatorParamList>
>;

const EventsScreen = ({ navigation, route }: Props) => {
  const {
    filterType,
    batteryId,
    commanderId,
    eventStyleId,
    locationId,
    modelId,
    readOnly,
  } = route.params;

  const theme = useTheme();
  const s = useStyles();
  const confirmAction = useConfirmAction();
  const realm = useRealm();

  const filterId = useSelector(selectFilters(FilterType.EventsModelFilter));
  const events = useEventsFilter({
    filterType: filterType || FilterType.BypassFilter,
    batteryId,
    commanderId,
    eventStyleId,
    locationId,
    modelId,
  });

  const model = useObject(Model, new BSON.ObjectId(modelId));
  const kind = eventKind(model?.type);

  const listEditorRef = useRef<ListEditorMethods>(null);
  const [listEditorState, setListEditorState] = useState<ListEditorState>();
  const [listLayout, setListLayout] = useState<LayoutRectangle>();

  useEffect(() => {
    navigation.setOptions(
      headerOptions({
        right: readOnly
          ? []
          : [
              filterType !== FilterType.BypassFilter ? (
                <HeaderIconButton
                  disabled={
                    (!filterId && !model?.events.length) ||
                    listEditorState?.enabled
                  }
                  Icon={filterId ? FunnelPlus : Funnel}
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
              ) : (
                <></>
              ),
              <HeaderButton
                label={listEditorState?.enabled ? 'Done' : 'Edit'}
                disabled={!events.length}
                onPress={() => listEditorRef.current?.onToggleEditMode()}
              />,
            ],
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterId, listEditorState?.enabled]);

  const deleteEvent = (eventId: string) => {
    const event = realm.objectForPrimaryKey(Event, new BSON.ObjectId(eventId));
    if (event?.isValid()) {
      realm.write(() => {
        realm.delete(event);
      });
    }
  };

  const groupEvents = (events: Event[]): SectionListData<Event, Section>[] => {
    return groupItems<Event, Section>(events, event => {
      return DateTime.fromISO(event.createdOn)
        .toFormat('MMMM dd, yyyy')
        .toUpperCase();
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
      <ListItemSwipeable
        key={event._id.toString()}
        title={eventSummary(event, { includeNumber: true })}
        subtitle={eventPower(event)}
        position={listItemPosition(index, section.data.length)}
        rightContent={readOnly ? undefined : 'chevron-right'}
        listEditor={listEditorRef.current}
        onPress={() => {
          if (!readOnly) {
            navigation.navigate('EventEditor', {
              eventId: event._id.toString(),
              modelType: model?.type,
            });
          }
        }}
        swipeEnabled={!readOnly}
        showEditor={listEditorState?.show}
        editAction={{
          ButtonComponent: <CircleMinus color={theme.colors.assertive} />,
          op: 'open-swipeable',
          draggable: true,
        }}
        swipeableActionsRight={[
          {
            text: 'Delete',
            color: theme.colors.assertive,
            ButtonComponent: <Trash2 color={theme.colors.stickyWhite} />,
            op: 'remove',
            confirmation: () => {
              listEditorRef.current?.reset();
              return confirmAction({
                label: `Delete ${kind.name}`,
                title: `This action cannot be undone.\nAre you sure you don't want to log this ${kind.name}?`,
              });
            },
            onPress: () => deleteEvent(event._id.toString()),
          },
        ]}
      />
    );
  };

  if (filterId && !events.length) {
    return (
      <EmptyView
        message={`No ${eventKind(model?.type).namePlural} Match Your Filter`}
        details={`Adjust your filter settings to see your ${eventKind(model?.type).namePlural}.`}
        buttonTitle={'Adjust Filter'}
        onButtonPress={() =>
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
    );
  }

  if (!events.length) {
    return <EmptyView info message={`No ${kind.namePlural}`} />;
  }

  return (
    <ListEditor
      ref={listEditorRef}
      onChangeState={setListEditorState}
      listLayout={listLayout}>
      <View
        style={[{ flex: 1 }]}
        onLayout={e => setListLayout(e.nativeEvent.layout)}>
        <SectionList
          showsVerticalScrollIndicator={false}
          contentInsetAdjustmentBehavior={'automatic'}
          stickySectionHeadersEnabled={true}
          style={[theme.styles.view, s.sectionList]}
          sections={groupEvents([...events].reverse())}
          keyExtractor={item => item._id.toString()}
          renderItem={renderEvent}
          renderSectionHeader={({ section: { title } }) => (
            <View style={theme.styles.listSectionHeader}>
              <Divider text={title} />
            </View>
          )}
        />
      </View>
    </ListEditor>
  );
};

const useStyles = ThemeManager.createStyleSheet(() => ({
  sectionList: {
    flex: 1,
    flexGrow: 1,
  },
}));

export default EventsScreen;
