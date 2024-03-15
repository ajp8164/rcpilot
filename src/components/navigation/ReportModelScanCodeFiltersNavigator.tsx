import EnumPickerScreen from 'components/EnumPickerScreen';
import NavContext from './NavContext';
import NotesEditorScreen from 'components/NotesEditorScreen';
import React from 'react';
import ReportModelScanCodeFilterEditorScreen from 'components/ReportModelScanCodeFilterEditorScreen';
import { ReportModelScanCodeFiltersNavigatorParamList } from 'types/navigation';
import ReportModelScanCodeFiltersScreen from 'components/ReportModelScanCodeFiltersScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'theme';

const ReportModelScanCodeFiltersStack = createNativeStackNavigator<ReportModelScanCodeFiltersNavigatorParamList>();

const ReportModelScanCodeFiltersNavigator = () => {
  const theme = useTheme();

  return (
    <NavContext.Provider value={{isModal: true}}>
      <ReportModelScanCodeFiltersStack.Navigator
        initialRouteName='ReportModelScanCodeFilters'
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.screenHeaderBackground },
          headerTitleStyle: { color: theme.colors.screenHeaderTitle },
          headerTintColor: theme.colors.screenHeaderButtonText,
        }}>
        <ReportModelScanCodeFiltersStack.Screen
          name='EnumPicker'
          component={EnumPickerScreen}
          options={{
            title: '',
          }}
        />
        <ReportModelScanCodeFiltersStack.Screen
          name='ReportModelScanCodeFilters'
          component={ReportModelScanCodeFiltersScreen}
          options={{
            title: 'Filters for Models',
          }}
        />
        <ReportModelScanCodeFiltersStack.Screen
          name='ReportModelScanCodeFilterEditor'
          component={ReportModelScanCodeFilterEditorScreen}
          options={{
            title: 'Filter Editor',
          }}
        />
        <ReportModelScanCodeFiltersStack.Screen
          name='NotesEditor'
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
