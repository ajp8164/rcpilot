import EventEditorScreen from 'components/EventEditorScreen';
import EventSequenceBatteryPickerScreen from 'components/EventSequenceBatteryPickerScreen';
import EventSequenceChecklistItemScreen from 'components/EventSequenceChecklistItemScreen';
import { EventSequenceNavigatorParamList } from 'types/navigation';
import EventSequencePreCheckScreen from 'components/EventSequencePreCheckScreen';
import EventSequenceTimerScreen from 'components/EventSequenceTimerScreen';
import NavContext from './NavContext';
import NotesScreen from 'components/NotesScreen';
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'theme';

const EventSequenceStack = createNativeStackNavigator<EventSequenceNavigatorParamList>();

const EventSequenceNavigator = () => {
  const theme = useTheme();

  return (
    <NavContext.Provider value={{isModal: true}}>
      <EventSequenceStack.Navigator
      initialRouteName='EventSequenceBatteryPicker'
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.screenHeaderInvBackground },
        headerTitleStyle: { color: theme.colors.stickyWhite },
        headerTintColor: theme.colors.stickyWhite,
      }}>
        <EventSequenceStack.Screen
          name='EventSequenceBatteryPicker'
          component={EventSequenceBatteryPickerScreen}
          options={{
            title: 'Batteries',
          }}
          />
        <EventSequenceStack.Screen
          name='EventSequencePreCheck'
          component={EventSequencePreCheckScreen}
          options={{
            title: 'Pre-Event',
          }}
        />
        <EventSequenceStack.Screen
          name='EventSequenceChecklistItem'
          component={EventSequenceChecklistItemScreen}
          options={{
            title: 'Checklist Item',
          }}
        />
        <EventSequenceStack.Screen
          name='EventEditor'
          component={EventEditorScreen}
          options={{
            title: 'Log Event',
          }}
        />
        <EventSequenceStack.Screen
          name='Notes'
          component={NotesScreen}
          options={{
            title: 'Action Notes',
          }}
        />
        <EventSequenceStack.Screen
          name='EventSequenceTimer'
          component={EventSequenceTimerScreen}
          options={{
            title: 'Event Timer',
            headerLargeStyle: { backgroundColor: theme.colors.brandPrimary },
            headerTitleStyle: { color: theme.colors.stickyWhite },
            headerTintColor: theme.colors.stickyWhite,
            headerShadowVisible: false,
          }}
        />
      </EventSequenceStack.Navigator>
    </NavContext.Provider>
  );
};

export default EventSequenceNavigator;
