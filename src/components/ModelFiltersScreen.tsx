import {
  Divider,
  ListEditor,
  ListEditorMethods,
  listItemPosition,
} from '@react-native-hello/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQuery, useRealm } from '@realm/react';
import { ListItemCheckBoxInfo } from 'components/atoms/List';
import { FiltersListHeader } from 'components/molecules/FiltersListHeader';
import { filterSummary } from 'lib/filter';
import { defaultFilter } from 'lib/model';
import { useConfirmAction } from 'lib/useConfirmAction';
import lodash from 'lodash';
import { Trash2 } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { FlatList, ListRenderItem, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { BSON } from 'realm';
import { Filter } from 'realmdb/Filter';
import { selectFilters } from 'store/selectors/filterSelectors';
import { saveSelectedFilter } from 'store/slices/filters';
import { useTheme } from 'theme';
import { ModelFiltersNavigatorParamList } from 'types/navigation';

export type Props = NativeStackScreenProps<
  ModelFiltersNavigatorParamList,
  'ModelFilters'
>;

const ModelFiltersScreen = ({ navigation, route }: Props) => {
  const { filterType, useGeneralFilter } = route.params;

  const theme = useTheme();
  const confirmAction = useConfirmAction();
  const dispatch = useDispatch();
  const realm = useRealm();

  const generalModelsFilterName = `general-${lodash.kebabCase(filterType)}`;
  const allModelFilters = useQuery(Filter, filters => {
    return filters.filtered(
      'type == $0 AND name != $1',
      filterType,
      generalModelsFilterName,
    );
  });

  const generalModelsFilterQuery = useQuery(Filter, filters => {
    return filters.filtered(
      'type == $0 AND name == $1',
      filterType,
      generalModelsFilterName,
    );
  });
  const [generalModelsFilter, setGeneralModelsFilter] = useState<Filter>();

  const selectedFilterId = useSelector(selectFilters(filterType));

  const listEditorRef = useRef<ListEditorMethods>(null);

  useEffect(() => {
    // Lazy initialization of a general models filter.
    if (!generalModelsFilterQuery.length) {
      realm.write(() => {
        const gmf = realm.create('Filter', {
          name: generalModelsFilterName,
          type: filterType,
          values: defaultFilter,
        });

        // @ts-ignore
        setGeneralModelsFilter(gmf);
      });
    } else {
      setGeneralModelsFilter(generalModelsFilterQuery[0]);
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
        position={listItemPosition(index, allModelFilters.length)}
        checked={filter._id.toString() === selectedFilterId}
        listEditor={listEditorRef.current}
        onPress={() => setFilter(filter)}
        onPressInfo={() =>
          navigation.navigate('ModelFilterEditor', {
            filterId: filter._id.toString(),
            filterType,
            generalFilterName: generalModelsFilterName,
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
        filterSummary={filterSummary(generalModelsFilter)}
        itemName={'model'}
        generalFilterId={generalModelsFilter?._id.toString()}
        selectedFilterId={selectedFilterId}
        useGeneralFilter={useGeneralFilter}
        onPressEditGeneralFilter={() =>
          navigation.navigate('ModelFilterEditor', {
            filterId: generalModelsFilter?._id.toString() || '',
            filterType,
            generalFilterName: generalModelsFilterName,
          })
        }
        onPressGeneralFilter={() => setFilter(generalModelsFilter)}
        onPressNoFilter={setFilter}
      />
      <ListEditor ref={listEditorRef}>
        <FlatList
          data={allModelFilters}
          renderItem={renderFilters}
          keyExtractor={(_item, index) => `${index}`}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            allModelFilters.length ? (
              <Divider text={'SAVED MODEL FILTERS'} />
            ) : null
          }
        />
      </ListEditor>
    </View>
  );
};

export default ModelFiltersScreen;
