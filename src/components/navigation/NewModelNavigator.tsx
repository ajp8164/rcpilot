import EventStyleScreen from 'components/EventStyleScreen';
import ModelCategoryScreen from 'components/ModelCategoryScreen';
import ModelTypeScreen from 'components/ModelTypeScreen';
import NavContext from './NavContext';
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
    <NavContext.Provider value={{isModal: true}}>
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
          }}
        />
        <NewModelStack.Screen
          name='EventStyle'
          component={EventStyleScreen}
          options={{
            title: 'Default Style',
          }}
        />
        <NewModelStack.Screen
          name='ModelType'
          component={ModelTypeScreen}
          options={{
            title: 'Model Type',
          }}
        />
        <NewModelStack.Screen
          name='ModelCategory'
          component={ModelCategoryScreen}
          options={{
            title: 'Model Category',
          }}
        />
        <NewModelStack.Screen
          name='Propeller'
          component={PropellerScreen}
          options={{
            title: 'Default Propeller',
          }}
        />
        <NewModelStack.Screen
          name='ScanCodeSize'
          component={ScanCodeSizeScreen}
          options={{
            title: 'QR Code Size',
          }}
        />
        <NewModelStack.Screen
          name='Notes'
          component={NotesScreen}
          options={{
            title: 'Model Notes',
          }}
        />
      </NewModelStack.Navigator>
    </NavContext.Provider>
  );
};

export default NewModelNavigator;
