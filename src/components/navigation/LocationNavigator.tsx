import React from 'react';

import { useTheme } from '@react-native-hello/ui';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { navigatorScreenOptions } from 'components/atoms/navigation/navigatorScreenOptions';
import EventsScreen from 'components/EventsScreen';
import LocationsMapScreen from 'components/LocationsMapScreen';
import NotesEditorScreen from 'components/NotesEditorScreen';
import { LocationNavigatorParamList } from 'types/navigation';

import NavContext from './NavContext';

const LocationStack = createNativeStackNavigator<LocationNavigatorParamList>();

const LocationNavigator = () => {
  const theme = useTheme();

  return (
    <NavContext.Provider value={{ isModal: true }}>
      <LocationStack.Navigator
        initialRouteName="LocationsMap"
        screenOptions={navigatorScreenOptions(theme)}>
        <LocationStack.Screen
          name="LocationsMap"
          component={LocationsMapScreen}
          options={{
            title: 'Map',
            headerShown: false,
            presentation: 'fullScreenModal',
          }}
        />
        <LocationStack.Screen
          name="Events"
          component={EventsScreen}
          options={{
            presentation: 'modal',
          }}
        />
        <LocationStack.Screen
          name="NotesEditor"
          component={NotesEditorScreen}
          options={{
            presentation: 'modal',
            gestureEnabled: false,
          }}
        />
      </LocationStack.Navigator>
    </NavContext.Provider>
  );
};

export default LocationNavigator;
