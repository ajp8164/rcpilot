import React from 'react';
import { StartupNavigatorParamList } from 'types/navigation';
import WelcomeScreen from 'components/WelcomeScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'theme';

const StartupStack = createNativeStackNavigator<StartupNavigatorParamList>();

const StartupNavigator = () => {
  const theme = useTheme();

  return (
    <StartupStack.Navigator
      initialRouteName={'Welcome'}
      screenOptions={{
        title: undefined,
        headerBackTitle: 'Back',
        headerLargeTitleShadowVisible: false,
        headerLargeStyle: { backgroundColor: theme.colors.viewBackground },
        headerStyle: { backgroundColor: theme.colors.screenHeaderBackground },
        headerTitleStyle: { color: theme.colors.screenHeaderText },
        headerTintColor: theme.colors.screenHeaderBackButton,
      }}>
      <StartupStack.Screen
        name="Welcome"
        component={WelcomeScreen}
        options={{ headerShown: false }}
      />
    </StartupStack.Navigator>
  );
};

export default StartupNavigator;
