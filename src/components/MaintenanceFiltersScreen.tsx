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

import { Filter } from 'realmdb/Filter';
import { MaintenanceFiltersNavigatorParamList } from 'types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { defaultFilter } from 'lib/maintenance';
import { filterSummary } from 'lib/filter';
import lodash from 'lodash';
import { saveSelectedFilter } from 'store/slices/filters';
import { selectFilters } from 'store/selectors/filterSelectors';
import { useConfirmAction } from 'lib/useConfirmAction';
import { useTheme } from 'theme';

export type Props = NativeStackScreenProps<
  MaintenanceFiltersNavigatorParamList,
  'MaintenanceFilters'
>;

const MaintenanceFiltersScreen = ({ navigation, route }: Props) => {
  const { filterType, modelType, useGeneralFilter } = route.params;

  const theme = useTheme();
  const listEditor = useListEditor();
  const confirmAction = useConfirmAction();
  const dispatch = useDispatch();
  const realm = useRealm();

  const generalMaintenanceFilterName = `general-${lodash.kebabCase(filterType)}`;
  const allMaintenanceFilters = useQuery(Filter, filters => {
    return filters.filtered(
      'type == $0 AND name != $1',
      filterType,
      generalMaintenanceFilterName,
    );
  });

  const generalMaintenanceFilterQuery = useQuery(Filter, filters => {
    return filters.filtered(
      'type == $0 AND name == $1',
      filterType,
      generalMaintenanceFilterName,
    );
  });
  const [generalMaintenanceFilter, setGeneralMaintenanceFilter] =
    useState<Filter>();

  const selectedFilterId = useSelector(selectFilters(filterType));

  useEffect(() => {
    // Lazy initialization of a general maintenance filter.
    if (!generalMaintenanceFilterQuery.length) {
      realm.write(() => {
        const gmf = realm.create('Filter', {
          name: generalMaintenanceFilterName,
          type: filterType,
          values: defaultFilter,
        });

        // @ts-ignore
        setGeneralMaintenanceFilter(gmf);
      });
    } else {
      setGeneralMaintenanceFilter(generalMaintenanceFilterQuery[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setFilter = (filter?: Filter) => {
    dispatch(
      saveSelectedFilter({
        filterType,
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
        ref={ref => {
          ref &&
            listEditor.add(ref, 'maintenance-filters', filter._id.toString());
        }}
        key={index}
        title={filter.name}
        subtitle={filterSummary(filter)}
        position={listItemPosition(index, allMaintenanceFilters.length)}
        checked={filter._id.toString() === selectedFilterId}
        onPress={() => setFilter(filter)}
        onPressInfo={() =>
          navigation.navigate('MaintenanceFilterEditor', {
            filterId: filter._id.toString(),
            filterType,
            generalFilterName: generalMaintenanceFilterName,
            modelType,
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
            'maintenance-filters',
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
        subtitle={'Matches all logs'}
        position={['first', 'last']}
        hideInfo={true}
        checked={!selectedFilterId}
        onPress={setFilter}
      />
      <Divider />
      {useGeneralFilter && generalMaintenanceFilter ? (
        <>
          <ListItemCheckboxInfo
            title={'General Maintenance Filter'}
            subtitle={filterSummary(generalMaintenanceFilter)}
            position={['first', 'last']}
            checked={
              generalMaintenanceFilter._id.toString() === selectedFilterId
            }
            onPress={() => setFilter(generalMaintenanceFilter)}
            onPressInfo={() =>
              navigation.navigate('MaintenanceFilterEditor', {
                filterId: generalMaintenanceFilter._id.toString(),
                filterType,
                generalFilterName: generalMaintenanceFilterName,
                modelType,
              })
            }
          />
          <Divider
            note
            text={
              'You can save the General Maintenance Filter to remember a specific filter configuration for later use.'
            }
          />
        </>
      ) : (
        <ListItem
          title={'Add New Filter'}
          titleStyle={theme.styles.listItemButtonTitle}
          position={['first', 'last']}
          rightImage={false}
          onPress={() =>
            generalMaintenanceFilter &&
            navigation.navigate('MaintenanceFilterEditor', {
              filterId: generalMaintenanceFilter._id.toString(),
              filterType,
              generalFilterName: generalMaintenanceFilterName,
              modelType,
              requireFilterName: true,
            })
          }
        />
      )}
      <FlatList
        data={allMaintenanceFilters}
        renderItem={renderFilters}
        keyExtractor={(_item, index) => `${index}`}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          allMaintenanceFilters.length ? (
            <Divider text={'SAVED MAINTENANCE FILTERS'} />
          ) : null
        }
      />
    </View>
  );
};

export default MaintenanceFiltersScreen;
