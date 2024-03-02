import BatteryPerformanceFilterEditorScreen from 'components/BatteryPerformanceFilterEditorScreen';
import BatteryPerformanceFiltersScreen from 'components/BatteryPerformanceFiltersScreen';
import { BatteryPerformanceNavigatorParamList } from 'types/navigation';
import EnumPickerScreen from 'components/EnumPickerScreen';
import NavContext from './NavContext';
import NotesEditorScreen from 'components/NotesEditorScreen';
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
          headerTitleStyle: { color: theme.colors.screenHeaderTitle },
          headerTintColor: theme.colors.screenHeaderButtonText,
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
          name='NotesEditor'
          component={NotesEditorScreen}
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
