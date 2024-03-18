import { Divider, useListEditor } from '@react-native-ajp-elements/ui';
import { FlatList, ListRenderItem } from 'react-native';
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
import { ReportModelScanCodeFiltersNavigatorParamList } from 'types/navigation';
import { View } from 'react-native-ui-lib';
import { defaultFilter } from 'lib/reportModelScanCode';
import { filterSummary } from 'lib/filter';
import lodash from 'lodash';
import { saveSelectedFilter } from 'store/slices/filters';
import { selectFilters } from 'store/selectors/filterSelectors';
import { useConfirmAction } from 'lib/useConfirmAction';
import { useTheme } from 'theme';

export type Props = NativeStackScreenProps<
  ReportModelScanCodeFiltersNavigatorParamList,
  'ReportModelScanCodeFilters'
>;

const ReportModelScanCodeFiltersScreen = ({ navigation, route }: Props) => {
  const { filterType, modelType, useGeneralFilter } = route.params;

  const theme = useTheme();
  const listEditor = useListEditor();
  const confirmAction = useConfirmAction();
  const dispatch = useDispatch();
  const realm = useRealm();

  const generalReportModelScanCodesFilterName = `general-${lodash.kebabCase(filterType)}`;
  const allModelScanCodeFilters = useQuery(Filter, filters => {
    return filters.filtered(
      'type == $0 AND name != $1',
      filterType,
      generalReportModelScanCodesFilterName,
    );
  });

  const generalReportModelScanCodesFilterQuery = useQuery(Filter, filters => {
    return filters.filtered(
      'type == $0 AND name == $1',
      filterType,
      generalReportModelScanCodesFilterName,
    );
  });
  const [generalReportModelScanCodesFilter, setGeneralModelScanCodesFilter] = useState<Filter>();

  const selectedFilterId = useSelector(selectFilters(filterType));

  useEffect(() => {
    // Lazy initialization of a general report model scan codes filter.
    if (!generalReportModelScanCodesFilterQuery.length) {
      realm.write(() => {
        const gef = realm.create('Filter', {
          name: generalReportModelScanCodesFilterName,
          type: filterType,
          values: defaultFilter,
        });

        // @ts-ignore
        setGeneralModelScanCodesFilter(gef);
      });
    } else {
      setGeneralModelScanCodesFilter(generalReportModelScanCodesFilterQuery[0]);
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
          ref && listEditor.add(ref, 'report-model-scan-code-filters', filter._id.toString())
        }
        key={index}
        title={filter.name}
        subtitle={filterSummary(filter)}
        position={listItemPosition(index, allModelScanCodeFilters.length)}
        checked={filter._id.toString() === selectedFilterId}
        onPress={() => setFilter(filter)}
        onPressInfo={() =>
          navigation.navigate('ReportModelScanCodeFilterEditor', {
            filterId: filter._id.toString(),
            filterType,
            generalFilterName: generalReportModelScanCodesFilterName,
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
          listEditor.onItemWillOpen('report-model-scan-code-filters', filter._id.toString())
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
        subtitle={'Matches all models'}
        position={['first', 'last']}
        hideInfo={true}
        checked={!selectedFilterId}
        onPress={setFilter}
      />
      <Divider />
      {useGeneralFilter && generalReportModelScanCodesFilter ? (
        <>
          <ListItemCheckboxInfo
            title={`General Model Filter`}
            subtitle={filterSummary(generalReportModelScanCodesFilter)}
            position={['first', 'last']}
            checked={generalReportModelScanCodesFilter._id.toString() === selectedFilterId}
            onPress={() => setFilter(generalReportModelScanCodesFilter)}
            onPressInfo={() =>
              navigation.navigate('ReportModelScanCodeFilterEditor', {
                filterId: generalReportModelScanCodesFilter._id.toString(),
                filterType,
                generalFilterName: generalReportModelScanCodesFilterName,
                modelType,
              })
            }
          />
          <Divider
            note
            text={`You can save the General Models Filter to remember a specific filter configuration for later use.`}
          />
        </>
      ) : (
        <ListItem
          title={'Add New Filter'}
          titleStyle={theme.styles.listItemButtonTitle}
          position={['first', 'last']}
          rightImage={false}
          onPress={() =>
            generalReportModelScanCodesFilter &&
            navigation.navigate('ReportModelScanCodeFilterEditor', {
              filterId: generalReportModelScanCodesFilter._id.toString(),
              filterType,
              generalFilterName: generalReportModelScanCodesFilterName,
              modelType,
              requireFilterName: true,
            })
          }
        />
      )}
      <FlatList
        data={allModelScanCodeFilters}
        renderItem={renderFilters}
        keyExtractor={(_item, index) => `${index}`}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          allModelScanCodeFilters.length ? <Divider text={'SAVED MODEL FILTERS'} /> : null
        }
      />
    </View>
  );
};

export default ReportModelScanCodeFiltersScreen;
