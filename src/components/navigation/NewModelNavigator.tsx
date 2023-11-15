import EventStyleScreen from 'components/EventStyleScreen';
import ModelCategoryScreen from 'components/ModelCategoryScreen';
import ModelTypeScreen from 'components/ModelTypeScreen';
import { NewModelNavigatorParamList } from 'types/navigation';
import NewModelScreen from 'components/NewModelScreen';
import NotesScreen from 'components/NotesScreen';
import PropellerScreen from 'components/PropellerScreen';
import React from 'react';
import ScanCodeSizeScreen from 'components/ScanCodeSizeScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'theme';

const NewModelStack = createNativeStackNavigator<NewModelNavigatorParamList>();

const NewModelNavigator = () => {
  const theme = useTheme();

  return (
    <NewModelStack.Navigator
    initialRouteName='NewModel'
    screenOptions={{
      headerBackTitle: 'Model',
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
        name='EventStyle'
        component={EventStyleScreen}
        options={{
          title: 'Default Style',
          presentation: 'card'
        }}
      />
      <NewModelStack.Screen
        name='ModelType'
        component={ModelTypeScreen}
        options={{
          title: 'Model Type',
          presentation: 'card',
        }}
      />
      <NewModelStack.Screen
        name='ModelCategory'
        component={ModelCategoryScreen}
        options={{
          title: 'Model Category',
          presentation: 'card'
        }}
      />
      <NewModelStack.Screen
        name='Propeller'
        component={PropellerScreen}
        options={{
          title: 'Default Propeller',
          presentation: 'card'
        }}
      />
      <NewModelStack.Screen
        name='ScanCodeSize'
        component={ScanCodeSizeScreen}
        options={{
          title: 'QR Code Size',
          presentation: 'card'
        }}
      />
      <NewModelStack.Screen
        name='Notes'
        component={NotesScreen}
        options={{
          title: 'Model Notes',
          presentation: 'card'
        }}
      />
    </NewModelStack.Navigator>
  );
};

export default NewModelNavigator;
