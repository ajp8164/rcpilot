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
import { generalBatteriesFilterName } from 'components/BatteryFilterEditorScreen';
import { ListItemCheckBoxInfo } from 'components/atoms/List';
import { FiltersListHeader } from 'components/molecules/FiltersListHeader';
import { defaultFilter } from 'lib/battery';
import { filterSummary } from 'lib/filter';
import { useConfirmAction } from 'lib/useConfirmAction';
import { Trash2 } from 'lucide-react-native';
import { BSON } from 'realm';
import { Filter } from 'realmdb/Filter';
import { selectFilters } from 'store/selectors/filterSelectors';
import { saveSelectedFilter } from 'store/slices/filters';
import { BatteryFiltersNavigatorParamList } from 'types/navigation';

export type Props = NativeStackScreenProps<
  BatteryFiltersNavigatorParamList,
  'BatteryFilters'
>;

const BatteryFiltersScreen = ({ navigation, route }: Props) => {
  const { filterType, useGeneralFilter } = route.params;

  const theme = useTheme();
  const confirmAction = useConfirmAction();
  const dispatch = useDispatch();
  const realm = useRealm();

  const allBatteryFilters = useQuery(Filter, filters => {
    return filters.filtered(
      'type == $0 AND name != $1',
      filterType,
      generalBatteriesFilterName,
    );
  });

  const generalBatteriesFilterQuery = useQuery(Filter, filters => {
    return filters.filtered(
      'type == $0 AND name == $1',
      filterType,
      generalBatteriesFilterName,
    );
  });
  const [generalBatteriesFilter, setGeneralBatteriesFilter] =
    useState<Filter>();

  const selectedFilterId = useSelector(selectFilters(filterType));

  const listEditorRef = useRef<ListEditorMethods>(null);

  useEffect(() => {
    // Lazy initialization of a general batteries filter.
    if (!generalBatteriesFilterQuery.length) {
      realm.write(() => {
        const gbf = realm.create('Filter', {
          name: generalBatteriesFilterName,
          type: filterType,
          values: defaultFilter,
        });

        // @ts-ignore
        setGeneralBatteriesFilter(gbf);
      });
    } else {
      setGeneralBatteriesFilter(generalBatteriesFilterQuery[0]);
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
        subtitle={filterSummary(filter) + filterSummary(filter)}
        subtitleLines={0}
        position={listItemPosition(index, allBatteryFilters.length)}
        checked={filter._id.toString() === selectedFilterId}
        listEditor={listEditorRef.current}
        onPress={() => setFilter(filter)}
        onPressInfo={() =>
          navigation.navigate('BatteryFilterEditor', {
            filterId: filter._id.toString(),
            filterType,
            generalFilterName: generalBatteriesFilterName,
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
                  'This action cannot be undone.\nAre you sure you want to delete this filter?',
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
        filterSummary={filterSummary(generalBatteriesFilter)}
        itemName={'battery'}
        specificItemName={'batteries'}
        generalFilterId={generalBatteriesFilter?._id.toString()}
        selectedFilterId={selectedFilterId}
        useGeneralFilter={useGeneralFilter}
        onPressEditGeneralFilter={() =>
          navigation.navigate('BatteryFilterEditor', {
            filterId: generalBatteriesFilter?._id.toString() || '',
            filterType,
            generalFilterName: generalBatteriesFilterName,
          })
        }
        onPressGeneralFilter={() => setFilter(generalBatteriesFilter)}
        onPressNoFilter={setFilter}
      />
      <ListEditor ref={listEditorRef}>
        <FlatList
          data={allBatteryFilters}
          renderItem={renderFilters}
          keyExtractor={(_item, index) => `${index}`}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            allBatteryFilters.length ? (
              <Divider text={'SAVED BATTERY FILTERS'} />
            ) : null
          }
        />
      </ListEditor>
    </View>
  );
};

export default BatteryFiltersScreen;
