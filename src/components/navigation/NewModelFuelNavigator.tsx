import React from 'react';

import { useTheme } from '@react-native-hello/ui';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { navigatorScreenOptions } from 'components/atoms/navigation/navigatorScreenOptions';
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
        screenOptions={navigatorScreenOptions(theme)}>
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
