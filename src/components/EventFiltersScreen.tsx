import React, { useEffect, useRef, useState } from 'react';
import { FlatList, ListRenderItem, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import {
  Divider,
  ListEditor,
  ListEditorMethods,
  listItemPosition,
  useTheme,
} from '@react-native-hello/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQuery, useRealm } from '@realm/react';
import { ListItemCheckBoxInfo } from 'components/atoms/List';
import { FiltersListHeader } from 'components/molecules/FiltersListHeader';
import { filterSummary } from 'lib/filter';
import { defaultFilter, eventKind } from 'lib/modelEvent';
import { useConfirmAction } from 'lib/useConfirmAction';
import lodash from 'lodash';
import { Trash2 } from 'lucide-react-native';
import { BSON } from 'realm';
import { Filter } from 'realmdb/Filter';
import { selectFilters } from 'store/selectors/filterSelectors';
import { saveSelectedFilter } from 'store/slices/filters';
import { EventFiltersNavigatorParamList } from 'types/navigation';

export type Props = NativeStackScreenProps<
  EventFiltersNavigatorParamList,
  'EventFilters'
>;

const EventFiltersScreen = ({ navigation, route }: Props) => {
  const { filterType, modelType, useGeneralFilter } = route.params;

  const theme = useTheme();
  const confirmAction = useConfirmAction();
  const dispatch = useDispatch();
  const realm = useRealm();

  const generalEventsFilterName = `general-${lodash.kebabCase(filterType)}`;
  const allEventFilters = useQuery(Filter, filters => {
    return filters.filtered(
      'type == $0 AND name != $1',
      filterType,
      generalEventsFilterName,
    );
  });

  const generalEventsFilterQuery = useQuery(Filter, filters => {
    return filters.filtered(
      'type == $0 AND name == $1',
      filterType,
      generalEventsFilterName,
    );
  });
  const [generalEventsFilter, setGeneralEventsFilter] = useState<Filter>();

  const selectedFilterId = useSelector(selectFilters(filterType));

  const listEditorRef = useRef<ListEditorMethods>(null);

  useEffect(() => {
    // Lazy initialization of a general events filter.
    if (!generalEventsFilterQuery.length) {
      realm.write(() => {
        const gef = realm.create('Filter', {
          name: generalEventsFilterName,
          type: filterType,
          values: defaultFilter,
        });

        // @ts-ignore
        setGeneralEventsFilter(gef);
      });
    } else {
      setGeneralEventsFilter(generalEventsFilterQuery[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setFilter = (filter?: Filter) => {
    dispatch(
      saveSelectedFilter({
        filterId: filter?._id?.toString(),
        filterType,
      }),
    );
  };

  const deleteFilter = (filterId: string) => {
    if (selectedFilterId === filterId) {
      setFilter();
    }

    // Wait for filter setting to change before deletion.
    setTimeout(() => {
      const filter = realm.objectForPrimaryKey(
        'Filter',
        new BSON.ObjectId(filterId),
      );
      if (filter?.isValid()) {
        realm.write(() => {
          realm.delete(filter);
        });
      }
    });
  };

  const renderFilters: ListRenderItem<Filter> = ({ item: filter, index }) => {
    return (
      <ListItemCheckBoxInfo
        key={filter._id.toString()}
        title={filter.name}
        subtitle={filterSummary(filter)}
        subtitleLines={0}
        position={listItemPosition(index, allEventFilters.length)}
        checked={filter._id.toString() === selectedFilterId}
        listEditor={listEditorRef.current}
        onPress={() => setFilter(filter)}
        onPressInfo={() =>
          navigation.navigate('EventFilterEditor', {
            filterId: filter._id.toString(),
            filterType,
            generalFilterName: generalEventsFilterName,
            modelType,
          })
        }
        swipeableActionsRight={[
          {
            text: 'Delete',
            color: theme.colors.assertive,
            ButtonComponent: <Trash2 color={theme.colors.stickyWhite} />,
            op: 'remove',
            confirmation: () => {
              listEditorRef.current?.reset();
              return confirmAction({
                label: 'Delete Saved Filter',
                title:
                  'This action cannot be undone.\nAre you sure you want to delete this saved filter?',
              });
            },
            onPress: () => deleteFilter(filter._id.toString()),
          },
        ]}
      />
    );
  };

  return (
    <View style={theme.styles.view}>
      <FiltersListHeader
        filterSummary={filterSummary(generalEventsFilter)}
        itemName={'event'}
        specificItemName={`${eventKind(modelType).namePlural}`}
        generalFilterId={generalEventsFilter?._id.toString()}
        selectedFilterId={selectedFilterId}
        useGeneralFilter={useGeneralFilter}
        onPressEditGeneralFilter={() =>
          navigation.navigate('EventFilterEditor', {
            filterId: generalEventsFilter?._id.toString() || '',
            filterType,
            generalFilterName: generalEventsFilterName,
          })
        }
        onPressGeneralFilter={() => setFilter(generalEventsFilter)}
        onPressNoFilter={setFilter}
      />
      <ListEditor ref={listEditorRef}>
        <FlatList
          data={allEventFilters}
          renderItem={renderFilters}
          keyExtractor={item => `${item._id.toString()}`}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            allEventFilters.length ? (
              <Divider text={'SAVED EVENT FILTERS'} />
            ) : null
          }
        />
      </ListEditor>
    </View>
  );
};

export default EventFiltersScreen;
