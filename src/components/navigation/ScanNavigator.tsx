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
      <ScanStack.Screen
        name="Scan"
        component={ScanScreen}
        options={{
          title: 'Scan',
          headerLeft: () => null,
          headerLargeTitle: true,
        }}
      />
    </ScanStack.Navigator>
  );
};

export default ScanNavigator;