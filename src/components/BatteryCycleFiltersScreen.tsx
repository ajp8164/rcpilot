import { DateRelation, NumberRelation, StringRelation } from 'components/molecules/filters';
import { FlatList, ListRenderItem } from 'react-native';
import { ListItemCheckboxInfo, listItemPosition } from 'components/atoms/List';

import { BatteryCycleFiltersNavigatorParamList } from 'types/navigation';
import { Divider } from '@react-native-ajp-elements/ui';
import { Filter } from 'realmdb/Filter';
import { FilterType } from 'types/filter';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { View } from 'react-native-ui-lib';
import { useTheme } from 'theme';

export type Props = NativeStackScreenProps<BatteryCycleFiltersNavigatorParamList, 'BatteryCycleFilters'>;

const BatteryCycleFiltersScreen = ({ navigation }: Props) => {
  const theme = useTheme();
    
  const filters: Filter[] = [
    {
      _id: {},
      name: 'Test',
      type: FilterType.BatteryCycleFilter,
      values: {
        dischargeDate: {
          relation: DateRelation.Any,
          value: [''],
        },
        dischargeDuration: {
          relation: NumberRelation.Any,
          value: [''],
        },
        chargeDate: {
          relation: DateRelation.Any,
          value: [''],
        },
        chargeAmount: {
          relation: NumberRelation.Any,
          value: [''],
        },
        notes: {
          relation: StringRelation.Any,
          value: [''],
        },
      }
    },
  ];

  const renderFilters: ListRenderItem<Filter> = ({ item: filter, index }) => {
    return (
      <ListItemCheckboxInfo
        key={index}
        title={filter.name}
        subtitle={`Matches batteries where any chemistry, any total cycles, any capacity, any C rating, any S cells, and any P cells.`}
        position={listItemPosition(index, filters.length)}
        checked={true}
        onPress={() => null}
        onPressInfo={() => navigation.navigate('BatteryCycleFilterEditor', {
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
        subtitle={'Matches all battery cycles.'}
        position={['first', 'last']}
        hideInfo={true}
        checked={true}
        onPress={() => null}
      />
      <Divider />
      <ListItemCheckboxInfo
        title={'General Battery Cycles Filter'}
        subtitle={'Matches cycles where any discharge date, any discharge duration, any charge date, any charge amount, any notes.'}
        position={['first', 'last']}
        checked={true}
        onPress={() => null}
        onPressInfo={() => navigation.navigate('BatteryCycleFilterEditor', {
          filterId: '1',
        })}
      />
      <Divider
        type={'note'}
        text={'You can save the General Battery Cycle Filter to remember a specific filter configuration for later use.'}
      />
      <Divider text={'SAVED BATTERY CYCLE FILTERS'} />
      <FlatList
        data={filters}
        renderItem={renderFilters}
        keyExtractor={(_item, index) => `${index}`}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default BatteryCycleFiltersScreen;
