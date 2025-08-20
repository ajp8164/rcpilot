import React from 'react';
import { View } from 'react-native';

import { useTheme } from '@react-native-hello/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import ActionBar from 'components/atoms/ActionBar';
import { EmptyView } from 'components/molecules/EmptyView';
import { Funnel, Scale } from 'lucide-react-native';
import { FilterType } from 'types/filter';
import { BatteriesNavigatorParamList } from 'types/navigation';

export type Props = NativeStackScreenProps<
  BatteriesNavigatorParamList,
  'BatteryPerformance'
>;

const BatteryPerformanceScreen = ({ navigation }: Props) => {
  const theme = useTheme();

  return (
    <View style={theme.styles.view}>
      <EmptyView info message={'No Performance Data'} />
      <ActionBar
        actions={[
          {
            ActionComponent: <Funnel color={theme.colors.clearButtonText} />,
            onPress: () =>
              navigation.navigate('EventFiltersNavigator', {
                screen: 'EventFilters',
                params: {
                  filterType: FilterType.EventsBatteryPerformanceFilter,
                  useGeneralFilter: true,
                },
              }),
          },
          {
            ActionComponent: (
              <Scale color={theme.colors.clearButtonText} size={28} />
            ),

            onPress: () =>
              navigation.navigate('BatteryPerformanceComparisonPicker'),
          },
          {
            label: 'Done',
            onPress: navigation.goBack,
          },
        ]}
      />
    </View>
  );
};

export default BatteryPerformanceScreen;
