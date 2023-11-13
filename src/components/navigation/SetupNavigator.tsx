import AboutScreen from 'components/AboutScreen';
import AppSettingsScreen from 'components/AppSettingsScreen';
import ContentScreen from 'components/ContentScreen';
import React from 'react';
import { SetupNavigatorParamList } from 'types/navigation';
import SetupScreen from 'components/SetupScreen';
import UserAccountScreen from 'components/UserAccountScreen';
import UserProfileScreen from 'components/UserProfileScreen';
import { appConfig } from 'config';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'theme';

const SetupStack = createNativeStackNavigator<SetupNavigatorParamList>();

const SetupNavigator = () => {
  const theme = useTheme();

  return (
    <SetupStack.Navigator
      initialRouteName="Setup"
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
      <SetupStack.Screen
        name="Setup"
        component={SetupScreen}
        options={{
          title: 'Setup',
          headerLeft: () => null,
          headerLargeTitle: true,
        }}
      />
      <SetupStack.Screen
        name="UserAccount"
        component={UserAccountScreen}
        options={{
          headerLargeTitle: true,
        }}
      />
      <SetupStack.Screen
        name="UserProfile"
        component={UserProfileScreen}
        options={{
          title: '',
        }}
      />
      <SetupStack.Screen
        name="AppSettings"
        component={AppSettingsScreen}
        options={{
          title: 'App Settings',
          headerLargeTitle: true,
        }}
      />
      <SetupStack.Screen
        name="Content"
        component={ContentScreen}
        options={{
          title: '',
          headerLargeTitle: true,
        }}
      />
      <SetupStack.Screen
        name="About"
        component={AboutScreen}
        options={{
          title: `About ${appConfig.appName}`,
          headerLargeTitle: true,
        }}
      />
    </SetupStack.Navigator>
  );
};

export default SetupNavigator;
