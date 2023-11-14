import ModelTypeScreen from 'components/ModelTypeScreen';
import { NewModelNavigatorParamList } from 'types/navigation';
import NewModelScreen from 'components/NewModelScreen';
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'theme';

const NewModelStack = createNativeStackNavigator<NewModelNavigatorParamList>();

const NewModelNavigator = () => {
  const theme = useTheme();

  return (
    <NewModelStack.Navigator
    initialRouteName='NewModel'
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
      <NewModelStack.Screen
        name='NewModel'
        component={NewModelScreen}
        options={{
          title: 'New Model',
          presentation: 'modal'
        }}
      />
      <NewModelStack.Screen
        name='ModelType'
        component={ModelTypeScreen}
        options={{
          title: 'Model Type',
          presentation: 'card'
        }}
      />
    </NewModelStack.Navigator>
  );
};

export default NewModelNavigator;
