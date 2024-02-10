import { FlatList, ListRenderItem } from 'react-native';
import { ListItemCheckboxInfo, listItemPosition } from 'components/atoms/List';

import { BatteryFilter } from 'types/filter';
import { BatteryFiltersNavigatorParamList } from 'types/navigation';
import { Divider } from '@react-native-ajp-elements/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { View } from 'react-native-ui-lib';
import { useTheme } from 'theme';

export type Props = NativeStackScreenProps<BatteryFiltersNavigatorParamList, 'BatteryFilters'>;

const BatteryFiltersScreen = ({ navigation }: Props) => {
  const theme = useTheme();
    
  const filters: BatteryFilter[] = [
    {
      name: '3S',
      chemistry: {
        select: 'any', // any, is, is not
        value: '',
      },
      totalTime: {
        select: 'any', // any, <, >, =, !=
        value: '0',
      },
      capacity: {
        select: 'any', // any, <, >, =, !=
        value: '0',
      },
      cRating: {
        select: 'any', // any, <, >, =, !=
        value: '0',
      },
      sCells: {
        select: 'any', // any, <, >, =, !=
        value: '0',
      },
      pCells: {
        select: 'any', // any, <, >, =, !=
        value: '0',
      }
    }
  ];

  const renderFilters: ListRenderItem<BatteryFilter> = ({ item: filter, index }) => {
    return (
      <ListItemCheckboxInfo
        key={index}
        title={filter.name}
        subtitle={`Matches batteries where any chemistry, any total cycles, any capacity, any C rating, any S cells, and any P cells.`}
        position={listItemPosition(index, filters.length)}
        checked={true}
        onPress={() => null}
        onPressInfo={() => navigation.navigate('BatteryFilterEditor', {
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
        subtitle={'Matches all batteries'}
        position={['first', 'last']}
        hideInfo={true}
        checked={true}
        onPress={() => null}
      />
      <Divider />
      <ListItemCheckboxInfo
        title={'General Batteries Filter'}
        subtitle={'Matches batteries where any chemistry, any total cycles, any capacity, any C rating, any S cells, and any P cells.'}
        position={['first', 'last']}
        checked={true}
        onPress={() => null}
        onPressInfo={() => navigation.navigate('BatteryFilterEditor', {
          filterId: '1',
        })}
      />
      <Divider
        type={'note'}
        text={'You can save the General Batteries Filter to remember a specific filter configuration for later use.'}
      />
      <Divider text={'SAVED BATTERY FILTERS'} />
      <FlatList
        data={filters}
        renderItem={renderFilters}
        keyExtractor={(_item, index) => `${index}`}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default BatteryFiltersScreen;
