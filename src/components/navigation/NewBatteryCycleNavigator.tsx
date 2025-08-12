import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BatteryCellValuesEditorScreen from 'components/BatteryCellValuesEditorScreen';
import NewBatteryCycleScreen from 'components/NewBatteryCycleScreen';
import NotesEditorScreen from 'components/NotesEditorScreen';
import lodash from 'lodash';
import React from 'react';
import { useTheme } from 'theme';
import { NewBatteryCycleNavigatorParamList } from 'types/navigation';

import NavContext from './NavContext';

const NewBatteryCycleStack =
  createNativeStackNavigator<NewBatteryCycleNavigatorParamList>();

const NewBatteryCycleNavigator = () => {
  const theme = useTheme();

  return (
    <NavContext.Provider value={{ isModal: true }}>
      <NewBatteryCycleStack.Navigator
        initialRouteName="NewBatteryCycle"
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.screenHeaderBackground },
          headerTitleStyle: { color: theme.colors.screenHeaderTitle },
          headerTintColor: theme.colors.screenHeaderButtonText,
        }}>
        <NewBatteryCycleStack.Screen
          name="NewBatteryCycle"
          component={NewBatteryCycleScreen}
          options={{
            title: 'Cycle',
          }}
        />
        <NewBatteryCycleStack.Screen
          name="BatteryCellValuesEditor"
          component={BatteryCellValuesEditorScreen}
          options={({ route }) => ({
            title: `Cell ${lodash.startCase(route.params.config.namePlural)}`,
          })}
        />
        <NewBatteryCycleStack.Screen
          name="NotesEditor"
          component={NotesEditorScreen}
          options={{
            title: 'Action Notes',
          }}
        />
      </NewBatteryCycleStack.Navigator>
    </NavContext.Provider>
  );
};

export default NewBatteryCycleNavigator;
