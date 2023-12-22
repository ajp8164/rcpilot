import BatteryCycleScreen from 'components/BatteryCycleScreen';
import FlightDetailsScreen from 'components/FlightDetailsScreen';
import { LogNavigatorParamList } from 'types/navigation';
import LogScreen from 'components/LogScreen';
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'theme';

const LogStack = createNativeStackNavigator<LogNavigatorParamList>();

const LogNavigator = () => {
  const theme = useTheme();

  return (
    <LogStack.Navigator
    initialRouteName="Log"
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
      <LogStack.Screen
        name="Log"
        component={LogScreen}
        options={{
          title: 'Log',
        }}
      />
      <LogStack.Screen
        name="FlightDetails"
        component={FlightDetailsScreen}
        options={{
          title: 'Flight Details',
        }}
      />
      <LogStack.Screen
        name="BatteryCycle"
        component={BatteryCycleScreen}
        options={{
          title: 'Battery Cycle',
        }}
      />
    </LogStack.Navigator>
  );
};

export default LogNavigator;
