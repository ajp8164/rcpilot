import { Divider, useListEditor } from '@react-native-ajp-elements/ui';
import { FlatList, ListRenderItem } from 'react-native';
import { ListItemCheckboxInfo, listItemPosition, swipeableDeleteItem } from 'components/atoms/List';
import React, { useEffect, useState } from 'react';
import { defaultFilter, eventKind } from 'lib/modelEvent';
import { useDispatch, useSelector } from 'react-redux';
import { useQuery, useRealm } from '@realm/react';

import { EventFiltersNavigatorParamList } from 'types/navigation';
import { Filter } from 'realmdb/Filter';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { View } from 'react-native-ui-lib';
import { filterSummary } from 'lib/filter';
import lodash from 'lodash';
import { saveSelectedFilter } from 'store/slices/filters';
import { selectFilters } from 'store/selectors/filterSelectors';
import { useConfirmAction } from 'lib/useConfirmAction';
import { useTheme } from 'theme';

export type Props = NativeStackScreenProps<EventFiltersNavigatorParamList, 'EventFilters'>;

const EventFiltersScreen = ({ navigation, route }: Props) => {
  const { filterType, modelType } = route.params;

  const theme = useTheme();
  const listEditor = useListEditor();
  const confirmAction = useConfirmAction();
  const dispatch = useDispatch();
  const realm = useRealm();

  const generalEventsFilterName = `general-${lodash.kebabCase(filterType)}`;
  const allEventFilters = useQuery(Filter, filters => {
    return filters.filtered('type == $0 AND name != $1', filterType, generalEventsFilterName);
  });

  const generalEventsFilterQuery = useQuery(Filter, filters => {
    return filters.filtered('type == $0 AND name == $1', filterType, generalEventsFilterName);
  });
  const [generalEventsFilter, setGeneralEventsFilter] = useState<Filter>();

  const selectedFilterId = useSelector(selectFilters(filterType));

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
  }, []);
  
  const setFilter = (filter?: Filter) => {
    dispatch(
      saveSelectedFilter({
        filterId: filter?._id?.toString(),
        filterType,
      }),
    );
  };

  const deleteFilter = (filter: Filter) => {
    realm.write(() => {
      realm.delete(filter);
    });
  };

  const renderFilters: ListRenderItem<Filter> = ({ item: filter, index }) => {
    return (
      <ListItemCheckboxInfo
        ref={ref => ref && listEditor.add(ref, 'event-filters', filter._id.toString())}
        key={index}
        title={filter.name}
        subtitle={filterSummary(filter)}
        position={listItemPosition(index, allEventFilters.length)}
        checked={filter._id.toString() === selectedFilterId}
        onPress={() => setFilter(filter)}
        onPressInfo={() => navigation.navigate('EventFilterEditor', {
          filterId: filter._id.toString(),
          filterType,
          generalFilterName: generalEventsFilterName,
          modelType,
        })}
        swipeable={{
          rightItems: [{
            ...swipeableDeleteItem[theme.mode],
            onPress: () => {
              confirmAction(deleteFilter, {
                label: 'Delete Saved Filter',
                title: 'This action cannot be undone.\nAre you sure you want to delete this saved filter?',
                value: filter,
              });
            }
          }]
        }}
        onSwipeableWillOpen={() => listEditor.onItemWillOpen('event-filters', filter._id.toString())}
        onSwipeableWillClose={listEditor.onItemWillClose}
      />
    )
  };

  return (
    <View style={theme.styles.view}>
      <Divider />
      <ListItemCheckboxInfo
        title={'No Filter'}
        subtitle={'Matches all events'}
        position={['first', 'last']}
        hideInfo={true}
        checked={!selectedFilterId}
        onPress={setFilter}
      />
      <Divider />
      {generalEventsFilter && 
        <ListItemCheckboxInfo
          title={`General ${eventKind(modelType).namePlural} Filter`}
          subtitle={filterSummary(generalEventsFilter)}
          position={['first', 'last']}
          checked={generalEventsFilter._id.toString() === selectedFilterId}
          onPress={() => setFilter(generalEventsFilter)}
          onPressInfo={() => navigation.navigate('EventFilterEditor', {
            filterId: generalEventsFilter!._id.toString(),
            filterType,
            generalFilterName: generalEventsFilterName,
            modelType,
          })}
        />
      }
      <Divider note
        text={`You can save the General ${eventKind(modelType).namePlural} Filter to remember a specific filter configuration for later use.`}
      />      
      <FlatList
        data={allEventFilters}
        renderItem={renderFilters}
        keyExtractor={(_item, index) => `${index}`}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={allEventFilters.length ? <Divider text={'SAVED EVENT FILTERS'} /> : null}
      />
    </View>
  );
};

export default EventFiltersScreen;
