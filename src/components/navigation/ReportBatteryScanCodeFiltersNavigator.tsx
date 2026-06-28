import React from 'react';

import { useTheme } from '@react-native-hello/ui';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { navigatorScreenOptions } from 'components/atoms/navigation/navigatorScreenOptions';
import EnumPickerScreen from 'components/EnumPickerScreen';
import ReportBatteryScanCodeFilterEditorScreen from 'components/ReportBatteryScanCodeFilterEditorScreen';
import ReportBatteryScanCodeFiltersScreen from 'components/ReportBatteryScanCodeFiltersScreen';
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
        screenOptions={navigatorScreenOptions(theme)}>
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
