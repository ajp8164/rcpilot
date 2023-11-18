import FlightBatteriesScreen from 'components/FlightBatteriesScreen';
import FlightChecklistItemScreen from 'components/FlightChecklistItemScreen';
import { FlightNavigatorParamList } from 'types/navigation';
import FlightPreFlightScreen from 'components/FlightPreFlightScreen';
import NavContext from './NavContext';
import NotesScreen from 'components/NotesScreen';
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'theme';

const FlightStack = createNativeStackNavigator<FlightNavigatorParamList>();

const FlightNavigator = () => {
  const theme = useTheme();

  return (
    <NavContext.Provider value={{isModal: true}}>
      <FlightStack.Navigator
      initialRouteName='FlightBatteries'
      screenOptions={{
        headerLargeTitleShadowVisible: theme.mode === 'light',
        headerLargeStyle: {
          backgroundColor: theme.colors.screenHeaderBackground,
        },
        headerStyle: {
          backgroundColor: theme.colors.screenHeaderBackground,
        },
        headerTitleStyle: {
          color: theme.colors.screenHeaderText,
        },
        headerTintColor: theme.colors.screenHeaderBackButton,
      }}>
        <FlightStack.Screen
          name='FlightBatteries'
          component={FlightBatteriesScreen}
          options={{
            title: 'Batteries',
          }}
        />
        <FlightStack.Screen
          name='FlightPreFlight'
          component={FlightPreFlightScreen}
          options={{
            title: 'Pre-Flight',
          }}
        />
        <FlightStack.Screen
          name='FlightChecklistItem'
          component={FlightChecklistItemScreen}
          options={{
            title: 'Checklist Item',
          }}
        />
        <FlightStack.Screen
          name='Notes'
          component={NotesScreen}
          options={{
            title: 'Action Notes',
          }}
        />
      </FlightStack.Navigator>
    </NavContext.Provider>
  );
};

export default FlightNavigator;
