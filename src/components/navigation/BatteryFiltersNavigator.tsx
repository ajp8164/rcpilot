import BatteryFilterEditorScreen from 'components/BatteryFilterEditorScreen';
import { BatteryFiltersNavigatorParamList } from 'types/navigation';
import BatteryFiltersScreen from 'components/BatteryFiltersScreen';
import EnumPickerScreen from 'components/EnumPickerScreen';
import NavContext from './NavContext';
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'theme';

const BatteryFiltersStack = createNativeStackNavigator<BatteryFiltersNavigatorParamList>();

const BatteryFiltersNavigator = () => {
  const theme = useTheme();

  return (
    <NavContext.Provider value={{ isModal: true }}>
      <BatteryFiltersStack.Navigator
        initialRouteName="BatteryFilters"
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.screenHeaderBackground },
          headerTitleStyle: { color: theme.colors.screenHeaderTitle },
          headerTintColor: theme.colors.screenHeaderButtonText,
        }}>
        <BatteryFiltersStack.Screen
          name="BatteryFilters"
          component={BatteryFiltersScreen}
          options={{
            title: 'Filters for Batteries',
          }}
        />
        <BatteryFiltersStack.Screen
          name="BatteryFilterEditor"
          component={BatteryFilterEditorScreen}
          options={{
            title: 'Filter Editor',
          }}
        />
        <BatteryFiltersStack.Screen
          name="EnumPicker"
          component={EnumPickerScreen}
          options={{
            title: '',
          }}
        />
      </BatteryFiltersStack.Navigator>
    </NavContext.Provider>
  );
};

export default BatteryFiltersNavigator;
