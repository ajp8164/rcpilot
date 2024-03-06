import { NativeStackScreenProps, createNativeStackNavigator } from '@react-navigation/native-stack';

import ModelPickerScreen from 'components/ModelPickerScreen';
import { PilotNavigatorParamList } from 'types/navigation';
import React from 'react';
import { useTheme } from 'theme';

const PilotStack = createNativeStackNavigator<PilotNavigatorParamList>();

export type Props = NativeStackScreenProps<PilotNavigatorParamList>;

const PilotNavigator = () => {
  const theme = useTheme();

  return (
    <PilotStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.screenHeaderBackground },
        headerTitleStyle: { color: theme.colors.screenHeaderTitle },
        headerTintColor: theme.colors.clearButtonText,
      }}>
      <PilotStack.Screen
        name="ModelPicker"
        component={ModelPickerScreen}
        options={{
          title: '',
          headerBackTitle: '',
        }}
      />
    </PilotStack.Navigator>
  );
};

export default PilotNavigator;
