import { BatteriesNavigatorParamList } from 'types/navigation';
import BatteriesScreen from 'components/BatteriesScreen';
import BatteryChemistryScreen from 'components/BatteryChemistryScreen';
import BatteryScreen from 'components/BatteryScreen';
import BatteryTintScreen from 'components/BatteryTintScreen';
import NewBatteryNavigator from './NewBatteryNavigator';
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'theme';

const BatteriesStack = createNativeStackNavigator<BatteriesNavigatorParamList>();

const BatteriesNavigator = () => {
  const theme = useTheme();

  return (
    <BatteriesStack.Navigator
    initialRouteName="Batteries"
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
      <BatteriesStack.Screen
        name="Batteries"
        component={BatteriesScreen}
        options={{
          title: 'Batteries',
          headerLeft: () => null,
          headerLargeTitle: true,
        }}
      />
      <BatteriesStack.Screen
        name='Battery'
        component={BatteryScreen}
      />
      <BatteriesStack.Screen
        name='BatteryChemistry'
        component={BatteryChemistryScreen}
        options={{
          title: 'Chemistry',
        }}
      />
      <BatteriesStack.Screen
        name='BatteryTint'
        component={BatteryTintScreen}
        options={{
          title: 'Battery Tint',
        }}
      />
      <BatteriesStack.Screen
        name='NewBatteryNavigator'
        component={NewBatteryNavigator}
        options={{
          headerShown: false,
          presentation: 'modal'
        }}
      />
    </BatteriesStack.Navigator>
  );
};

export default BatteriesNavigator;
