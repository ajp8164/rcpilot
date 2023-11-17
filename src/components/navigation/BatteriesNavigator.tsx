import { BatteriesNavigatorParamList } from 'types/navigation';
import BatteriesScreen from 'components/BatteriesScreen';
import BatteryCellResistancesScreen from 'components/BatteryCellResistancesScreen';
import BatteryCellVoltagesScreen from 'components/BatteryCellVoltagesScreen';
import BatteryChemistryScreen from 'components/BatteryChemistryScreen';
import BatteryCycleScreen from 'components/BatteryCycleScreen';
import BatteryCyclesScreen from 'components/BatteryCyclesScreen';
import BatteryFiltersScreen from 'components/BatteryFiltersScreen';
import BatteryPerformanceScreen from 'components/BatteryPerformance';
import BatteryScreen from 'components/BatteryScreen';
import BatteryTintScreen from 'components/BatteryTintScreen';
import NewBatteryNavigator from './NewBatteryNavigator';
import NotesScreen from 'components/NotesScreen';
import React from 'react';
import ScanCodeSizeScreen from 'components/ScanCodeSizeScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'theme';

const BatteriesStack = createNativeStackNavigator<BatteriesNavigatorParamList>();

const BatteriesNavigator = () => {
  const theme = useTheme();

  return (
    <BatteriesStack.Navigator
    initialRouteName="Batteries"
    screenOptions={{
      headerLargeTitleShadowVisible: theme.mode === 'light',
      headerLargeStyle: {
        backgroundColor: theme.colors.screenHeaderBackground,
      },
      headerStyle: {
        backgroundColor: theme.colors.screenHeaderBackground,
      },
      headerTitleStyle: {
        color: theme.colors.screenHeaderText,
      },
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
        name='Battery'
        component={BatteryScreen}
      />
      <BatteriesStack.Screen
        name='BatteryChemistry'
        component={BatteryChemistryScreen}
        options={{
          title: 'Chemistry',
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
        name='BatteryFilters'
        component={BatteryFiltersScreen}
        options={{
          title: 'Filters for Batteries',
          presentation: 'modal',
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
        name='BatteryTint'
        component={BatteryTintScreen}
        options={{
          title: 'Battery Tint',
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
        name='ScanCodeSize'
        component={ScanCodeSizeScreen}
        options={{
          title: 'QR Code Size',
        }}
      />
    </BatteriesStack.Navigator>
  );
};

export default BatteriesNavigator;
