import React from 'react';

import { useTheme } from '@react-native-hello/ui';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import EnumPickerScreen from 'components/EnumPickerScreen';
import NotesEditorScreen from 'components/NotesEditorScreen';
import ReportEventFilterEditorScreen from 'components/ReportEventFilterEditorScreen';
import ReportEventFiltersScreen from 'components/ReportEventFiltersScreen';
import { eventKind } from 'lib/modelEvent';
import { ReportEventFiltersNavigatorParamList } from 'types/navigation';

import NavContext from './NavContext';

const ReportEventFiltersStack =
  createNativeStackNavigator<ReportEventFiltersNavigatorParamList>();

const ReportEventFiltersNavigator = () => {
  const theme = useTheme();

  return (
    <NavContext.Provider value={{ isModal: true }}>
      <ReportEventFiltersStack.Navigator
        initialRouteName="ReportEventFilters"
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.screenHeaderBackground,
          },
          headerTitleStyle: { color: theme.colors.screenHeaderTitle },
          headerTintColor: theme.colors.screenHeaderButtonText,
        }}>
        <ReportEventFiltersStack.Screen
          name="EnumPicker"
          component={EnumPickerScreen}
          options={{
            title: '',
          }}
        />
        <ReportEventFiltersStack.Screen
          name="ReportEventFilters"
          component={ReportEventFiltersScreen}
          options={({ route }) => ({
            title: `Filters for ${eventKind(route.params.modelType).namePlural}`,
          })}
        />
        <ReportEventFiltersStack.Screen
          name="ReportEventFilterEditor"
          component={ReportEventFilterEditorScreen}
          options={{
            title: 'Filter Editor',
          }}
        />
        <ReportEventFiltersStack.Screen
          name="NotesEditor"
          component={NotesEditorScreen}
          options={{
            title: 'String Value',
          }}
        />
      </ReportEventFiltersStack.Navigator>
    </NavContext.Provider>
  );
};

export default ReportEventFiltersNavigator;
