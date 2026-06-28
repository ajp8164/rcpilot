import React from 'react';

import { useTheme } from '@react-native-hello/ui';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { navigatorScreenOptions } from 'components/atoms/navigation/navigatorScreenOptions';
import EnumPickerScreen from 'components/EnumPickerScreen';
import NotesEditorScreen from 'components/NotesEditorScreen';
import ReportModelScanCodeFilterEditorScreen from 'components/ReportModelScanCodeFilterEditorScreen';
import ReportModelScanCodeFiltersScreen from 'components/ReportModelScanCodeFiltersScreen';
import { ReportModelScanCodeFiltersNavigatorParamList } from 'types/navigation';

import NavContext from './NavContext';

const ReportModelScanCodeFiltersStack =
  createNativeStackNavigator<ReportModelScanCodeFiltersNavigatorParamList>();

const ReportModelScanCodeFiltersNavigator = () => {
  const theme = useTheme();

  return (
    <NavContext.Provider value={{ isModal: true }}>
      <ReportModelScanCodeFiltersStack.Navigator
        initialRouteName="ReportModelScanCodeFilters"
        screenOptions={navigatorScreenOptions(theme)}>
        <ReportModelScanCodeFiltersStack.Screen
          name="EnumPicker"
          component={EnumPickerScreen}
          options={{
            title: '',
          }}
        />
        <ReportModelScanCodeFiltersStack.Screen
          name="ReportModelScanCodeFilters"
          component={ReportModelScanCodeFiltersScreen}
          options={{
            title: 'Filters for Models',
          }}
        />
        <ReportModelScanCodeFiltersStack.Screen
          name="ReportModelScanCodeFilterEditor"
          component={ReportModelScanCodeFilterEditorScreen}
          options={{
            title: 'Filter Editor',
          }}
        />
        <ReportModelScanCodeFiltersStack.Screen
          name="NotesEditor"
          component={NotesEditorScreen}
          options={{
            title: 'String Value',
          }}
        />
      </ReportModelScanCodeFiltersStack.Navigator>
    </NavContext.Provider>
  );
};

export default ReportModelScanCodeFiltersNavigator;
