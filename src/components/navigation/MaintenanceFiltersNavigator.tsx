import React from 'react';

import { useTheme } from '@react-native-hello/ui';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import EnumPickerScreen from 'components/EnumPickerScreen';
import MaintenanceFilterEditorScreen from 'components/MaintenanceFilterEditorScreen';
import MaintenanceFiltersScreen from 'components/MaintenanceFiltersScreen';
import NotesEditorScreen from 'components/NotesEditorScreen';
import { MaintenanceFiltersNavigatorParamList } from 'types/navigation';

import NavContext from './NavContext';

const MaintenanceFiltersStack =
  createNativeStackNavigator<MaintenanceFiltersNavigatorParamList>();

const MaintenanceFiltersNavigator = () => {
  const theme = useTheme();

  return (
    <NavContext.Provider value={{ isModal: true }}>
      <MaintenanceFiltersStack.Navigator
        initialRouteName="MaintenanceFilters"
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.screenHeaderBackground,
          },
          headerTitleStyle: { color: theme.colors.screenHeaderTitle },
          headerTintColor: theme.colors.screenHeaderButtonText,
        }}>
        <MaintenanceFiltersStack.Screen
          name="EnumPicker"
          component={EnumPickerScreen}
          options={{
            title: '',
          }}
        />
        <MaintenanceFiltersStack.Screen
          name="MaintenanceFilters"
          component={MaintenanceFiltersScreen}
          options={{
            title: 'Filters for Maintenance Log',
          }}
        />
        <MaintenanceFiltersStack.Screen
          name="MaintenanceFilterEditor"
          component={MaintenanceFilterEditorScreen}
          options={{
            title: 'Filter Editor',
          }}
        />
        <MaintenanceFiltersStack.Screen
          name="NotesEditor"
          component={NotesEditorScreen}
          options={{
            title: 'String Value',
          }}
        />
      </MaintenanceFiltersStack.Navigator>
    </NavContext.Provider>
  );
};

export default MaintenanceFiltersNavigator;
