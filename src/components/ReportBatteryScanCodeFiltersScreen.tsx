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
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ReportBatteryScanCodeFiltersNavigatorParamList } from 'types/navigation';
import { defaultFilter } from 'lib/reports/reportBatteryScanCode';
import { filterSummary } from 'lib/filter';
import lodash from 'lodash';
import { saveSelectedFilter } from 'store/slices/filters';
import { selectFilters } from 'store/selectors/filterSelectors';
import { useConfirmAction } from 'lib/useConfirmAction';
import { useTheme } from 'theme';

export type Props = NativeStackScreenProps<
  ReportBatteryScanCodeFiltersNavigatorParamList,
  'ReportBatteryScanCodeFilters'
>;

const ReportBatteryScanCodeFiltersScreen = ({ navigation, route }: Props) => {
  const { filterType, modelType, useGeneralFilter } = route.params;

  const theme = useTheme();
  const listEditor = useListEditor();
  const confirmAction = useConfirmAction();
  const dispatch = useDispatch();
  const realm = useRealm();

  const generalReportBatteryScanCodesFilterName = `general-${lodash.kebabCase(filterType)}`;
  const allBatteryScanCodeFilters = useQuery(Filter, filters => {
    return filters.filtered(
      'type == $0 AND name != $1',
      filterType,
      generalReportBatteryScanCodesFilterName,
    );
  });

  const generalReportBatteryScanCodesFilterQuery = useQuery(Filter, filters => {
    return filters.filtered(
      'type == $0 AND name == $1',
      filterType,
      generalReportBatteryScanCodesFilterName,
    );
  });
  const [
    generalReportBatteryScanCodesFilter,
    setGeneralBatteryScanCodesFilter,
  ] = useState<Filter>();

  const selectedFilterId = useSelector(selectFilters(filterType));

  useEffect(() => {
    // Lazy initialization of a general report battery scan codes filter.
    if (!generalReportBatteryScanCodesFilterQuery.length) {
      realm.write(() => {
        const gef = realm.create('Filter', {
          name: generalReportBatteryScanCodesFilterName,
          type: filterType,
          values: defaultFilter,
        });

        // @ts-ignore
        setGeneralBatteryScanCodesFilter(gef);
      });
    } else {
      setGeneralBatteryScanCodesFilter(
        generalReportBatteryScanCodesFilterQuery[0],
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        ref={ref =>
          ref &&
          listEditor.add(
            ref,
            'report-battery-scan-code-filters',
            filter._id.toString(),
          )
        }
        key={index}
        title={filter.name}
        subtitle={filterSummary(filter)}
        position={listItemPosition(index, allBatteryScanCodeFilters.length)}
        checked={filter._id.toString() === selectedFilterId}
        onPress={() => setFilter(filter)}
        onPressInfo={() =>
          navigation.navigate('ReportBatteryScanCodeFilterEditor', {
            filterId: filter._id.toString(),
            filterType,
            generalFilterName: generalReportBatteryScanCodesFilterName,
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
            'report-battery-scan-code-filters',
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
        subtitle={'Matches all batteries'}
        position={['first', 'last']}
        hideInfo={true}
        checked={!selectedFilterId}
        onPress={setFilter}
      />
      <Divider />
      {useGeneralFilter && generalReportBatteryScanCodesFilter ? (
        <>
          <ListItemCheckboxInfo
            title={`General Battery Filter`}
            subtitle={filterSummary(generalReportBatteryScanCodesFilter)}
            position={['first', 'last']}
            checked={
              generalReportBatteryScanCodesFilter._id.toString() ===
              selectedFilterId
            }
            onPress={() => setFilter(generalReportBatteryScanCodesFilter)}
            onPressInfo={() =>
              navigation.navigate('ReportBatteryScanCodeFilterEditor', {
                filterId: generalReportBatteryScanCodesFilter._id.toString(),
                filterType,
                generalFilterName: generalReportBatteryScanCodesFilterName,
                modelType,
              })
            }
          />
          <Divider
            note
            text={`You can save the General Batteries Filter to remember a specific filter configuration for later use.`}
          />
        </>
      ) : (
        <ListItem
          title={'Add New Filter'}
          titleStyle={theme.styles.listItemButtonTitle}
          position={['first', 'last']}
          rightImage={false}
          onPress={() =>
            generalReportBatteryScanCodesFilter &&
            navigation.navigate('ReportBatteryScanCodeFilterEditor', {
              filterId: generalReportBatteryScanCodesFilter._id.toString(),
              filterType,
              generalFilterName: generalReportBatteryScanCodesFilterName,
              modelType,
              requireFilterName: true,
            })
          }
        />
      )}
      <FlatList
        data={allBatteryScanCodeFilters}
        renderItem={renderFilters}
        keyExtractor={(_item, index) => `${index}`}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          allBatteryScanCodeFilters.length ? (
            <Divider text={'SAVED BATTERY FILTERS'} />
          ) : null
        }
      />
    </View>
  );
};

export default ReportBatteryScanCodeFiltersScreen;
