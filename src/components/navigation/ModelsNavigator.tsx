import EventStyleScreen from 'components/EventStyleScreen';
import ModelCategoryScreen from 'components/ModelCategoryScreen';
import ModelFiltersScreen from 'components/ModelFiltersScreen';
import ModelScreen from 'components/ModelScreen';
import { ModelsNavigatorParamList } from 'types/navigation';
import ModelsScreen from 'components/ModelsScreen';
import NewModelNavigator from 'components/navigation/NewModelNavigator';
import NotesScreen from 'components/NotesScreen';
import PropellerScreen from 'components/PropellerScreen';
import React from 'react';
import ScanCodeSizeScreen from 'components/ScanCodeSizeScreen';
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
        }}
      />
      <ModelsStack.Screen
        name='EventStyle'
        component={EventStyleScreen}
        options={{
          title: 'Default Style',
        }}
      />
      <ModelsStack.Screen
        name='ModelFilters'
        component={ModelFiltersScreen}
        options={{
          title: 'Filter for Models',
          presentation: 'modal',
        }}
      />
      <ModelsStack.Screen
        name='Propeller'
        component={PropellerScreen}
        options={{
          title: 'Default Propeller',
        }}
      />
      <ModelsStack.Screen
        name='ScanCodeSize'
        component={ScanCodeSizeScreen}
        options={{
          title: 'QR Code Size',
        }}
      />
      <ModelsStack.Screen
        name='Notes'
        component={NotesScreen}
        options={{
          title: 'Model Notes',
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
