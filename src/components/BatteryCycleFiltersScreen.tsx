import {
  Divider,
  ListEditor,
  ListEditorMethods,
  listItemPosition,
  useTheme,
} from '@react-native-hello/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQuery, useRealm } from '@realm/react';
import { generalBatteryCyclesFilterName } from 'components/BatteryCycleFilterEditorScreen';
import { ListItemCheckBoxInfo } from 'components/atoms/List';
import { FiltersListHeader } from 'components/molecules/FiltersListHeader';
import { defaultFilter } from 'lib/batteryCycle';
import { filterSummary } from 'lib/filter';
import { useConfirmAction } from 'lib/useConfirmAction';
import { Trash2 } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { FlatList, ListRenderItem, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { BSON } from 'realm';
import { Filter } from 'realmdb/Filter';
import { selectFilters } from 'store/selectors/filterSelectors';
import { saveSelectedFilter } from 'store/slices/filters';
import { FilterType } from 'types/filter';
import { BatteryCycleFiltersNavigatorParamList } from 'types/navigation';

export type Props = NativeStackScreenProps<
  BatteryCycleFiltersNavigatorParamList,
  'BatteryCycleFilters'
>;

const BatteryCycleFiltersScreen = ({ navigation, route }: Props) => {
  const { useGeneralFilter } = route.params;

  const theme = useTheme();
  const confirmAction = useConfirmAction();
  const dispatch = useDispatch();
  const realm = useRealm();

  const listEditorRef = useRef<ListEditorMethods>(null);

  const allBatteryCycleFilters = useQuery(Filter, filters => {
    return filters.filtered(
      'type == $0 AND name != $1',
      FilterType.BatteryCyclesFilter,
      generalBatteryCyclesFilterName,
    );
  });

  const generalBatteryCyclesFilterQuery = useQuery(Filter, filters => {
    return filters.filtered(
      'type == $0 AND name == $1',
      FilterType.BatteryCyclesFilter,
      generalBatteryCyclesFilterName,
    );
  });
  const [generalBatteryCyclesFilter, setGeneralBatteryCyclesFilter] =
    useState<Filter>();

  const selectedFilterId = useSelector(
    selectFilters(FilterType.BatteryCyclesFilter),
  );

  useEffect(() => {
    // Lazy initialization of a general battery cycles filter.
    if (!generalBatteryCyclesFilterQuery.length) {
      realm.write(() => {
        const gcf = realm.create('Filter', {
          name: generalBatteryCyclesFilterName,
          type: FilterType.BatteryCyclesFilter,
          values: defaultFilter,
        });

        // @ts-ignore
        setGeneralBatteryCyclesFilter(gcf);
      });
    } else {
      setGeneralBatteryCyclesFilter(generalBatteryCyclesFilterQuery[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setFilter = (filter?: Filter) => {
    dispatch(
      saveSelectedFilter({
        filterType: FilterType.BatteryCyclesFilter,
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
        position={listItemPosition(index, allBatteryCycleFilters.length)}
        checked={filter._id.toString() === selectedFilterId}
        listEditor={listEditorRef.current}
        onPress={() => setFilter(filter)}
        onPressInfo={() =>
          navigation.navigate('BatteryCycleFilterEditor', {
            filterId: filter._id.toString(),
            filterType: FilterType.BatteryCyclesFilter,
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
        filterSummary={filterSummary(generalBatteryCyclesFilter)}
        itemName={'battery cycle'}
        generalFilterId={generalBatteryCyclesFilter?._id.toString()}
        selectedFilterId={selectedFilterId}
        useGeneralFilter={useGeneralFilter}
        onPressEditGeneralFilter={() =>
          navigation.navigate('BatteryCycleFilterEditor', {
            filterId: generalBatteryCyclesFilter?._id.toString() || '',
            filterType: FilterType.BatteryCyclesFilter,
          })
        }
        onPressGeneralFilter={() => setFilter(generalBatteryCyclesFilter)}
        onPressNoFilter={setFilter}
      />
      <ListEditor ref={listEditorRef}>
        <FlatList
          data={allBatteryCycleFilters}
          renderItem={renderFilters}
          keyExtractor={(_item, index) => `${index}`}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            allBatteryCycleFilters.length ? (
              <Divider text={'SAVED BATTERY CYCLE FILTERS'} />
            ) : null
          }
        />
      </ListEditor>
    </View>
  );
};

export default BatteryCycleFiltersScreen;
