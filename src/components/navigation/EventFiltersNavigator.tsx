import EnumPickerScreen from 'components/EnumPickerScreen';
import EventFilterEditorScreen from 'components/EventFilterEditorScreen';
import { EventFiltersNavigatorParamList } from 'types/navigation';
import EventFiltersScreen from 'components/EventFiltersScreen';
import NavContext from './NavContext';
import NotesEditorScreen from 'components/NotesEditorScreen';
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'theme';

const EventFiltersStack = createNativeStackNavigator<EventFiltersNavigatorParamList>();

const EventFiltersNavigator = () => {
  const theme = useTheme();

  return (
    <NavContext.Provider value={{isModal: true}}>
      <EventFiltersStack.Navigator
        initialRouteName='EventFilters'
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.screenHeaderBackground },
          headerTitleStyle: { color: theme.colors.screenHeaderTitle },
          headerTintColor: theme.colors.screenHeaderButtonText,
        }}>
        <EventFiltersStack.Screen
          name='EnumPicker'
          component={EnumPickerScreen}
          options={{
            title: '',
          }}
        />
        <EventFiltersStack.Screen
          name='EventFilters'
          component={EventFiltersScreen}
          options={{
            title: 'Filters for Events',
          }}
        />
        <EventFiltersStack.Screen
          name='EventFilterEditor'
          component={EventFilterEditorScreen}
          options={{
            title: 'Filter Editor',
          }}
        />
        <EventFiltersStack.Screen
          name='NotesEditor'
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
