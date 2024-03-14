import { Divider, useListEditor } from '@react-native-ajp-elements/ui';
import { FlatList, ListRenderItem } from 'react-native';
import { ListItemCheckboxInfo, listItemPosition, swipeableDeleteItem } from 'components/atoms/List';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useQuery, useRealm } from '@realm/react';

import { BatteryFiltersNavigatorParamList } from 'types/navigation';
import { Filter } from 'realmdb/Filter';
import { FilterType } from 'types/filter';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { View } from 'react-native-ui-lib';
import { defaultFilter } from 'lib/battery';
import { filterSummary } from 'lib/filter';
import { generalBatteriesFilterName } from 'components/BatteryFilterEditorScreen';
import { saveSelectedFilter } from 'store/slices/filters';
import { selectFilters } from 'store/selectors/filterSelectors';
import { useConfirmAction } from 'lib/useConfirmAction';
import { useTheme } from 'theme';

export type Props = NativeStackScreenProps<BatteryFiltersNavigatorParamList, 'BatteryFilters'>;

const BatteryFiltersScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const listEditor = useListEditor();
  const confirmAction = useConfirmAction();
  const dispatch = useDispatch();
  const realm = useRealm();

  const allBatteryFilters = useQuery(Filter, filters => {
    return filters.filtered('type == $0 AND name != $1', FilterType.BatteriesFilter, generalBatteriesFilterName);
  });

  const generalBatteriesFilterQuery = useQuery(Filter, filters => {
    return filters.filtered('type == $0 AND name == $1', FilterType.BatteriesFilter, generalBatteriesFilterName);
  });
  const [generalBatteriesFilter, setGeneralBatteriesFilter] = useState<Filter>();

  const selectedFilterId = useSelector(selectFilters(FilterType.BatteriesFilter));

  useEffect(() => {
    // Lazy initialization of a general batteries filter.
    if (!generalBatteriesFilterQuery.length) {
      realm.write(() => {
        const gbf = realm.create('Filter', {
          name: generalBatteriesFilterName,
          type: FilterType.BatteriesFilter,
          values: defaultFilter,
        });

        // @ts-ignore
        setGeneralBatteriesFilter(gbf);
      });
    } else {
      setGeneralBatteriesFilter(generalBatteriesFilterQuery[0]);
    }
  }, []);
  
  const setFilter = (filter?: Filter) => {
    dispatch(
      saveSelectedFilter({
        filterType: FilterType.BatteriesFilter,
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
        ref={ref => ref && listEditor.add(ref, 'battery-filters', filter._id.toString())}
        key={index}
        title={filter.name}
        subtitle={filterSummary(filter)}
        position={listItemPosition(index, allBatteryFilters.length)}
        checked={filter._id.toString() === selectedFilterId}
        onPress={() => setFilter(filter)}
        onPressInfo={() => navigation.navigate('BatteryFilterEditor', {
          filterId: filter._id.toString(),
        })}
        swipeable={{
          rightItems: [{
            ...swipeableDeleteItem[theme.mode],
            onPress: () => confirmAction(deleteFilter, {
              label: 'Delete Saved Filter',
              title: 'This action cannot be undone.\nAre you sure you want to delete this filter?',
              value: filter,
            })
          }]
        }}
        onSwipeableWillOpen={() => listEditor.onItemWillOpen('battery-filters', filter._id.toString())}
        onSwipeableWillClose={listEditor.onItemWillClose}
      />
    )
  };

  return (
    <View style={theme.styles.view}>
      <Divider />
      <ListItemCheckboxInfo
        title={'No Filter'}
        subtitle={'Matches all batteries'}
        position={['first', 'last']}
        hideInfo={true}
        checked={!selectedFilterId}
        onPress={setFilter}
      />
      <Divider />
      {generalBatteriesFilter && 
        <ListItemCheckboxInfo
          title={'General Batteries Filter'}
          subtitle={filterSummary(generalBatteriesFilter)}
          position={['first', 'last']}
          checked={generalBatteriesFilter._id.toString() === selectedFilterId}
          onPress={() => setFilter(generalBatteriesFilter)}
          onPressInfo={() => navigation.navigate('BatteryFilterEditor', {
            filterId: generalBatteriesFilter!._id.toString(),
          })}
        />
      }
      <Divider note
        text={'You can save the General Batteries Filter to remember a specific filter configuration for later use.'}
      />
      <FlatList
        data={allBatteryFilters}
        renderItem={renderFilters}
        keyExtractor={(_item, index) => `${index}`}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={allBatteryFilters.length ? <Divider text={'SAVED BATTERY FILTERS'} /> : null}
      />
    </View>
  );
};

export default BatteryFiltersScreen;
