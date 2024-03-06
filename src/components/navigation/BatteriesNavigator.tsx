import { BatteriesNavigatorParamList } from 'types/navigation';
import BatteriesScreen from 'components/BatteriesScreen';
import BatteryCellValuesEditorScreen from 'components/BatteryCellValuesEditorScreen';
import BatteryCycleEditorScreen from 'components/BatteryCycleEditorScreen';
import BatteryCycleFiltersNavigator from 'components/navigation/BatteryCycleFiltersNavigator';
import BatteryCyclesScreen from 'components/BatteryCyclesScreen';
import BatteryEditorScreen from 'components/BatteryEditorScreen';
import BatteryFiltersNavigator from 'components/navigation/BatteryFiltersNavigator';
import BatteryPerformanceComparisonPickerScreen from 'components/BatteryPerformanceComparisonPickerScreen';
import BatteryPerformanceNavigator from 'components/navigation/BatteryPerformanceNavigator';
import BatteryPerformanceScreen from 'components/BatteryPerformance';
import BatteryTemplatesScreen from 'components/BatteryTemplatesScreen';
import EnumPickerScreen from 'components/EnumPickerScreen';
import NewBatteryCycleNavigator from 'components/navigation/NewBatteryCycleNavigator';
import NewBatteryNavigator from './NewBatteryNavigator';
import NotesEditorScreen from 'components/NotesEditorScreen';
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import lodash from 'lodash';
import { useTheme } from 'theme';

const BatteriesStack = createNativeStackNavigator<BatteriesNavigatorParamList>();

const BatteriesNavigator = () => {
  const theme = useTheme();

  return (
    <BatteriesStack.Navigator
      initialRouteName="Batteries"
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.screenHeaderBackground },
        headerTitleStyle: { color: theme.colors.screenHeaderTitle },
        headerTintColor: theme.colors.clearButtonText,
      }}>
      <BatteriesStack.Screen
        name="Batteries"
        component={BatteriesScreen}
        initialParams={{listBatteries: 'all'}}
        options={({ route }) => ({
          title: route.params.listBatteries === 'retired' ?
            'Retired'
            : route.params.listBatteries === 'in-storage' ?
            'In Storage'
            : 'Batteries',
          headerLeft: () => null,
          headerLargeTitle: route.params.listBatteries === 'all' ? true : false,
          headerLargeTitleShadowVisible: false,
          headerLargeStyle: { backgroundColor: theme.colors.viewBackground },
        })}
      />
      <BatteriesStack.Screen
        name='BatteryTemplates'
        component={BatteryTemplatesScreen}
        options={{
          title: 'Battery Templates',
          presentation: 'modal',
        }}
      />
      <BatteriesStack.Screen
        name='BatteryEditor'
        component={BatteryEditorScreen}
        options={{
          title: 'Battery',
        }}
      />
      <BatteriesStack.Screen
        name='BatteryCellValuesEditor'
        component={BatteryCellValuesEditorScreen}
        options={({ route }) => ({
          title: `Cell ${lodash.startCase(route.params.config.namePlural)}`,
        })}
      />
      <BatteriesStack.Screen
        name='BatteryCycles'
        component={BatteryCyclesScreen}
        options={{
          title: 'Cycles',
        }}
      />
      <BatteriesStack.Screen
        name='BatteryCycleEditor'
        component={BatteryCycleEditorScreen}
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
        name='BatteryCycleFiltersNavigator'
        component={BatteryCycleFiltersNavigator}
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
        name='NotesEditor'
        component={NotesEditorScreen}
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
