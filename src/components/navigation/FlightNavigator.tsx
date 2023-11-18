import FlightBatteriesScreen from 'components/FlightBatteriesScreen';
import { FlightNavigatorParamList } from 'types/navigation';
import FlightPreFlightScreen from 'components/FlightPreFlightScreen';
import NavContext from './NavContext';
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
      </FlightStack.Navigator>
    </NavContext.Provider>
  );
};

export default FlightNavigator;
