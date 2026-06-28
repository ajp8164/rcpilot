import React from 'react';

import { useTheme } from '@react-native-hello/ui';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { navigatorScreenOptions } from 'components/atoms/navigation/navigatorScreenOptions';
import BatteryEditorScreen from 'components/BatteryEditorScreen';
import EnumPickerScreen from 'components/EnumPickerScreen';
import NotesEditorScreen from 'components/NotesEditorScreen';
import { NewBatteryNavigatorParamList } from 'types/navigation';

import NavContext from './NavContext';

const NewBatteryStack =
  createNativeStackNavigator<NewBatteryNavigatorParamList>();

const NewBatteryNavigator = () => {
  const theme = useTheme();

  return (
    <NavContext.Provider value={{ isModal: true }}>
      <NewBatteryStack.Navigator
        initialRouteName="NewBattery"
        screenOptions={navigatorScreenOptions(theme)}>
        <NewBatteryStack.Screen
          name="NewBattery"
          // @ts-expect-error
          component={BatteryEditorScreen}
          options={{
            title: '',
          }}
        />
        <NewBatteryStack.Screen
          name="NotesEditor"
          component={NotesEditorScreen}
          options={{
            title: 'Battery Notes',
          }}
        />
        <NewBatteryStack.Screen
          name="EnumPicker"
          component={EnumPickerScreen}
          options={{
            title: '',
          }}
        />
      </NewBatteryStack.Navigator>
    </NavContext.Provider>
  );
};

export default NewBatteryNavigator;
