import BatteryCycleEditorScreen from 'components/BatteryCycleEditorScreen';
import EventEditorScreen from 'components/EventEditorScreen';
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
        headerStyle: { backgroundColor: theme.colors.screenHeaderBackground },
        headerTitleStyle: { color: theme.colors.screenHeaderTitle },
        headerTintColor: theme.colors.screenHeaderButtonText,
      }}>
      <LogStack.Screen
        name="Log"
        component={LogScreen}
        options={{
          title: 'Log',
        }}
      />
      <LogStack.Screen
        name="EventEditor"
        component={EventEditorScreen}
        options={{
          title: 'Event Details',
        }}
      />
      <LogStack.Screen
        name="BatteryCycleEditor"
        component={BatteryCycleEditorScreen}
        options={{
          title: 'Battery Cycle',
        }}
      />
    </LogStack.Navigator>
  );
};

export default LogNavigator;
