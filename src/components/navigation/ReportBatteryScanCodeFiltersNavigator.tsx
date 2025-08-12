import { createNativeStackNavigator } from '@react-navigation/native-stack';
import EnumPickerScreen from 'components/EnumPickerScreen';
import ReportBatteryScanCodeFilterEditorScreen from 'components/ReportBatteryScanCodeFilterEditorScreen';
import ReportBatteryScanCodeFiltersScreen from 'components/ReportBatteryScanCodeFiltersScreen';
import React from 'react';
import { useTheme } from 'theme';
import { ReportBatteryScanCodeFiltersNavigatorParamList } from 'types/navigation';

import NavContext from './NavContext';

const ReportBatteryScanCodeFiltersStack =
  createNativeStackNavigator<ReportBatteryScanCodeFiltersNavigatorParamList>();

const ReportBatteryScanCodeFiltersNavigator = () => {
  const theme = useTheme();

  return (
    <NavContext.Provider value={{ isModal: true }}>
      <ReportBatteryScanCodeFiltersStack.Navigator
        initialRouteName="ReportBatteryScanCodeFilters"
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.screenHeaderBackground },
          headerTitleStyle: { color: theme.colors.screenHeaderTitle },
          headerTintColor: theme.colors.screenHeaderButtonText,
        }}>
        <ReportBatteryScanCodeFiltersStack.Screen
          name="ReportBatteryScanCodeFilters"
          component={ReportBatteryScanCodeFiltersScreen}
          options={{
            title: 'Filters for Batteries',
          }}
        />
        <ReportBatteryScanCodeFiltersStack.Screen
          name="ReportBatteryScanCodeFilterEditor"
          component={ReportBatteryScanCodeFilterEditorScreen}
          options={{
            title: 'Filter Editor',
          }}
        />
        <ReportBatteryScanCodeFiltersStack.Screen
          name="EnumPicker"
          component={EnumPickerScreen}
          options={{
            title: '',
          }}
        />
      </ReportBatteryScanCodeFiltersStack.Navigator>
    </NavContext.Provider>
  );
};

export default ReportBatteryScanCodeFiltersNavigator;
