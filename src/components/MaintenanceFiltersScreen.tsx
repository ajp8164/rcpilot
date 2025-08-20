import React, { useEffect, useRef, useState } from 'react';
import { FlatList, ListRenderItem, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import {
  Divider,
  ListEditorMethods,
  listItemPosition,
  useTheme,
} from '@react-native-hello/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQuery, useRealm } from '@realm/react';
import { ListItemCheckBoxInfo } from 'components/atoms/List';
import { FiltersListHeader } from 'components/molecules/FiltersListHeader';
import { filterSummary } from 'lib/filter';
import { defaultFilter } from 'lib/maintenance';
import { useConfirmAction } from 'lib/useConfirmAction';
import lodash from 'lodash';
import { Trash2 } from 'lucide-react-native';
import { BSON } from 'realm';
import { Filter } from 'realmdb/Filter';
import { selectFilters } from 'store/selectors/filterSelectors';
import { saveSelectedFilter } from 'store/slices/filters';
import { MaintenanceFiltersNavigatorParamList } from 'types/navigation';

export type Props = NativeStackScreenProps<
  MaintenanceFiltersNavigatorParamList,
  'MaintenanceFilters'
>;

const MaintenanceFiltersScreen = ({ navigation, route }: Props) => {
  const { filterType, modelType, useGeneralFilter } = route.params;

  const theme = useTheme();
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

  const listEditorRef = useRef<ListEditorMethods>(null);

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
          navigation.navigate('MaintenanceFilterEditor', {
            filterId: filter._id.toString(),
            filterType,
            generalFilterName: generalMaintenanceFilterName,
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
        filterSummary={filterSummary(generalMaintenanceFilter)}
        itemName={'maintenance log'}
        generalFilterId={generalMaintenanceFilter?._id.toString()}
        selectedFilterId={selectedFilterId}
        useGeneralFilter={useGeneralFilter}
        onPressEditGeneralFilter={() =>
          navigation.navigate('MaintenanceFilterEditor', {
            filterId: generalMaintenanceFilter?._id.toString() || '',
            filterType,
            generalFilterName: generalMaintenanceFilterName,
          })
        }
        onPressGeneralFilter={() => setFilter(generalMaintenanceFilter)}
        onPressNoFilter={setFilter}
      />
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
