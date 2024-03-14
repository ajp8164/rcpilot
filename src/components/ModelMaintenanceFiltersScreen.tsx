import { Divider, useListEditor } from '@react-native-ajp-elements/ui';
import { FlatList, ListRenderItem } from 'react-native';
import { ListItemCheckboxInfo, listItemPosition, swipeableDeleteItem } from 'components/atoms/List';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useQuery, useRealm } from '@realm/react';

import { Filter } from 'realmdb/Filter';
import { FilterType } from 'types/filter';
import { ModelMaintenanceFiltersNavigatorParamList } from 'types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { View } from 'react-native-ui-lib';
import { defaultFilter } from 'lib/maintenance';
import { filterSummary } from 'lib/filter';
import lodash from 'lodash';
import { saveSelectedFilter } from 'store/slices/filters';
import { selectFilters } from 'store/selectors/filterSelectors';
import { useConfirmAction } from 'lib/useConfirmAction';
import { useTheme } from 'theme';

export type Props = NativeStackScreenProps<ModelMaintenanceFiltersNavigatorParamList, 'ModelMaintenanceFilters'>;

const ModelMaintenanceFiltersScreen = ({ navigation, route }: Props) => {
  const { filterType, modelType } = route.params;

  const theme = useTheme();
  const listEditor = useListEditor();
  const confirmAction = useConfirmAction();
  const dispatch = useDispatch();
  const realm = useRealm();

  const generalMaintenanceFilterName = `general-${lodash.kebabCase(filterType)}`;
  const allMaintenanceFilters = useQuery(Filter, filters => {
    return filters.filtered('type == $0 AND name != $1', FilterType.MaintenanceFilter, generalMaintenanceFilterName);
  });

  const generalMaintenanceFilterQuery = useQuery(Filter, filters => {
    return filters.filtered('type == $0 AND name == $1', FilterType.MaintenanceFilter, generalMaintenanceFilterName);
  });
  const [generalMaintenanceFilter, setGeneralMaintenanceFilter] = useState<Filter>();

  const selectedFilterId = useSelector(selectFilters(FilterType.MaintenanceFilter));

  useEffect(() => {
    // Lazy initialization of a general maintenance filter.
    if (!generalMaintenanceFilterQuery.length) {
      realm.write(() => {
        const gmf = realm.create('Filter', {
          name: generalMaintenanceFilterName,
          type: FilterType.MaintenanceFilter,
          values: defaultFilter,
        });

        // @ts-ignore
        setGeneralMaintenanceFilter(gmf);
      });
    } else {
      setGeneralMaintenanceFilter(generalMaintenanceFilterQuery[0]);
    }
  }, []);
  
  const setFilter = (filter?: Filter) => {
    dispatch(
      saveSelectedFilter({
        filterType: FilterType.MaintenanceFilter,
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
        ref={ref => ref && listEditor.add(ref, 'maintenance-filters', filter._id.toString())}
        key={index}
        title={filter.name}
        subtitle={filterSummary(filter)}
        position={listItemPosition(index, allMaintenanceFilters.length)}
        checked={filter._id.toString() === selectedFilterId}
        onPress={() => setFilter(filter)}
        onPressInfo={() => navigation.navigate('ModelMaintenanceFilterEditor', {
          filterId: filter._id.toString(),
          filterType,
          generalFilterName: generalMaintenanceFilterName,
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
        onSwipeableWillOpen={() => listEditor.onItemWillOpen('maintenance-filters', filter._id.toString())}
        onSwipeableWillClose={listEditor.onItemWillClose}
      />
    )
  };

  return (
    <View style={theme.styles.view}>
      <Divider />
      <ListItemCheckboxInfo
        title={'No Filter'}
        subtitle={'Matches all logs'}
        position={['first', 'last']}
        hideInfo={true}
        checked={!selectedFilterId}
        onPress={setFilter}
      />
      <Divider />
      {generalMaintenanceFilter && 
        <ListItemCheckboxInfo
          title={'General Maintenance Filter'}
          subtitle={filterSummary(generalMaintenanceFilter)}
          position={['first', 'last']}
          checked={generalMaintenanceFilter._id.toString() === selectedFilterId}
          onPress={() => setFilter(generalMaintenanceFilter)}
          onPressInfo={() => navigation.navigate('ModelMaintenanceFilterEditor', {
            filterId: generalMaintenanceFilter!._id.toString(),
            filterType,
            generalFilterName: generalMaintenanceFilterName,
            modelType,
          })}
        />
      }
      <Divider note
        text={'You can save the General Maintenance Filter to remember a specific filter configuration for later use.'}
      />      
      <FlatList
        data={allMaintenanceFilters}
        renderItem={renderFilters}
        keyExtractor={(_item, index) => `${index}`}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={allMaintenanceFilters.length ? <Divider text={'SAVED MAINTENANCE FILTERS'} /> : null}
      />
    </View>
  );
};

export default ModelMaintenanceFiltersScreen;
