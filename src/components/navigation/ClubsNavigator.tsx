import React from 'react';

import { useTheme } from '@react-native-hello/ui';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ClubScreen from 'components/ClubScreen';
import ClubsScreen from 'components/ClubsScreen';
import { ClubsNavigatorParamList } from 'types/navigation';

const ClubsStack = createNativeStackNavigator<ClubsNavigatorParamList>();

const ClubsNavigator = () => {
  const theme = useTheme();

  return (
    <ClubsStack.Navigator
      initialRouteName="Clubs"
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.screenHeaderBackground,
        },
        headerTitleStyle: { color: theme.colors.screenHeaderTitle },
        headerTintColor: theme.colors.screenHeaderButtonText,
      }}>
      <ClubsStack.Screen
        name="Clubs"
        component={ClubsScreen}
        options={{
          title: 'Clubs',
          headerLargeTitle: true,
          headerLargeTitleShadowVisible: false,
          headerLargeStyle: {
            backgroundColor: theme.colors.viewBackground,
          },
        }}
      />
      <ClubsStack.Screen
        name="Club"
        component={ClubScreen}
        options={{
          title: 'Club',
          // headerLargeTitle: true,
          // headerLargeTitleShadowVisible: false,
          // headerLargeStyle: {
          //   backgroundColor: theme.colors.viewBackground,
          // },
        }}
      />
    </ClubsStack.Navigator>
  );
};

export default ClubsNavigator;
