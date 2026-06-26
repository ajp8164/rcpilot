import React from 'react';

import { useTheme } from '@react-native-hello/ui';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { navigatorScreenOptions } from 'components/atoms/navigation/navigatorScreenOptions';
import ScanScreen from 'components/ScanScreen';
import { ScanNavigatorParamList } from 'types/navigation';

const ScanStack = createNativeStackNavigator<ScanNavigatorParamList>();

const ScanNavigator = () => {
  const theme = useTheme();

  return (
    <ScanStack.Navigator
      initialRouteName="Scan"
      screenOptions={navigatorScreenOptions(theme)}>
      <ScanStack.Screen
        name="Scan"
        component={ScanScreen}
        options={{
          title: 'Scan',
          headerLeft: () => null,
          headerShown: false,
        }}
      />
    </ScanStack.Navigator>
  );
};

export default ScanNavigator;
