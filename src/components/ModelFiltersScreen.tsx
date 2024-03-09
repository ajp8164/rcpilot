import { Divider, useListEditor } from '@react-native-ajp-elements/ui';
import { FlatList, ListRenderItem } from 'react-native';
import { ListItemCheckboxInfo, listItemPosition, swipeableDeleteItem } from 'components/atoms/List';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useQuery, useRealm } from '@realm/react';

import { Filter } from 'realmdb/Filter';
import { FilterType } from 'types/filter';
import { ModelFiltersNavigatorParamList } from 'types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { View } from 'react-native-ui-lib';
import { defaultFilter } from 'lib/model';
import { filterSummary } from 'lib/filter';
import { generalModelsFilterName } from 'components/ModelFilterEditorScreen';
import { saveSelectedModelFilter } from 'store/slices/filters';
import { selectFilters } from 'store/selectors/filterSelectors';
import { useConfirmAction } from 'lib/useConfirmAction';
import { useTheme } from 'theme';

export type Props = NativeStackScreenProps<ModelFiltersNavigatorParamList, 'ModelFilters'>;

const ModelFiltersScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const listEditor = useListEditor();
  const confirmAction = useConfirmAction();
  const dispatch = useDispatch();
  const realm = useRealm();

  const allModelFilters = useQuery(Filter, filters => {
    return filters.filtered('type == $0 AND name != $1', FilterType.ModelsFilter, generalModelsFilterName);
  });

  const generalModelsFilterQuery = useQuery(Filter, filters => {
    return filters.filtered('type == $0 AND name == $1', FilterType.ModelsFilter, generalModelsFilterName);
  });
  const [generalModelsFilter, setGeneralModelsFilter] = useState<Filter>();

  const selectedFilterId = useSelector(selectFilters).modelFilterId;

  useEffect(() => {
    // Lazy initialization of a general models filter.
    if (!generalModelsFilterQuery.length) {
      realm.write(() => {
        const gmf = realm.create('Filter', {
          name: generalModelsFilterName,
          type: FilterType.ModelsFilter,
          values: defaultFilter,
        });

        // @ts-ignore
        setGeneralModelsFilter(gmf);
      });
    } else {
      setGeneralModelsFilter(generalModelsFilterQuery[0]);
    }
  }, []);
  
  const setFilter = (filter?: Filter) => {
    dispatch(
      saveSelectedModelFilter({
        filterId: filter?._id?.toString(),
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
        ref={ref => ref && listEditor.add(ref, 'model-filters', filter._id.toString())}
        key={index}
        title={filter.name}
        subtitle={filterSummary(filter)}
        position={listItemPosition(index, allModelFilters.length)}
        checked={filter._id.toString() === selectedFilterId}
        onPress={() => setFilter(filter)}
        onPressInfo={() => navigation.navigate('ModelFilterEditor', {
          filterId: filter._id.toString(),
        })}
        swipeable={{
          rightItems: [{
            ...swipeableDeleteItem[theme.mode],
            onPress: () => {
              confirmAction(deleteFilter, {
                label: 'Delete Saved Filter',
                title: 'This action cannot be undone.\nAre you sure you want to delete this saved filter?',
                value: filter,
              });
            }
          }]
        }}
        onSwipeableWillOpen={() => listEditor.onItemWillOpen('model-filters', filter._id.toString())}
        onSwipeableWillClose={listEditor.onItemWillClose}
      />
    )
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
      {generalModelsFilter && 
        <ListItemCheckboxInfo
          title={'General Models Filter'}
          subtitle={filterSummary(generalModelsFilter)}
          // subtitle={'Matches models where any model type, any category, any last event, any total time, any logs batteries, any logs fuel, any damaged, any vendor, and any notes.'}
          position={['first', 'last']}
          checked={generalModelsFilter._id.toString() === selectedFilterId}
          onPress={() => setFilter(generalModelsFilter)}
          onPressInfo={() => navigation.navigate('ModelFilterEditor', {
            filterId: generalModelsFilter!._id.toString(),
          })}
        />
      }
      <Divider note
        text={'You can save the General Models Filter to remember a specific filter configuration for later use.'}
      />      
      <FlatList
        data={allModelFilters}
        renderItem={renderFilters}
        keyExtractor={(_item, index) => `${index}`}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={allModelFilters.length ? <Divider text={'SAVED MODEL FILTERS'} /> : null}
      />
    </View>
  );
};

export default ModelFiltersScreen;
