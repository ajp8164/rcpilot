import EnumPickerScreen from 'components/EnumPickerScreen';
import NavContext from './NavContext';
import React from 'react';
import ReportBatteryScanCodeFilterEditorScreen from 'components/ReportBatteryScanCodeFilterEditorScreen';
import { ReportBatteryScanCodeFiltersNavigatorParamList } from 'types/navigation';
import ReportBatteryScanCodeFiltersScreen from 'components/ReportBatteryScanCodeFiltersScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'theme';

const ReportBatteryScanCodeFiltersStack = createNativeStackNavigator<ReportBatteryScanCodeFiltersNavigatorParamList>();

const ReportBatteryScanCodeFiltersNavigator = () => {
  const theme = useTheme();

  return (
    <NavContext.Provider value={{isModal: true}}>
      <ReportBatteryScanCodeFiltersStack.Navigator
        initialRouteName='ReportBatteryScanCodeFilters'
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.screenHeaderBackground },
          headerTitleStyle: { color: theme.colors.screenHeaderTitle },
          headerTintColor: theme.colors.screenHeaderButtonText,
        }}>
        <ReportBatteryScanCodeFiltersStack.Screen
          name='ReportBatteryScanCodeFilters'
          component={ReportBatteryScanCodeFiltersScreen}
          options={{
            title: 'Filters for Batteries',
          }}
        />
        <ReportBatteryScanCodeFiltersStack.Screen
          name='ReportBatteryScanCodeFilterEditor'
          component={ReportBatteryScanCodeFilterEditorScreen}
          options={{
            title: 'Filter Editor',
          }}
        />
        <ReportBatteryScanCodeFiltersStack.Screen
          name='EnumPicker'
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
