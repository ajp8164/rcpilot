import EnumPickerScreen from 'components/EnumPickerScreen';
import NavContext from './NavContext';
import NotesEditorScreen from 'components/NotesEditorScreen';
import React from 'react';
import ReportMaintenanceFilterEditorScreen from 'components/ReportMaintenanceFilterEditorScreen';
import { ReportMaintenanceFiltersNavigatorParamList } from 'types/navigation';
import ReportMaintenanceFiltersScreen from 'components/ReportMaintenanceFiltersScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'theme';

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
