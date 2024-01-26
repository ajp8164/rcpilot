import { AppTheme, useTheme } from 'theme';
import { FlatList, ListRenderItem } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useQuery, useRealm } from '@realm/react';

import { Divider } from '@react-native-ajp-elements/ui';
import { Filter } from 'realmdb/Filter';
import { FilterType } from 'types/filter';
import { ListItem } from 'components/atoms/List';
import { ListItemCheckboxInfo } from 'components/atoms/List';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ReportFiltersNavigatorParamList } from 'types/navigation';
import { View } from 'react-native-ui-lib';
import { filterSummary } from 'lib/filter';
import { makeStyles } from '@rneui/themed';
import { useEvent } from 'lib/event';

// Destination report editor based on report type.
const reportFilterEditor: {[key in FilterType]: any} = {
  [FilterType.ReportEventsFilter]: 'ReportEventsFilterEditor',
  [FilterType.ReportMaintenanceFilter]: 'ReportMaintenanceFilterEditor',
  [FilterType.ReportModelScanCodesFilter]: 'ReportModelScanCodesFilterEditor',
  [FilterType.ReportBatteryScanCodesFilter]: 'ReportBatteryScanCodesFilterEditor',
  [FilterType.BatteriesFilter]: undefined,
  [FilterType.ModelsFilter]: undefined,
};

export type Props = NativeStackScreenProps<ReportFiltersNavigatorParamList, 'ReportFilters'>;

const ReportFiltersScreen = ({ navigation, route }: Props) => {
  const { eventName, filterType, filterId } = route.params;
  
  const theme = useTheme();
  const s = useStyles(theme);
  const event = useEvent();

  const realm = useRealm();
  const filters = useQuery<Filter>('Filter', filters => {
    return filters.filtered('type == $0', filterType);
  });

  const [selectedFilter, setSelectedFilter] = useState(filterId);

  useEffect(() => {
    navigation.setOptions({
      headerTitle: 
        filterType === FilterType.ReportEventsFilter ?
          'Filters for Events' :
          filterType === FilterType.ReportMaintenanceFilter ?
          'Filters for Maintenance' :
          filterType === FilterType.ReportModelScanCodesFilter ?
          'Filters for Models' :
          filterType === FilterType.ReportBatteryScanCodesFilter ?
          'Filters for Batteries' :
          '',
    });
  });

  useEffect(() => {
    event.emit(eventName, selectedFilter);
  }, [ selectedFilter ]);

  const deleteFilter = (filter: Filter) => {
    // if removing the selected filter then set the current selection to no-filter.
    if (selectedFilter === filter._id.toString())  {
      setSelectedFilter(undefined);
    }

    realm.write(() => {
      realm.delete(filter);
    });
  };

  const renderFilter: ListRenderItem<Filter> = ({ item: filter, index }) => {
    return (
      <ListItemCheckboxInfo
        key={index}
        title={filter.name}
        subtitle={filterSummary(filter)}
        position={filters.length === 1 ? ['first', 'last'] : index === 0 ? ['first'] : index === filters.length - 1 ? ['last'] : []}
        checked={selectedFilter === filter._id.toString()}
        swipeable={{
          rightItems: [{
            icon: 'delete',
            text: 'Delete',
            color: theme.colors.assertive,
            x: 64,
            onPress: () => deleteFilter(filter),
          }]
        }}
        onPress={() => setSelectedFilter(filter._id.toString())}
        onPressInfo={() => filterType && navigation.navigate(reportFilterEditor[filterType], {
          filterId: filter._id.toString(),
        })}
      />
    )
};

  return (
    <View style={theme.styles.view}>
      <Divider />
      <ListItemCheckboxInfo
        title={'No Filter'}
        subtitle={filterSummary()}
        position={['first', 'last']}
        hideInfo={true}
        checked={!selectedFilter}
        onPress={() => setSelectedFilter(undefined)}
      />
      <Divider />
      <ListItem
        title={'Add a New Filter'}
        titleStyle={s.newFilter}
        position={['first', 'last']}
        rightImage={false}
        onPress={() => filterType && navigation.navigate(reportFilterEditor[filterType], {})}
      />
      <Divider />
      {filters.length ?
        filterType === FilterType.ReportEventsFilter && <Divider text={'SAVED EVENT FILTERS'} /> ||
        filterType === FilterType.ReportMaintenanceFilter && <Divider text={'SAVED MAINTENANCE FILTERS'} /> ||
        filterType === FilterType.ReportModelScanCodesFilter && <Divider text={'SAVED MODEL FILTERS'} /> ||
        filterType === FilterType.ReportBatteryScanCodesFilter && <Divider text={'SAVED BATTERY FILTERS'} />
        : null
      }
      <FlatList
        data={filters}
        renderItem={renderFilter}
        keyExtractor={(_item, index) => `${index}`}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  doneButton: {
    justifyContent: 'flex-start',
    paddingHorizontal: 0,
    minWidth: 0,
  },
  newFilter: {
    alignSelf: 'center',
    textAlign: 'center',
    color: theme.colors.screenHeaderBackButton,
  },
}));

export default ReportFiltersScreen;
