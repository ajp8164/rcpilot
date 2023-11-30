import { BatteryPerformanceNavigatorParamList } from 'types/navigation';
import { Divider } from '@react-native-ajp-elements/ui';
import { ListItemCheckboxInfo } from 'components/atoms/List';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { View } from 'react-native-ui-lib';
import { useTheme } from 'theme';

export type Props = NativeStackScreenProps<BatteryPerformanceNavigatorParamList, 'BatteryPerformanceFilters'>;

const BatteryPerformanceFiltersScreen = ({ navigation }: Props) => {
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
        subtitle={'Matches all event cycles'}
        position={['first', 'last']}
        hideInfo={true}
        checked={true}
        onPress={() => null}
      />
      <Divider />
      <ListItemCheckboxInfo
        title={'General Event Cycles Filter'}
        subtitle={'Matches event cycles where any date, any duration, any charge amount, any cycle notes, style is any of 1 items, any location, any battery, any propeller, any pilot, any outcome, and any notes.'}
        position={['first', 'last']}
        checked={true}
        onPress={() => null}
        onPressInfo={() => navigation.navigate('BatteryPerformanceFilterEditor', {
          filterId: '1',
        })}
      />
      <Divider
        type={'note'}
        text={'You can save the General Event Cycles Filter to remember a specific filter configuration for later use.'}
      />
      <Divider text={'SAVED EVENT CYCLE FILTERS'} />
      {filters.map((filter, index) => {
        return (
          <ListItemCheckboxInfo
            key={index}
            title={filter.name}
            subtitle={`Matches batteries where any chemistry, any total cycles, any capacity, any C rating, any S cells, and any P cells.`}
            position={filters.length === 1 ? ['first', 'last'] : index === 0 ? ['first'] : index === filters.length - 1 ? ['last'] : []}
            checked={true}
            onPress={() => null}
            // onPressInfo={() => navigation.navigate('BatteryFilterEditor', {
            //   filterId: '1',
            // })}
          />
        )
      })}
    </View>
  );
};

export default BatteryPerformanceFiltersScreen;
