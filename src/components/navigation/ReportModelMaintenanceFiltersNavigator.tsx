import EnumPickerScreen from 'components/EnumPickerScreen';
import NavContext from './NavContext';
import NotesEditorScreen from 'components/NotesEditorScreen';
import React from 'react';
import ReportModelMaintenanceFilterEditorScreen from 'components/ReportModelMaintenanceFilterEditorScreen';
import { ReportModelMaintenanceFiltersNavigatorParamList } from 'types/navigation';
import ReportModelMaintenanceFiltersScreen from 'components/ReportModelMaintenanceFiltersScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'theme';

const ReportModelMaintenanceFiltersStack = createNativeStackNavigator<ReportModelMaintenanceFiltersNavigatorParamList>();

const ReportModelMaintenanceFiltersNavigator = () => {
  const theme = useTheme();

  return (
    <NavContext.Provider value={{isModal: true}}>
      <ReportModelMaintenanceFiltersStack.Navigator
        initialRouteName='ReportModelMaintenanceFilters'
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.screenHeaderBackground },
          headerTitleStyle: { color: theme.colors.screenHeaderTitle },
          headerTintColor: theme.colors.screenHeaderButtonText,
        }}>
        <ReportModelMaintenanceFiltersStack.Screen
          name='EnumPicker'
          component={EnumPickerScreen}
          options={{
            title: '',
          }}
        />
        <ReportModelMaintenanceFiltersStack.Screen
          name='ReportModelMaintenanceFilters'
          component={ReportModelMaintenanceFiltersScreen}
          options={{
            title: 'Filters for Maintenance Log',
          }}
        />
        <ReportModelMaintenanceFiltersStack.Screen
          name='ReportModelMaintenanceFilterEditor'
          component={ReportModelMaintenanceFilterEditorScreen}
          options={{
            title: 'Filter Editor',
          }}
        />
        <ReportModelMaintenanceFiltersStack.Screen
          name='NotesEditor'
          component={NotesEditorScreen}
          options={{
            title: 'String Value',
          }}
        />
      </ReportModelMaintenanceFiltersStack.Navigator>
    </NavContext.Provider>
  );
};

export default ReportModelMaintenanceFiltersNavigator;
