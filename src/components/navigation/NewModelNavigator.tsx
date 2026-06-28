import React from 'react';

import { useTheme } from '@react-native-hello/ui';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { navigatorScreenOptions } from 'components/atoms/navigation/navigatorScreenOptions';
import EnumPickerScreen from 'components/EnumPickerScreen';
import ModelEditorScreen from 'components/ModelEditorScreen';
import NotesEditorScreen from 'components/NotesEditorScreen';
import { NewModelNavigatorParamList } from 'types/navigation';

import NavContext from './NavContext';

const NewModelStack = createNativeStackNavigator<NewModelNavigatorParamList>();

const NewModelNavigator = () => {
  const theme = useTheme();

  return (
    <NavContext.Provider value={{ isModal: true }}>
      <NewModelStack.Navigator
        initialRouteName="NewModel"
        screenOptions={{
          ...navigatorScreenOptions(theme),
          headerBackTitle: 'Model',
        }}>
        <NewModelStack.Screen
          name="NewModel"
          // @ts-expect-error
          component={ModelEditorScreen}
          options={{
            title: '',
          }}
        />
        <NewModelStack.Screen
          name="NotesEditor"
          component={NotesEditorScreen}
          options={{
            title: 'Model Notes',
          }}
        />
        <NewModelStack.Screen
          name="EnumPicker"
          component={EnumPickerScreen}
          options={{
            title: '',
          }}
        />
      </NewModelStack.Navigator>
    </NavContext.Provider>
  );
};

export default NewModelNavigator;
