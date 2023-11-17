import { ListItem, ListItemCheckbox, ListItemCheckboxInfo } from 'components/atoms/List';

import { BatteriesNavigatorParamList } from 'types/navigation';
import { Divider } from '@react-native-ajp-elements/ui';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { View } from 'react-native-ui-lib';
import { useTheme } from 'theme';

export type Props = NativeStackScreenProps<BatteriesNavigatorParamList, 'BatteryFilters'>;

const BatteryFiltersScreen = () => {
  const theme = useTheme();

  const filters = [
    {
      name: '3S',
      chemistry: {
        select: 'any', // any, is, is not
        values: [],
      },
      totalTime: {
        select: 'any', // any, <, >, =, !=
        value: 0,
      },
      capacity: {
        select: 'any', // any, <, >, =, !=
        value: 0,
      },
      cRating: {
        select: 'any', // any, <, >, =, !=
        value: 0,
      },
      sCells: {
        select: 'any', // any, <, >, =, !=
        value: 0,
      },
      pCells: {
        select: 'any', // any, <, >, =, !=
        value: 0,
      }
    }
  ];

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
        onPressInfo={() => null}
      />
      <Divider
        type={'note'}
        text={'You can save the General Batteries Filter to remember a specific filter configuration for later use.'}
      />
      <Divider text={'SAVED BATTERY FILTERS'} />
      {filters.map((filter, index) => {
        return (
          <ListItemCheckboxInfo
            key={index}
            title={filter.name}
            subtitle={`Matches batteries where any chemistry, any total cycles, any capacity, any C rating, any S cells, and any P cells.`}
            position={filters.length === 1 ? ['first', 'last'] : index === 0 ? ['first'] : index === filters.length - 1 ? ['last'] : []}
            checked={true}
            onPress={() => null}
            onPressInfo={() => null}
              />
        )
      })}
    </View>
  );
};

export default BatteryFiltersScreen;
