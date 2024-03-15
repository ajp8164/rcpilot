import { Divider, useListEditor } from '@react-native-ajp-elements/ui';
import { FlatList, ListRenderItem } from 'react-native';
import { ListItem, ListItemCheckboxInfo, listItemPosition, swipeableDeleteItem } from 'components/atoms/List';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useQuery, useRealm } from '@realm/react';

import { Filter } from 'realmdb/Filter';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ReportMaintenanceFiltersNavigatorParamList } from 'types/navigation';
import { View } from 'react-native-ui-lib';
import { defaultFilter } from 'lib/reportMaintenanceFilter';
import { filterSummary } from 'lib/filter';
import lodash from 'lodash';
import { saveSelectedFilter } from 'store/slices/filters';
import { selectFilters } from 'store/selectors/filterSelectors';
import { useConfirmAction } from 'lib/useConfirmAction';
import { useTheme } from 'theme';

export type Props = NativeStackScreenProps<ReportMaintenanceFiltersNavigatorParamList, 'ReportMaintenanceFilters'>;

const ReportMaintenanceFiltersScreen = ({ navigation, route }: Props) => {
  const { filterType, modelType, useGeneralFilter } = route.params;

  const theme = useTheme();
  const listEditor = useListEditor();
  const confirmAction = useConfirmAction();
  const dispatch = useDispatch();
  const realm = useRealm();

  const generalReportMaintenancesFilterName = `general-${lodash.kebabCase(filterType)}`;
  const allMaintenanceFilters = useQuery(Filter, filters => {
    return filters.filtered('type == $0 AND name != $1', filterType, generalReportMaintenancesFilterName);
  });

  const generalReportMaintenancesFilterQuery = useQuery(Filter, filters => {
    return filters.filtered('type == $0 AND name == $1', filterType, generalReportMaintenancesFilterName);
  });
  const [generalReportMaintenancesFilter, setGeneralMaintenanceFilter] = useState<Filter>();

  const selectedFilterId = useSelector(selectFilters(filterType));

  useEffect(() => {
    // Lazy initialization of a general model mointenance filter.
    if (!generalReportMaintenancesFilterQuery.length) {
      realm.write(() => {
        const gef = realm.create('Filter', {
          name: generalReportMaintenancesFilterName,
          type: filterType,
          values: defaultFilter,
        });

        // @ts-ignore
        setGeneralMaintenanceFilter(gef);
      });
    } else {
      setGeneralMaintenanceFilter(generalReportMaintenancesFilterQuery[0]);
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
        ref={ref => ref && listEditor.add(ref, 'report-model-maintenance-filters', filter._id.toString())}
        key={index}
        title={filter.name}
        subtitle={filterSummary(filter)}
        position={listItemPosition(index, allMaintenanceFilters.length)}
        checked={filter._id.toString() === selectedFilterId}
        onPress={() => setFilter(filter)}
        onPressInfo={() => navigation.navigate('ReportMaintenanceFilterEditor', {
          filterId: filter._id.toString(),
          filterType,
          generalFilterName: generalReportMaintenancesFilterName,
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
        onSwipeableWillOpen={() => listEditor.onItemWillOpen('report-model-mantenance-filters', filter._id.toString())}
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
      {useGeneralFilter && generalReportMaintenancesFilter ?
        <>
          <ListItemCheckboxInfo
            title={`General Maintenance Filter`}
            subtitle={filterSummary(generalReportMaintenancesFilter)}
            position={['first', 'last']}
            checked={generalReportMaintenancesFilter._id.toString() === selectedFilterId}
            onPress={() => setFilter(generalReportMaintenancesFilter)}
            onPressInfo={() => navigation.navigate('ReportMaintenanceFilterEditor', {
              filterId: generalReportMaintenancesFilter!._id.toString(),
              filterType,
              generalFilterName: generalReportMaintenancesFilterName,
              modelType,
            })}
          />
          <Divider note
            text={`You can save the General Maintenance Filter to remember a specific filter configuration for later use.`}
          />
        </>
        :
        <ListItem
          title={'Add New Filter'}
          titleStyle={theme.styles.listItemButtonTitle}
          position={['first', 'last']}
          rightImage={false}
          onPress={() => navigation.navigate('ReportMaintenanceFilterEditor', {
            filterId: generalReportMaintenancesFilter!._id.toString(),
            filterType,
            generalFilterName: generalReportMaintenancesFilterName,
            modelType,
            requireFilterName: true,
          })}
        />
      }
      <FlatList
        data={allMaintenanceFilters}
        renderItem={renderFilters}
        keyExtractor={(_item, index) => `${index}`}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={allMaintenanceFilters.length ? <Divider text={'SAVED MAINTEANCE FILTERS'} /> : null}
      />
    </View>
  );
};

export default ReportMaintenanceFiltersScreen;
