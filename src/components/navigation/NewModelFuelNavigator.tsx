import React from 'react';

import { useTheme } from '@react-native-hello/ui';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ModelFuelEditorScreen from 'components/ModelFuelEditorScreen';
import NotesEditorScreen from 'components/NotesEditorScreen';
import { NewModelFuelNavigatorParamList } from 'types/navigation';

import NavContext from './NavContext';

const NewModelFuelStack =
  createNativeStackNavigator<NewModelFuelNavigatorParamList>();

const NewModelFuelNavigator = () => {
  const theme = useTheme();

  return (
    <NavContext.Provider value={{ isModal: true }}>
      <NewModelFuelStack.Navigator
        initialRouteName="NewModelFuel"
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.screenHeaderBackground,
          },
          headerTitleStyle: { color: theme.colors.screenHeaderTitle },
          headerTintColor: theme.colors.screenHeaderButtonText,
        }}>
        <NewModelFuelStack.Screen
          name="NewModelFuel"
          // @ts-expect-error
          component={ModelFuelEditorScreen}
          options={{
            title: 'New Fuel',
            presentation: 'modal',
          }}
        />
        <NewModelFuelStack.Screen
          name="NotesEditor"
          component={NotesEditorScreen}
          options={{
            title: 'Fuel Notes',
          }}
        />
      </NewModelFuelStack.Navigator>
    </NavContext.Provider>
  );
};

export default NewModelFuelNavigator;
