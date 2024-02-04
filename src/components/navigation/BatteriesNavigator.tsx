import { BatteriesNavigatorParamList } from 'types/navigation';
import BatteriesScreen from 'components/BatteriesScreen';
import BatteryCellResistancesScreen from 'components/BatteryCellResistancesScreen';
import BatteryCellVoltagesScreen from 'components/BatteryCellVoltagesScreen';
import BatteryCycleScreen from 'components/BatteryCycleScreen';
import BatteryCyclesScreen from 'components/BatteryCyclesScreen';
import BatteryEditorScreen from 'components/BatteryEditorScreen';
import BatteryFiltersNavigator from 'components/navigation/BatteryFiltersNavigator';
import BatteryPerformanceComparisonPickerScreen from 'components/BatteryPerformanceComparisonPickerScreen';
import BatteryPerformanceNavigator from 'components/navigation/BatteryPerformanceNavigator';
import BatteryPerformanceScreen from 'components/BatteryPerformance';
import EnumPickerScreen from 'components/EnumPickerScreen';
import NewBatteryCycleNavigator from 'components/navigation/NewBatteryCycleNavigator';
import NewBatteryNavigator from './NewBatteryNavigator';
import NotesScreen from 'components/NotesScreen';
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'theme';

const BatteriesStack = createNativeStackNavigator<BatteriesNavigatorParamList>();

const BatteriesNavigator = () => {
  const theme = useTheme();

  return (
    <BatteriesStack.Navigator
      initialRouteName="Batteries"
      screenOptions={{
        headerLargeTitleShadowVisible: false,
        headerLargeStyle: { backgroundColor: theme.colors.viewBackground },
        headerStyle: { backgroundColor: theme.colors.screenHeaderBackground },
        headerTitleStyle: { color: theme.colors.screenHeaderText },
        headerTintColor: theme.colors.screenHeaderBackButton,
      }}>
      <BatteriesStack.Screen
        name="Batteries"
        component={BatteriesScreen}
        options={{
          title: 'Batteries',
          headerLeft: () => null,
          headerLargeTitle: true,
        }}
      />
      <BatteriesStack.Screen
        name='BatteryEditor'
        component={BatteryEditorScreen}
        options={{
          title: '',
        }}
      />
      <BatteriesStack.Screen
        name='BatteryCellResistances'
        component={BatteryCellResistancesScreen}
        options={{
          title: 'Cell Resistances',
        }}
      />
      <BatteriesStack.Screen
        name='BatteryCellVoltages'
        component={BatteryCellVoltagesScreen}
        options={{
          title: 'Cell Voltages',
        }}
      />
      <BatteriesStack.Screen
        name='BatteryCycles'
        component={BatteryCyclesScreen}
        options={{
          // headerLargeTitle: true,
          title: 'Cycles',
        }}
      />
      <BatteriesStack.Screen
        name='BatteryCycle'
        component={BatteryCycleScreen}
        options={{
          title: 'Edit Cycle',
        }}
      />
      <BatteriesStack.Screen
        name='NewBatteryCycleNavigator'
        component={NewBatteryCycleNavigator}
        options={{
          headerShown: false,
          presentation: 'fullScreenModal'
        }}
      />
      <BatteriesStack.Screen
        name='BatteryFiltersNavigator'
        component={BatteryFiltersNavigator}
        options={{
          headerShown: false,
          presentation: 'modal'
        }}
      />
      <BatteriesStack.Screen
        name='BatteryPerformance'
        component={BatteryPerformanceScreen}
        options={{
          title: 'Battery Performance',
          presentation: 'fullScreenModal',
        }}
      />
      <BatteriesStack.Screen
        name='BatteryPerformanceComparisonPicker'
        component={BatteryPerformanceComparisonPickerScreen}
        options={{
          title: 'Batteries',
          presentation: 'fullScreenModal',
        }}
      />
      <BatteriesStack.Screen
        name='BatteryPerformanceNavigator'
        component={BatteryPerformanceNavigator}
        options={{
          headerShown: false,
          presentation: 'modal',
        }}
      />
      <BatteriesStack.Screen
        name='NewBatteryNavigator'
        component={NewBatteryNavigator}
        options={{
          headerShown: false,
          presentation: 'modal'
        }}
      />
      <BatteriesStack.Screen
        name='Notes'
        component={NotesScreen}
        options={{
          title: 'Battery Notes',
        }}
      />
      <BatteriesStack.Screen
        name="EnumPicker"
        component={EnumPickerScreen}
        options={{
          title: '',
        }}
      />
    </BatteriesStack.Navigator>
  );
};

export default BatteriesNavigator;
