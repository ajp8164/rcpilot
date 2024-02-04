import LocationDetailsScreen from 'components/LocationDetailsScreen';
import { LocationNavigatorParamList } from 'types/navigation';
import LocationsScreen from 'components/LocationsScreen';
import NavContext from './NavContext';
import NotesScreen from 'components/NotesScreen';
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'theme';

const LocationStack = createNativeStackNavigator<LocationNavigatorParamList>();

const LocationNavigator = () => {
  const theme = useTheme();

  return (
    <NavContext.Provider value={{isModal: true}}>
      <LocationStack.Navigator
        initialRouteName='Locations'
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.screenHeaderBackground },
          headerTitleStyle: { color: theme.colors.screenHeaderText },
          headerTintColor: theme.colors.screenHeaderBackButton,
        }}>
        <LocationStack.Screen
          name="Locations"
          component={LocationsScreen}
          options={{
            title: 'Map',
            presentation: 'fullScreenModal',
          }}
        />
        <LocationStack.Screen
          name="LocationDetails"
          component={LocationDetailsScreen}
          options={{
            title: 'Location Details',
            headerBackTitle: 'Map',
          }}
        />
        <LocationStack.Screen
          name='Notes'
          component={NotesScreen}
          options={{
            title: 'Fuel Notes',
          }}
        />
      </LocationStack.Navigator>
    </NavContext.Provider>
  );
};

export default LocationNavigator;
