import EnumPickerScreen from 'components/EnumPickerScreen';
import NavContext from './NavContext';
import NotesEditorScreen from 'components/NotesEditorScreen';
import React from 'react';
import ReportEventFilterEditorScreen from 'components/ReportEventFilterEditorScreen';
import { ReportEventFiltersNavigatorParamList } from 'types/navigation';
import ReportEventFiltersScreen from 'components/ReportEventFiltersScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { eventKind } from 'lib/modelEvent';
import { useTheme } from 'theme';

const ReportEventFiltersStack =
  createNativeStackNavigator<ReportEventFiltersNavigatorParamList>();

const ReportEventFiltersNavigator = () => {
  const theme = useTheme();

  return (
    <NavContext.Provider value={{ isModal: true }}>
      <ReportEventFiltersStack.Navigator
        initialRouteName="ReportEventFilters"
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.screenHeaderBackground },
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
