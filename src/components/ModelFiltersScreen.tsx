import { FlatList, ListRenderItem } from 'react-native';
import { ListItemCheckboxInfo, listItemPosition } from 'components/atoms/List';

import { Divider } from '@react-native-ajp-elements/ui';
import { ModelFilter } from 'types/filter';
import { ModelFiltersNavigatorParamList } from 'types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { View } from 'react-native-ui-lib';
import { useTheme } from 'theme';

export type Props = NativeStackScreenProps<ModelFiltersNavigatorParamList, 'ModelFilters'>;

const ModelFiltersScreen = ({ navigation }: Props) => {
  const theme = useTheme();

  const filters: ModelFilter[] = [
    {
      name: 'Helicopters',
      type: {
        select: 'any', // any, is, is not
        value: '',
      },
      lastEvent: {
        select: 'any', // any, before, after, past
        value: '2023-11-17T03:28:04.651Z',
      },
      totalTime: {
        select: 'any', // any, <, >, =, !=
        value: '0',
      },
      logsBatteries: {
        select: 'any', // any, yes, no
      },
      logsFuel: {
        select: 'any', // any, <, >, =, !=
      },
      damaged: {
        select: 'any', // any, <, >, =, !=
      },
      vendor: {
        select: 'any', // any, contains, missing
        value: '',
      },
      notes: {
        select: 'any', // any, contains, missing
        value: '',
      }
    }
  ];

  const renderFilters: ListRenderItem<ModelFilter> = ({ item: filter, index }) => {
    return (
      <ListItemCheckboxInfo
        key={index}
        title={filter.name}
        subtitle={'Matches models where any model type, any category, any last event, any total time, any logs batteries, any logs fuel, any damaged, any vendor, and any notes.'}
        position={listItemPosition(index, filters.length)}
        checked={true}
        onPress={() => null}
        onPressInfo={() => navigation.navigate('ModelFilterEditor', {
          filterId: '1',
        })}
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
        checked={true}
        onPress={() => null}
      />
      <Divider />
      <ListItemCheckboxInfo
        title={'General Models Filter'}
        subtitle={'Matches models where any model type, any category, any last event, any total time, any logs batteries, any logs fuel, any damaged, any vendor, and any notes.'}
        position={['first', 'last']}
        checked={true}
        onPress={() => null}
        onPressInfo={() => navigation.navigate('ModelFilterEditor', {
          filterId: '1',
        })}
      />
      <Divider
        type={'note'}
        text={'You can save the General Models Filter to remember a specific filter configuration for later use.'}
      />
      <Divider text={'SAVED MODEL FILTERS'} />
      <FlatList
        data={filters}
        renderItem={renderFilters}
        keyExtractor={(_item, index) => `${index}`}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default ModelFiltersScreen;
