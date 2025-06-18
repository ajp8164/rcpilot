import { Divider, useListEditor } from '@react-native-ajp-elements/ui';
import { FlatList, ListRenderItem, View } from 'react-native';
import {
  ListItem,
  ListItemCheckboxInfo,
  listItemPosition,
  swipeableDeleteItem,
} from 'components/atoms/List';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useQuery, useRealm } from '@realm/react';

import { BatteryCycleFiltersNavigatorParamList } from 'types/navigation';
import { Filter } from 'realmdb/Filter';
import { FilterType } from 'types/filter';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { defaultFilter } from 'lib/batteryCycle';
import { filterSummary } from 'lib/filter';
import { generalBatteryCyclesFilterName } from 'components/BatteryCycleFilterEditorScreen';
import { saveSelectedFilter } from 'store/slices/filters';
import { selectFilters } from 'store/selectors/filterSelectors';
import { useConfirmAction } from 'lib/useConfirmAction';
import { useTheme } from 'theme';

export type Props = NativeStackScreenProps<
  BatteryCycleFiltersNavigatorParamList,
  'BatteryCycleFilters'
>;

const BatteryCycleFiltersScreen = ({ navigation, route }: Props) => {
  const { useGeneralFilter } = route.params;

  const theme = useTheme();
  const listEditor = useListEditor();
  const confirmAction = useConfirmAction();
  const dispatch = useDispatch();
  const realm = useRealm();

  const allBatteryCycleFilters = useQuery(Filter, filters => {
    return filters.filtered(
      'type == $0 AND name != $1',
      FilterType.BatteryCyclesFilter,
      generalBatteryCyclesFilterName,
    );
  });

  const generalBatteryCyclesFilterQuery = useQuery(Filter, filters => {
    return filters.filtered(
      'type == $0 AND name == $1',
      FilterType.BatteryCyclesFilter,
      generalBatteryCyclesFilterName,
    );
  });
  const [generalBatteryCyclesFilter, setGeneralBatteryCyclesFilter] =
    useState<Filter>();

  const selectedFilterId = useSelector(
    selectFilters(FilterType.BatteryCyclesFilter),
  );

  useEffect(() => {
    // Lazy initialization of a general battery cycles filter.
    if (!generalBatteryCyclesFilterQuery.length) {
      realm.write(() => {
        const gcf = realm.create('Filter', {
          name: generalBatteryCyclesFilterName,
          type: FilterType.BatteryCyclesFilter,
          values: defaultFilter,
        });

        // @ts-ignore
        setGeneralBatteryCyclesFilter(gcf);
      });
    } else {
      setGeneralBatteryCyclesFilter(generalBatteryCyclesFilterQuery[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setFilter = (filter?: Filter) => {
    dispatch(
      saveSelectedFilter({
        filterType: FilterType.BatteryCyclesFilter,
        filterId: filter?._id?.toString(),
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
        ref={ref =>
          ref &&
          listEditor.add(ref, 'battery-cycle-filters', filter._id.toString())
        }
        key={index}
        title={filter.name}
        subtitle={filterSummary(filter)}
        position={listItemPosition(index, allBatteryCycleFilters.length)}
        checked={filter._id.toString() === selectedFilterId}
        onPress={() => setFilter(filter)}
        onPressInfo={() =>
          navigation.navigate('BatteryCycleFilterEditor', {
            filterId: filter._id.toString(),
            filterType: FilterType.BatteryCyclesFilter,
          })
        }
        swipeable={{
          rightItems: [
            {
              ...swipeableDeleteItem[theme.mode],
              onPress: () => {
                confirmAction(deleteFilter, {
                  label: 'Delete Saved Filter',
                  title:
                    'This action cannot be undone.\nAre you sure you want to delete this saved filter?',
                  value: filter,
                });
              },
            },
          ],
        }}
        onSwipeableWillOpen={() =>
          listEditor.onItemWillOpen(
            'battery-cycle-filters',
            filter._id.toString(),
          )
        }
        onSwipeableWillClose={listEditor.onItemWillClose}
      />
    );
  };

  return (
    <View style={theme.styles.view}>
      <Divider />
      <ListItemCheckboxInfo
        title={'No Filter'}
        subtitle={'Matches all battery cycles'}
        position={['first', 'last']}
        hideInfo={true}
        checked={!selectedFilterId}
        onPress={setFilter}
      />
      <Divider />
      {useGeneralFilter && generalBatteryCyclesFilter ? (
        <ListItemCheckboxInfo
          title={'General Battery Cycles Filter'}
          subtitle={filterSummary(generalBatteryCyclesFilter)}
          position={['first', 'last']}
          checked={
            generalBatteryCyclesFilter._id.toString() === selectedFilterId
          }
          onPress={() => setFilter(generalBatteryCyclesFilter)}
          onPressInfo={() =>
            navigation.navigate('BatteryCycleFilterEditor', {
              filterId: generalBatteryCyclesFilter._id.toString(),
              filterType: FilterType.BatteryCyclesFilter,
            })
          }
        />
      ) : (
        <ListItem
          title={'Add New Filter'}
          titleStyle={theme.styles.listItemButtonTitle}
          position={['first', 'last']}
          rightImage={false}
          onPressInfo={() =>
            generalBatteryCyclesFilter &&
            navigation.navigate('BatteryCycleFilterEditor', {
              filterId: generalBatteryCyclesFilter._id.toString(),
              filterType: FilterType.BatteryCyclesFilter,
              requireFilterName: true,
            })
          }
        />
      )}
      <Divider
        note
        text={
          'You can save the General Battery Cycles Filter to remember a specific filter configuration for later use.'
        }
      />
      <FlatList
        data={allBatteryCycleFilters}
        renderItem={renderFilters}
        keyExtractor={(_item, index) => `${index}`}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          allBatteryCycleFilters.length ? (
            <Divider text={'SAVED BATTERY CYCLE FILTERS'} />
          ) : null
        }
      />
    </View>
  );
};

export default BatteryCycleFiltersScreen;
