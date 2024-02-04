import BatteryPerformanceFilterEditorScreen from 'components/BatteryPerformanceFilterEditorScreen';
import BatteryPerformanceFiltersScreen from 'components/BatteryPerformanceFiltersScreen';
import { BatteryPerformanceNavigatorParamList } from 'types/navigation';
import EnumPickerScreen from 'components/EnumPickerScreen';
import NavContext from './NavContext';
import NotesScreen from 'components/NotesScreen';
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'theme';

const BatteryPerformanceStack = createNativeStackNavigator<BatteryPerformanceNavigatorParamList>();

const BatteryPerformanceNavigator = () => {
  const theme = useTheme();

  return (
    <NavContext.Provider value={{isModal: true}}>
      <BatteryPerformanceStack.Navigator
        initialRouteName='BatteryPerformanceFilters'
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.screenHeaderBackground },
          headerTitleStyle: { color: theme.colors.screenHeaderText },
          headerTintColor: theme.colors.screenHeaderBackButton,
        }}>
        <BatteryPerformanceStack.Screen
          name='BatteryPerformanceFilters'
          component={BatteryPerformanceFiltersScreen}
          options={{
            title: 'Filters for Event Cycles',
          }}
        />
        <BatteryPerformanceStack.Screen
          name='BatteryPerformanceFilterEditor'
          component={BatteryPerformanceFilterEditorScreen}
          options={{
            title: 'Filter Editor',
          }}
        />
        <BatteryPerformanceStack.Screen
          name='Notes'
          component={NotesScreen}
          options={{
            title: 'Model Notes',
          }}
        />
        <BatteryPerformanceStack.Screen
          name="EnumPicker"
          component={EnumPickerScreen}
          options={{
            title: '',
          }}
        />
      </BatteryPerformanceStack.Navigator>
    </NavContext.Provider>
  );
};

export default BatteryPerformanceNavigator;
