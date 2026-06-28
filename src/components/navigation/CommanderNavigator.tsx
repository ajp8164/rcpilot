import React from 'react';

import { useTheme } from '@react-native-hello/ui';
import {
  NativeStackScreenProps,
  createNativeStackNavigator,
} from '@react-navigation/native-stack';
import { navigatorScreenOptions } from 'components/atoms/navigation/navigatorScreenOptions';
import ModelPickerScreen from 'components/ModelPickerScreen';
import { CommanderNavigatorParamList } from 'types/navigation';

const CommanderStack =
  createNativeStackNavigator<CommanderNavigatorParamList>();

export type Props = NativeStackScreenProps<CommanderNavigatorParamList>;

const CommanderNavigator = () => {
  const theme = useTheme();

  return (
    <CommanderStack.Navigator
      screenOptions={navigatorScreenOptions(theme)}>
      <CommanderStack.Screen
        name="ModelPicker"
        component={ModelPickerScreen}
        options={{
          title: '',
          headerBackTitle: '',
        }}
      />
    </CommanderStack.Navigator>
  );
};

export default CommanderNavigator;
