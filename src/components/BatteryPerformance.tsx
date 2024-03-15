import ActionBar from 'components/atoms/ActionBar';
import { BatteriesNavigatorParamList } from 'types/navigation';
import { EmptyView } from 'components/molecules/EmptyView';
import { FilterType } from 'types/filter';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { View } from 'react-native';
import { useTheme } from 'theme';

export type Props = NativeStackScreenProps<BatteriesNavigatorParamList, 'BatteryPerformance'>;

const BatteryPerformanceScreen = ({ navigation }: Props) => {
  const theme = useTheme();

  return (
    <View style={theme.styles.view}>
      <EmptyView info message={'No Performance Data'} />
      <ActionBar
        actions={[
          {
            ActionComponent: (
              <Icon
                name={'filter'}
                size={28}
                color={theme.colors.clearButtonText}
              />
            ),
            onPress: () => navigation.navigate('EventFiltersNavigator', {
              screen: 'EventFilters',
              params: {
                filterType: FilterType.EventsBatteryPerformanceFilter,
                useGeneralFilter: true,
              },
            })
          }, {
            ActionComponent: (
              <Icon
                name={'scale-unbalanced-flip'}
                size={28}
                color={theme.colors.clearButtonText}
              />
            ),
            onPress: () => navigation.navigate('BatteryPerformanceComparisonPicker')
          }, {
            label: 'Done',
            onPress: navigation.goBack
          },
        ]}
      />
    </View>
  );
};

export default BatteryPerformanceScreen;
