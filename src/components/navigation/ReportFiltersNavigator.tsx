import EnumPickerScreen from 'components/EnumPickerScreen';
import NavContext from './NavContext';
import NotesScreen from 'components/NotesScreen';
import React from 'react';
import ReportBatteryScanCodesFilterEditorScreen from 'components/ReportBatteryScanCodesFilterEditorScreen';
import ReportEventsFilterEditorScreen from 'components/ReportEventsFilterEditorScreen';
import { ReportFiltersNavigatorParamList } from 'types/navigation';
import ReportFiltersScreen from 'components/ReportFiltersScreen';
import ReportMaintenanceFilterEditorScreen from 'components/ReportMaintenanceFilterEditorScreen';
import ReportModelScanCodesFilterEditorScreen from 'components/ReportModelScanCodesFilterEditorScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'theme';

const ReportFiltersStack = createNativeStackNavigator<ReportFiltersNavigatorParamList>();

const ReportFiltersNavigator = () => {
  const theme = useTheme();

  return (
    <NavContext.Provider value={{isModal: true}}>
      <ReportFiltersStack.Navigator
        initialRouteName='ReportFilters'
        screenOptions={{
          headerLargeTitleShadowVisible: false,
          headerLargeStyle: { backgroundColor: theme.colors.viewBackground },
          headerStyle: { backgroundColor: theme.colors.screenHeaderBackground },
          headerTitleStyle: { color: theme.colors.screenHeaderText },
          headerTintColor: theme.colors.screenHeaderBackButton,
        }}>
        <ReportFiltersStack.Screen
          name='EnumPicker'
          component={EnumPickerScreen}
          options={{
            title: '',
          }}
        />
        <ReportFiltersStack.Screen
          name='ReportFilters'
          component={ReportFiltersScreen}
          options={{
            title: 'Filters for Events',
          }}
        />
        <ReportFiltersStack.Screen
          name='ReportBatteryScanCodesFilterEditor'
          component={ReportBatteryScanCodesFilterEditorScreen}
          options={{
            title: 'Filter for Batteries',
          }}
        />
        <ReportFiltersStack.Screen
          name='ReportModelScanCodesFilterEditor'
          component={ReportModelScanCodesFilterEditorScreen}
          options={{
            title: 'Filter for Models',
          }}
        />
        <ReportFiltersStack.Screen
          name='ReportEventsFilterEditor'
          component={ReportEventsFilterEditorScreen}
          options={{
            title: 'Filter for Events',
          }}
        />
        <ReportFiltersStack.Screen
          name='ReportMaintenanceFilterEditor'
          component={ReportMaintenanceFilterEditorScreen}
          options={{
            title: 'Filter for Maintenance Items',
          }}
        />
        <ReportFiltersStack.Screen
          name='Notes'
          component={NotesScreen}
          options={{
            title: 'String Value',
          }}
        />
      </ReportFiltersStack.Navigator>
    </NavContext.Provider>
  );
};

export default ReportFiltersNavigator;
