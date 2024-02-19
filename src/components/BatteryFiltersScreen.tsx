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
import { generalBatteriesFilterName } from 'components/BatteryFilterEditorScreen';
import { saveSelectedBatteryFilter } from 'store/slices/filters';
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

  const selectedFilterId = useSelector(selectFilters).batteryFilterId;

  useEffect(() => {
    // Lazy initialization of a general batteries filter.
    if (!generalBatteriesFilterQuery.length) {
      realm.write(() => {
        const gmf = realm.create('Filter', {
          name: generalBatteriesFilterName,
          type: FilterType.BatteriesFilter,
          values: defaultFilter,
        });

        // @ts-ignore
        setGeneralBatteriesFilter(gmf);
      });
    } else {
      setGeneralBatteriesFilter(generalBatteriesFilterQuery[0]);
    }
  }, []);
  
  const setFilter = (filter?: Filter) => {
    dispatch(
      saveSelectedBatteryFilter({
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
        subtitle={`Matches batteries where any chemistry, any total cycles, any capacity, any C rating, any S cells, and any P cells.`}
        position={listItemPosition(index, allBatteryFilters.length)}
        checked={filter._id.toString() === selectedFilterId}
        onPress={() => setFilter(filter)}
        onPressInfo={() => navigation.navigate('BatteryFilterEditor', {
          filterId: filter._id.toString(),
        })}
        swipeable={{
          rightItems: [{
            ...swipeableDeleteItem[theme.mode],
            onPress: () => {
              confirmAction('Delete Saved Filter', filter, deleteFilter);
            }
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
          subtitle={'Matches batteries where any chemistry, any total cycles, any capacity, any C rating, any S cells, and any P cells.'}
          position={['first', 'last']}
          checked={generalBatteriesFilter._id.toString() === selectedFilterId}
          onPress={() => setFilter(generalBatteriesFilter)}
          onPressInfo={() => navigation.navigate('BatteryFilterEditor', {
            filterId: generalBatteriesFilter!._id.toString(),
          })}
        />
      }
      <Divider
        type={'note'}
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
