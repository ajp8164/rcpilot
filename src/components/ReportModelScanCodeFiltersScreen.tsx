import React, { useEffect, useRef, useState } from 'react';
import { FlatList, ListRenderItem, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import {
  Divider,
  ListEditor,
  ListEditorMethods,
  listItemPosition,
  useTheme,
} from '@react-native-hello/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQuery, useRealm } from '@realm/react';
import { Button } from 'components/atoms/Button';
import { ListItemCheckBoxInfo } from 'components/atoms/List';
import { FiltersListHeader } from 'components/molecules/FiltersListHeader';
import { filterSummary } from 'lib/filter';
import { defaultFilter } from 'lib/reports/reportModelScanCode';
import { useConfirmAction } from 'lib/useConfirmAction';
import lodash from 'lodash';
import { Plus, Trash2 } from 'lucide-react-native';
import { BSON } from 'realm';
import { Filter } from 'realmdb/Filter';
import { selectFilters } from 'store/selectors/filterSelectors';
import { saveSelectedFilter } from 'store/slices/filters';
import { ReportModelScanCodeFiltersNavigatorParamList } from 'types/navigation';

export type Props = NativeStackScreenProps<
  ReportModelScanCodeFiltersNavigatorParamList,
  'ReportModelScanCodeFilters'
>;

const ReportModelScanCodeFiltersScreen = ({ navigation, route }: Props) => {
  const { filterType, modelType, useGeneralFilter } = route.params;

  const theme = useTheme();
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
  const [generalReportModelScanCodesFilter, setGeneralModelScanCodesFilter] =
    useState<Filter>();

  const selectedFilterId = useSelector(selectFilters(filterType));

  const listEditorRef = useRef<ListEditorMethods>(null);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => {
        return (
          <Button
            buttonStyle={theme.styles.buttonScreenHeader}
            headerRight
            icon={
              <Plus color={theme.colors.screenHeaderButtonText} size={33} />
            }
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
        );
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    generalReportModelScanCodesFilter,
    generalReportModelScanCodesFilterName,
  ]);

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

  const deleteFilter = (filterId: string) => {
    if (selectedFilterId === filterId) {
      setFilter();
    }

    // Wait for filter setting to change before deletion.
    setTimeout(() => {
      const filter = realm.objectForPrimaryKey(
        'Filter',
        new BSON.ObjectId(filterId),
      );
      if (filter?.isValid()) {
        realm.write(() => {
          realm.delete(filter);
        });
      }
    });
  };

  const renderFilters: ListRenderItem<Filter> = ({ item: filter, index }) => {
    return (
      <ListItemCheckBoxInfo
        key={filter._id.toString()}
        title={filter.name}
        subtitle={filterSummary(filter)}
        subtitleLines={0}
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
        swipeableActionsRight={[
          {
            text: 'Delete',
            color: theme.colors.assertive,
            ButtonComponent: <Trash2 color={theme.colors.stickyWhite} />,
            op: 'remove',
            confirmation: () => {
              listEditorRef.current?.reset();
              return confirmAction({
                label: 'Delete Saved Filter',
                title:
                  'This action cannot be undone.\nAre you sure you want to delete this saved filter?',
              });
            },
            onPress: () => deleteFilter(filter._id.toString()),
          },
        ]}
      />
    );
  };

  return (
    <View style={theme.styles.view}>
      <FiltersListHeader
        filterSummary={filterSummary(generalReportModelScanCodesFilter)}
        itemName={'model'}
        generalFilterId={generalReportModelScanCodesFilter?._id.toString()}
        selectedFilterId={selectedFilterId}
        useGeneralFilter={useGeneralFilter}
        onPressEditGeneralFilter={() =>
          navigation.navigate('ReportModelScanCodeFilterEditor', {
            filterId: generalReportModelScanCodesFilter?._id.toString() || '',
            filterType,
            generalFilterName: generalReportModelScanCodesFilterName,
            modelType,
          })
        }
        onPressGeneralFilter={() =>
          setFilter(generalReportModelScanCodesFilter)
        }
        onPressNoFilter={setFilter}
      />
      <ListEditor ref={listEditorRef}>
        <FlatList
          data={allModelScanCodeFilters}
          renderItem={renderFilters}
          keyExtractor={(_item, index) => `${index}`}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            allModelScanCodeFilters.length ? (
              <Divider text={'SAVED MODEL FILTERS'} />
            ) : null
          }
        />
      </ListEditor>
    </View>
  );
};

export default ReportModelScanCodeFiltersScreen;
