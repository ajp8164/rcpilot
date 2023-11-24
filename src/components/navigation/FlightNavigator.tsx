import FlightBatteriesScreen from 'components/FlightBatteriesScreen';
import FlightChecklistItemScreen from 'components/FlightChecklistItemScreen';
import { FlightNavigatorParamList } from 'types/navigation';
import FlightPreFlightScreen from 'components/FlightPreFlightScreen';
import FlightTimerScreen from 'components/FlightTimerScreen';
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
          backgroundColor: theme.colors.brandPrimary,
        },
        headerStyle: {
          backgroundColor: theme.colors.screenHeaderBackground,
        },
        headerTitleStyle: {
          color: theme.colors.stickyWhite,
        },
        headerTintColor: theme.colors.stickyWhite,
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
        <FlightStack.Screen
          name='FlightTimer'
          component={FlightTimerScreen}
          options={{
            title: 'Flight Timer',
            headerLargeStyle: { backgroundColor: theme.colors.brandPrimary },
            headerTitleStyle: { color: theme.colors.stickyWhite },
            headerTintColor: theme.colors.stickyWhite,
            headerShadowVisible: false,
          }}
        />
      </FlightStack.Navigator>
    </NavContext.Provider>
  );
};

export default FlightNavigator;
