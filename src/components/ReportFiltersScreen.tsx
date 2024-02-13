import { ActionSheet, View } from 'react-native-ui-lib';
import { AppTheme, useTheme } from 'theme';
import { FilterType, ReportFilterType } from 'types/filter';
import { FlatList, ListRenderItem } from 'react-native';
import { ListItem, listItemPosition } from 'components/atoms/List';
import React, { useEffect, useState } from 'react';
import { useQuery, useRealm } from '@realm/react';

import { Divider } from '@react-native-ajp-elements/ui';
import { Filter } from 'realmdb/Filter';
import { ListItemCheckboxInfo } from 'components/atoms/List';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ReportFiltersNavigatorParamList } from 'types/navigation';
import { filterSummary } from 'lib/filter';
import { makeStyles } from '@rneui/themed';
import { useEvent } from 'lib/event';

// Destination report editor based on report type.
const reportFilterEditors: {[key in ReportFilterType]: any} = {
  [FilterType.ReportEventsFilter]: 'ReportEventsFilterEditor',
  [FilterType.ReportMaintenanceFilter]: 'ReportMaintenanceFilterEditor',
  [FilterType.ReportModelScanCodesFilter]: 'ReportModelScanCodesFilterEditor',
  [FilterType.ReportBatteryScanCodesFilter]: 'ReportBatteryScanCodesFilterEditor',
};

export type Props = NativeStackScreenProps<ReportFiltersNavigatorParamList, 'ReportFilters'>;

const ReportFiltersScreen = ({ navigation, route }: Props) => {
  const { eventName, filterType, filterId } = route.params;
  
  const theme = useTheme();
  const s = useStyles(theme);
  const event = useEvent();

  const realm = useRealm();
  const filters = useQuery<Filter>('Filter', filter => {
    return filter.filtered('type == $0', filterType);
  });

  const reportFilterEditor = reportFilterEditors[filterType as ReportFilterType];
  const [selectedFilter, setSelectedFilter] = useState(filterId);
  const [deleteFilterActionSheetVisible, setDeleteFilterActionSheetVisible] = useState<Filter>();

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

  const confirmDeleteFilter = (filter: Filter) => {
    setDeleteFilterActionSheetVisible(filter);
  };

  const deleteFilter = (filter: Filter) => {
    // If removing the selected filter then set the current selection to no-filter.
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
        position={listItemPosition(index, filters.length)}
        checked={selectedFilter === filter._id.toString()}
        swipeable={{
          rightItems: [{
            icon: 'trash',
            iconType: 'font-awesome',
            text: 'Delete',
            color: theme.colors.assertive,
            x: 64,
            onPress: () => confirmDeleteFilter(filter),
          }]
        }}
        onPress={() => setSelectedFilter(filter._id.toString())}
        onPressInfo={() => filterType && navigation.navigate(reportFilterEditor, {
          filterId: filter._id.toString(),
          eventName: 'report-filter',
        })}
      />
    )
  };

  return (
    <View style={theme.styles.view}>
      <Divider />
      <ListItemCheckboxInfo
        title={'No Filter'}
        subtitle={filterSummary(filterType)}
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
        onPress={() => filterType && navigation.navigate(reportFilterEditor, {})}
      />
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
      <ActionSheet
        cancelButtonIndex={1}
        destructiveButtonIndex={0}
        options={[
          {
            label: 'Delete Saved Filter',
            onPress: () => {
              deleteFilter(deleteFilterActionSheetVisible!);
              setDeleteFilterActionSheetVisible(undefined);
            },
          },
          {
            label: 'Cancel' ,
            onPress: () => setDeleteFilterActionSheetVisible(undefined),
          },
        ]}
        useNativeIOS={true}
        visible={!!deleteFilterActionSheetVisible}
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
    color: theme.colors.screenHeaderButtonText,
  },
}));

export default ReportFiltersScreen;
