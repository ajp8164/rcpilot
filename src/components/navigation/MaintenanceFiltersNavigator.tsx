import EnumPickerScreen from 'components/EnumPickerScreen';
import MaintenanceFilterEditorScreen from 'components/MaintenanceFilterEditorScreen';
import { MaintenanceFiltersNavigatorParamList } from 'types/navigation';
import MaintenanceFiltersScreen from 'components/MaintenanceFiltersScreen';
import NavContext from './NavContext';
import NotesEditorScreen from 'components/NotesEditorScreen';
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'theme';

const MaintenanceFiltersStack = createNativeStackNavigator<MaintenanceFiltersNavigatorParamList>();

const MaintenanceFiltersNavigator = () => {
  const theme = useTheme();

  return (
    <NavContext.Provider value={{ isModal: true }}>
      <MaintenanceFiltersStack.Navigator
        initialRouteName="MaintenanceFilters"
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.screenHeaderBackground },
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
