import { createNativeStackNavigator } from '@react-navigation/native-stack';
import EnumPickerScreen from 'components/EnumPickerScreen';
import EventFilterEditorScreen from 'components/EventFilterEditorScreen';
import EventFiltersScreen from 'components/EventFiltersScreen';
import NotesEditorScreen from 'components/NotesEditorScreen';
import { eventKind } from 'lib/modelEvent';
import React from 'react';
import { useTheme } from 'theme';
import { EventFiltersNavigatorParamList } from 'types/navigation';

import NavContext from './NavContext';

const EventFiltersStack =
  createNativeStackNavigator<EventFiltersNavigatorParamList>();

const EventFiltersNavigator = () => {
  const theme = useTheme();

  return (
    <NavContext.Provider value={{ isModal: true }}>
      <EventFiltersStack.Navigator
        initialRouteName="EventFilters"
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.screenHeaderBackground },
          headerTitleStyle: { color: theme.colors.screenHeaderTitle },
          headerTintColor: theme.colors.screenHeaderButtonText,
        }}>
        <EventFiltersStack.Screen
          name="EnumPicker"
          component={EnumPickerScreen}
          options={{
            title: '',
          }}
        />
        <EventFiltersStack.Screen
          name="EventFilters"
          component={EventFiltersScreen}
          options={({ route }) => ({
            title: `Filters for ${eventKind(route.params.modelType).namePlural}`,
          })}
        />
        <EventFiltersStack.Screen
          name="EventFilterEditor"
          component={EventFilterEditorScreen}
          options={{
            title: 'Filter Editor',
          }}
        />
        <EventFiltersStack.Screen
          name="NotesEditor"
          component={NotesEditorScreen}
          options={{
            title: 'String Value',
          }}
        />
      </EventFiltersStack.Navigator>
    </NavContext.Provider>
  );
};

export default EventFiltersNavigator;
