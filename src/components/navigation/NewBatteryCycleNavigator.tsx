import BatteryCellResistancesScreen from 'components/BatteryCellResistancesScreen';
import BatteryCellVoltagesScreen from 'components/BatteryCellVoltagesScreen';
import NavContext from './NavContext';
import { NewBatteryCycleNavigatorParamList } from 'types/navigation';
import NewBatteryCycleScreen from 'components/NewBatteryCycleScreen';
import NotesScreen from 'components/NotesScreen';
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'theme';

const NewBatteryCycleStack = createNativeStackNavigator<NewBatteryCycleNavigatorParamList>();

const NewBatteryCycleNavigator = () => {
  const theme = useTheme();

  return (
    <NavContext.Provider value={{isModal: true}}>
      <NewBatteryCycleStack.Navigator
      initialRouteName='NewBatteryCycle'
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
       <NewBatteryCycleStack.Screen
          name='NewBatteryCycle'
          component={NewBatteryCycleScreen}
          options={{
            title: 'Cycle',
          }}
        />
        <NewBatteryCycleStack.Screen
          name='BatteryCellVoltages'
          component={BatteryCellVoltagesScreen}
          options={{
            title: 'Cell Voltages',
          }}
        />
        <NewBatteryCycleStack.Screen
          name='BatteryCellResistances'
          component={BatteryCellResistancesScreen}
          options={{
            title: 'Cell Resistances',
          }}
        />
        <NewBatteryCycleStack.Screen
          name='Notes'
          component={NotesScreen}
          options={{
            title: 'Action Notes',
          }}
        />
      </NewBatteryCycleStack.Navigator>
    </NavContext.Provider>
  );
};

export default NewBatteryCycleNavigator;