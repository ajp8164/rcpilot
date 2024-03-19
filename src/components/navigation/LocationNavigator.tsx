import EventsScreen from 'components/EventsScreen';
import LocationEditorScreen from 'components/LocationEditorScreen';
import { LocationNavigatorParamList } from 'types/navigation';
import LocationsMapScreen from 'components/LocationsMapScreen';
import NavContext from './NavContext';
import NotesEditorScreen from 'components/NotesEditorScreen';
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'theme';

const LocationStack = createNativeStackNavigator<LocationNavigatorParamList>();

const LocationNavigator = () => {
  const theme = useTheme();

  return (
    <NavContext.Provider value={{ isModal: true }}>
      <LocationStack.Navigator
        initialRouteName="LocationsMap"
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.screenHeaderBackground },
          headerTitleStyle: { color: theme.colors.screenHeaderTitle },
          headerTintColor: theme.colors.screenHeaderButtonText,
        }}>
        <LocationStack.Screen
          name="LocationsMap"
          component={LocationsMapScreen}
          options={{
            title: 'Map',
            presentation: 'fullScreenModal',
          }}
        />
        <LocationStack.Screen
          name="LocationEditor"
          component={LocationEditorScreen}
          options={{
            title: 'Location',
            headerBackTitle: 'Map',
          }}
        />
        <LocationStack.Screen name="Events" component={EventsScreen} />
        <LocationStack.Screen
          name="NotesEditor"
          component={NotesEditorScreen}
          options={{
            title: 'Fuel Notes',
          }}
        />
      </LocationStack.Navigator>
    </NavContext.Provider>
  );
};

export default LocationNavigator;
