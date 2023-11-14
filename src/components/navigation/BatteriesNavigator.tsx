import { BatteriesNavigatorParamList } from 'types/navigation';
import BatteriesScreen from 'components/BatteriesScreen';
import BatteryScreen from 'components/BatteryScreen';
import NewBatteryScreen from 'components/NewBatteryScreen';
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
        name='NewBattery'
        component={NewBatteryScreen}
        options={{
          title: 'New Battery',
          presentation: 'modal'
        }}
      />
    </BatteriesStack.Navigator>
  );
};

export default BatteriesNavigator;
