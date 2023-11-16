import BatteryChemistryScreen from 'components/BatteryChemistryScreen';
import NavContext from './NavContext';
import { NewBatteryNavigatorParamList } from 'types/navigation';
import NewBatteryScreen from 'components/NewBatteryScreen';
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'theme';

const NewBatteryStack = createNativeStackNavigator<NewBatteryNavigatorParamList>();

const NewBatteryNavigator = () => {
  const theme = useTheme();

  return (
    <NavContext.Provider value={{isModal: true}}>
      <NewBatteryStack.Navigator
      initialRouteName='NewBattery'
      screenOptions={{
        headerBackTitle: 'Battery',
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
        <NewBatteryStack.Screen
          name='NewBattery'
          component={NewBatteryScreen}
          options={{
            title: 'New Battery',
          }}
        />
        <NewBatteryStack.Screen
          name='BatteryChemistry'
          component={BatteryChemistryScreen}
          options={{
            title: 'Chemistry',
          }}
        />
      </NewBatteryStack.Navigator>
    </NavContext.Provider>
  );
};

export default NewBatteryNavigator;
