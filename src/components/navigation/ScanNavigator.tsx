import React from 'react';
import { ScanNavigatorParamList } from 'types/navigation';
import ScanScreen from 'components/ScanScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'theme';

const ScanStack = createNativeStackNavigator<ScanNavigatorParamList>();

const ScanNavigator = () => {
  const theme = useTheme();

  return (
    <ScanStack.Navigator
      initialRouteName="Scan"
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.screenHeaderBackground },
        headerTitleStyle: { color: theme.colors.screenHeaderTitle },
        headerTintColor: theme.colors.screenHeaderButtonText,
      }}>
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
