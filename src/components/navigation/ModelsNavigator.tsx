import { ModelsNavigatorParamList } from 'types/navigation';
import ModelsScreen from 'components/ModelsScreen';
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'theme';

const ModelsStack = createNativeStackNavigator<ModelsNavigatorParamList>();

const ModelsNavigator = () => {
  const theme = useTheme();

  return (
    <ModelsStack.Navigator
    initialRouteName="Models"
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
      <ModelsStack.Screen
        name="Models"
        component={ModelsScreen}
        options={{
          title: 'Models',
          headerLeft: () => null,
          headerLargeTitle: true,
        }}
      />
    </ModelsStack.Navigator>
  );
};

export default ModelsNavigator;
