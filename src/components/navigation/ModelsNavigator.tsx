import ModelCategoryScreen from 'components/ModelCategoryScreen';
import ModelScreen from 'components/ModelScreen';
import { ModelsNavigatorParamList } from 'types/navigation';
import ModelsScreen from 'components/ModelsScreen';
import NewModelNavigator from 'components/navigation/NewModelNavigator';
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'theme';

const ModelsStack = createNativeStackNavigator<ModelsNavigatorParamList>();

const ModelsNavigator = () => {
  const theme = useTheme();

  return (
    <ModelsStack.Navigator
    initialRouteName='Models'
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
        name='Models'
        component={ModelsScreen}
        options={{
          title: 'Models',
          headerLargeTitle: true,
        }}
      />
      <ModelsStack.Screen
        name='Model'
        component={ModelScreen}
        />
      <ModelsStack.Screen
        name='ModelCategory'
        component={ModelCategoryScreen}
        options={{
          title: 'Model Category',
          presentation: 'card'
        }}
      />
      <ModelsStack.Screen
        name='NewModelNavigator'
        component={NewModelNavigator}
        options={{
          headerShown: false,
          presentation: 'modal'
        }}
      />
    </ModelsStack.Navigator>
  );
};

export default ModelsNavigator;