import { createNativeStackNavigator } from '@react-navigation/native-stack';
import EnumPickerScreen from 'components/EnumPickerScreen';
import NotesEditorScreen from 'components/NotesEditorScreen';
import ReportMaintenanceFilterEditorScreen from 'components/ReportMaintenanceFilterEditorScreen';
import ReportMaintenanceFiltersScreen from 'components/ReportMaintenanceFiltersScreen';
import React from 'react';
import { useTheme } from 'theme';
import { ReportMaintenanceFiltersNavigatorParamList } from 'types/navigation';

import NavContext from './NavContext';

const ReportMaintenanceFiltersStack =
  createNativeStackNavigator<ReportMaintenanceFiltersNavigatorParamList>();

const ReportMaintenanceFiltersNavigator = () => {
  const theme = useTheme();

  return (
    <NavContext.Provider value={{ isModal: true }}>
      <ReportMaintenanceFiltersStack.Navigator
        initialRouteName="ReportMaintenanceFilters"
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.screenHeaderBackground },
          headerTitleStyle: { color: theme.colors.screenHeaderTitle },
          headerTintColor: theme.colors.screenHeaderButtonText,
        }}>
        <ReportMaintenanceFiltersStack.Screen
          name="EnumPicker"
          component={EnumPickerScreen}
          options={{
            title: '',
          }}
        />
        <ReportMaintenanceFiltersStack.Screen
          name="ReportMaintenanceFilters"
          component={ReportMaintenanceFiltersScreen}
          options={{
            title: 'Filters for Maintenance Log',
          }}
        />
        <ReportMaintenanceFiltersStack.Screen
          name="ReportMaintenanceFilterEditor"
          component={ReportMaintenanceFilterEditorScreen}
          options={{
            title: 'Filter Editor',
          }}
        />
        <ReportMaintenanceFiltersStack.Screen
          name="NotesEditor"
          component={NotesEditorScreen}
          options={{
            title: 'String Value',
          }}
        />
      </ReportMaintenanceFiltersStack.Navigator>
    </NavContext.Provider>
  );
};

export default ReportMaintenanceFiltersNavigator;
