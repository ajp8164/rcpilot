import BatteryPickerScreen from 'components/BatteryPickerScreen';
import EventChecklistItemScreen from 'components/EventChecklistItemScreen';
import { EventNavigatorParamList } from 'types/navigation';
import EventPreCheckScreen from 'components/EventPreCheckScreen';
import EventTimerScreen from 'components/EventTimerScreen';
import NavContext from './NavContext';
import NotesScreen from 'components/NotesScreen';
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'theme';

const EventStack = createNativeStackNavigator<EventNavigatorParamList>();

const EventNavigator = () => {
  const theme = useTheme();

  return (
    <NavContext.Provider value={{isModal: true}}>
      <EventStack.Navigator
      initialRouteName='BatteryPicker'
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.screenHeaderBackground },
        headerTitleStyle: { color: theme.colors.stickyWhite },
        headerTintColor: theme.colors.stickyWhite,
      }}>
        <EventStack.Screen
          name='BatteryPicker'
          component={BatteryPickerScreen}
          options={{
            title: 'Batteries',
            headerBackTitle: 'Cancel',
          }}
          />
        <EventStack.Screen
          name='EventPreCheck'
          component={EventPreCheckScreen}
          options={{
            title: 'Pre-Flight',
          }}
        />
        <EventStack.Screen
          name='EventChecklistItem'
          component={EventChecklistItemScreen}
          options={{
            title: 'Checklist Item',
          }}
        />
        <EventStack.Screen
          name='Notes'
          component={NotesScreen}
          options={{
            title: 'Action Notes',
          }}
        />
        <EventStack.Screen
          name='EventTimer'
          component={EventTimerScreen}
          options={{
            title: 'Flight Timer',
            headerLargeStyle: { backgroundColor: theme.colors.brandPrimary },
            headerTitleStyle: { color: theme.colors.stickyWhite },
            headerTintColor: theme.colors.stickyWhite,
            headerShadowVisible: false,
          }}
        />
      </EventStack.Navigator>
    </NavContext.Provider>
  );
};

export default EventNavigator;
