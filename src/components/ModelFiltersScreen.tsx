import { BatteriesNavigatorParamList } from 'types/navigation';
import { Divider } from '@react-native-ajp-elements/ui';
import { ListItemCheckboxInfo } from 'components/atoms/List';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { View } from 'react-native-ui-lib';
import { useTheme } from 'theme';

export type Props = NativeStackScreenProps<BatteriesNavigatorParamList, 'BatteryFilters'>;

const ModelFiltersScreen = () => {
  const theme = useTheme();

  const filters = [
    {
      name: 'Helicopters',
      type: {
        select: 'any', // any, is, is not
        values: [],
      },
      lastEvent: {
        select: 'any', // any, before, after, past
        value: '2023-11-17T03:28:04.651Z',
      },
      totalTime: {
        select: 'any', // any, <, >, =, !=
        value: 0,
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
        onPressInfo={() => null}
      />
      <Divider
        type={'note'}
        text={'You can save the General Models Filter to remember a specific filter configuration for later use.'}
      />
      <Divider text={'SAVED MODEL FILTERS'} />
      {filters.map((filter, index) => {
        return (
          <ListItemCheckboxInfo
            key={index}
            title={filter.name}
            subtitle={'Matches models where any model type, any category, any last event, any total time, any logs batteries, any logs fuel, any damaged, any vendor, and any notes.'}
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

export default ModelFiltersScreen;
