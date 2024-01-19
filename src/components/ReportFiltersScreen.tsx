import { AppTheme, useTheme } from 'theme';
import { FilterType, ReportFilter } from 'types/filter';
import { FlatList, ListRenderItem } from 'react-native';
import React, { useEffect } from 'react';

// import { CompositeScreenProps } from '@react-navigation/core';
import { Divider } from '@react-native-ajp-elements/ui';
import { ListItem } from 'components/atoms/List';
import { ListItemCheckboxInfo } from 'components/atoms/List';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ReportFiltersNavigatorParamList } from 'types/navigation';
import { ReportType } from 'types/database';
import { StringRelation } from 'components/molecules/filters';
import { View } from 'react-native-ui-lib';
import { makeStyles } from '@rneui/themed';

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
// export type Props = CompositeScreenProps<
//   NativeStackScreenProps<ReportFiltersNavigatorParamList, 'ReportFilters'>,
//   NativeStackScreenProps<ReportFiltersNavigatorParamList>
// >;

const ReportFiltersScreen = ({ navigation, route }: Props) => {
  const  { filterType } = route.params;
  
  const theme = useTheme();
  const s = useStyles(theme);

  const filters: ReportFilter[] = [
    {
      name: 'Test',
      reportType: ReportType.Events,
      values: {
        model: {
          relation: StringRelation.Any, // any, before, after, past
          value: '2023-11-17T03:28:04.651Z',
        },
        modelType: {
          relation: StringRelation.Any, // any, <, >, =, !=
          value: '0',
        },
        category: {
          relation: StringRelation.Any, // any, yes, no
          value: '',
        },
        date: {
          relation: StringRelation.Any, // any, before, after, past
          value: '2023-11-17T03:28:04.651Z',
        },
        duration: {
          relation: StringRelation.Any, // any, <, >, =, !=
          value: '',
        },
        pilot: {
          relation: StringRelation.Any, // any, contains, missing
          value: '',
        },
        location: {
          relation: StringRelation.Any, // any, contains, missing
          value: '',
        },
        modelStyle: {
          relation: StringRelation.Any, // any, contains, missing
          value: '',
        },
        outcome: {
          relation: StringRelation.Any, // any, contains, missing
          value: '',
        }
      }
    }
  ];

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

  const renderFilters: ListRenderItem<ReportFilter> = ({ item: filter, index }) => {
    return (
      <ListItemCheckboxInfo
        key={index}
        title={filter.name}
        subtitle={'Matches events where any model type, any category, any last event, any total time, any logs batteries, any logs fuel, any damaged, any vendor, and any notes.'}
        position={filters.length === 1 ? ['first', 'last'] : index === 0 ? ['first'] : index === filters.length - 1 ? ['last'] : []}
        checked={true}
        onPress={() => null}
        onPressInfo={() => filterType && navigation.navigate(reportFilterEditor[filterType], {
          filterId: '123456789012',
        })}
      />
    )
};

  return (
    <View style={theme.styles.view}>
      <Divider />
      <ListItemCheckboxInfo
        title={'No Filter'}
        subtitle={
          filterType === FilterType.ReportEventsFilter ?
          'Matches all events' :
          filterType === FilterType.ReportMaintenanceFilter ?
          'Matches all maintenance items' :
          filterType === FilterType.ReportModelScanCodesFilter ?
          'Matches all models' :
          filterType === FilterType.ReportBatteryScanCodesFilter ?
          'Matches all batteries' :
          ''
        }
        position={['first', 'last']}
        hideInfo={true}
        checked={true}
        onPress={() => null}
      />
      <Divider />
      <ListItem
        title={'Add a New Filter'}
        titleStyle={s.newFilter}
        position={['first', 'last']}
        rightImage={false}
        onPress={() => filterType && navigation.navigate(reportFilterEditor[filterType], {
          filterId: '123456789012',
        })}
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
        renderItem={renderFilters}
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
