import { Divider, useListEditor } from '@react-native-ajp-elements/ui';
import { FlatList, ListRenderItem } from 'react-native';
import { ListItem, ListItemCheckboxInfo, listItemPosition, swipeableDeleteItem } from 'components/atoms/List';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useQuery, useRealm } from '@realm/react';

import { Filter } from 'realmdb/Filter';
import { ModelFiltersNavigatorParamList } from 'types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { View } from 'react-native-ui-lib';
import { defaultFilter } from 'lib/model';
import { filterSummary } from 'lib/filter';
import lodash from 'lodash';
import { saveSelectedFilter } from 'store/slices/filters';
import { selectFilters } from 'store/selectors/filterSelectors';
import { useConfirmAction } from 'lib/useConfirmAction';
import { useTheme } from 'theme';

export type Props = NativeStackScreenProps<ModelFiltersNavigatorParamList, 'ModelFilters'>;

const ModelFiltersScreen = ({ navigation, route }: Props) => {
  const { filterType, useGeneralFilter } = route.params;

  const theme = useTheme();
  const listEditor = useListEditor();
  const confirmAction = useConfirmAction();
  const dispatch = useDispatch();
  const realm = useRealm();

  const generalModelsFilterName = `general-${lodash.kebabCase(filterType)}`;
  const allModelFilters = useQuery(Filter, filters => {
    return filters.filtered('type == $0 AND name != $1', filterType, generalModelsFilterName);
  });

  const generalModelsFilterQuery = useQuery(Filter, filters => {
    return filters.filtered('type == $0 AND name == $1', filterType, generalModelsFilterName);
  });
  const [generalModelsFilter, setGeneralModelsFilter] = useState<Filter>();

  const selectedFilterId = useSelector(selectFilters(filterType));

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
  }, []);
  
  const setFilter = (filter?: Filter) => {
    dispatch(
      saveSelectedFilter({
        filterType,
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
          filterType,
          generalFilterName: generalModelsFilterName,
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
      {useGeneralFilter && generalModelsFilter ?
        <>
          <ListItemCheckboxInfo
            title={'General Models Filter'}
            subtitle={filterSummary(generalModelsFilter)}
            // subtitle={'Matches models where any model type, any category, any last event, any total time, any logs batteries, any logs fuel, any damaged, any vendor, and any notes.'}
            position={['first', 'last']}
            checked={generalModelsFilter._id.toString() === selectedFilterId}
            onPress={() => setFilter(generalModelsFilter)}
            onPressInfo={() => navigation.navigate('ModelFilterEditor', {
              filterId: generalModelsFilter!._id.toString(),
              filterType,
              generalFilterName: generalModelsFilterName,
            })}
          />
          <Divider note
            text={'You can save the General Models Filter to remember a specific filter configuration for later use.'}
          />      
        </>
        :
        <ListItem
          title={'Add New Filter'}
          titleStyle={theme.styles.listItemButtonTitle}
          position={['first', 'last']}
          rightImage={false}
          onPress={() => navigation.navigate('ModelFilterEditor', {
            filterId: generalModelsFilter!._id.toString(),
            filterType,
            generalFilterName: generalModelsFilterName,
            requireFilterName: true,
          })}
        />
      }
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
