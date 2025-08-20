import React from 'react';

import { useTheme } from '@react-native-hello/ui';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BatteryCycleEditorScreen from 'components/BatteryCycleEditorScreen';
import EventEditorScreen from 'components/EventEditorScreen';
import LogScreen from 'components/LogScreen';
import { LogNavigatorParamList } from 'types/navigation';

const LogStack = createNativeStackNavigator<LogNavigatorParamList>();

const LogNavigator = () => {
  const theme = useTheme();

  return (
    <LogStack.Navigator
      initialRouteName="Log"
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.screenHeaderBackground,
        },
        headerTitleStyle: { color: theme.colors.screenHeaderTitle },
        headerTintColor: theme.colors.screenHeaderButtonText,
      }}>
      <LogStack.Screen
        name="Log"
        component={LogScreen}
        options={{
          title: 'Log',
          headerLargeTitle: true,
          headerLargeTitleShadowVisible: false,
          headerLargeStyle: {
            backgroundColor: theme.colors.viewBackground,
          },
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
          title: 'Cycle Details',
        }}
      />
    </LogStack.Navigator>
  );
};

export default LogNavigator;
