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
import { defaultFilter } from 'lib/reports/reportMaintenance';
import { useConfirmAction } from 'lib/useConfirmAction';
import lodash from 'lodash';
import { Plus, Trash2 } from 'lucide-react-native';
import { BSON } from 'realm';
import { Filter } from 'realmdb/Filter';
import { selectFilters } from 'store/selectors/filterSelectors';
import { saveSelectedFilter } from 'store/slices/filters';
import { ReportMaintenanceFiltersNavigatorParamList } from 'types/navigation';

export type Props = NativeStackScreenProps<
  ReportMaintenanceFiltersNavigatorParamList,
  'ReportMaintenanceFilters'
>;

const ReportMaintenanceFiltersScreen = ({ navigation, route }: Props) => {
  const { filterType, modelType, useGeneralFilter } = route.params;

  const theme = useTheme();
  const confirmAction = useConfirmAction();
  const dispatch = useDispatch();
  const realm = useRealm();

  const generalReportMaintenanceFilterName = `general-${lodash.kebabCase(filterType)}`;
  const allMaintenanceFilters = useQuery(Filter, filters => {
    return filters.filtered(
      'type == $0 AND name != $1',
      filterType,
      generalReportMaintenanceFilterName,
    );
  });

  const generalReportMaintenancesFilterQuery = useQuery(Filter, filters => {
    return filters.filtered(
      'type == $0 AND name == $1',
      filterType,
      generalReportMaintenanceFilterName,
    );
  });
  const [generalReportMaintenanceFilter, setGeneralMaintenanceFilter] =
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
              <Plus color={theme.colors.screenHeaderButtonText} size={28} />
            }
            onPress={() =>
              generalReportMaintenanceFilter &&
              navigation.navigate('ReportMaintenanceFilterEditor', {
                filterId: generalReportMaintenanceFilter._id.toString(),
                filterType,
                generalFilterName: generalReportMaintenanceFilterName,
                modelType,
                requireFilterName: true,
              })
            }
          />
        );
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [generalReportMaintenanceFilter, generalReportMaintenanceFilterName]);

  useEffect(() => {
    // Lazy initialization of a general model mointenance filter.
    if (!generalReportMaintenancesFilterQuery.length) {
      realm.write(() => {
        const gef = realm.create('Filter', {
          name: generalReportMaintenanceFilterName,
          type: filterType,
          values: defaultFilter,
        });

        // @ts-ignore
        setGeneralMaintenanceFilter(gef);
      });
    } else {
      setGeneralMaintenanceFilter(generalReportMaintenancesFilterQuery[0]);
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
        position={listItemPosition(index, allMaintenanceFilters.length)}
        checked={filter._id.toString() === selectedFilterId}
        listEditor={listEditorRef.current}
        onPress={() => setFilter(filter)}
        onPressInfo={() =>
          navigation.navigate('ReportMaintenanceFilterEditor', {
            filterId: filter._id.toString(),
            filterType,
            generalFilterName: generalReportMaintenanceFilterName,
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
        filterSummary={filterSummary(generalReportMaintenanceFilter)}
        itemName={'maintenance log'}
        generalFilterId={generalReportMaintenanceFilter?._id.toString()}
        selectedFilterId={selectedFilterId}
        useGeneralFilter={useGeneralFilter}
        onPressEditGeneralFilter={() =>
          navigation.navigate('ReportMaintenanceFilterEditor', {
            filterId: generalReportMaintenanceFilter?._id.toString() || '',
            filterType,
            generalFilterName: generalReportMaintenanceFilterName,
            modelType,
          })
        }
        onPressGeneralFilter={() => setFilter(generalReportMaintenanceFilter)}
        onPressNoFilter={setFilter}
      />
      <ListEditor ref={listEditorRef}>
        <FlatList
          data={allMaintenanceFilters}
          renderItem={renderFilters}
          keyExtractor={(_item, index) => `${index}`}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            allMaintenanceFilters.length ? (
              <Divider text={'SAVED MAINTEANCE FILTERS'} />
            ) : null
          }
        />
      </ListEditor>
    </View>
  );
};

export default ReportMaintenanceFiltersScreen;
