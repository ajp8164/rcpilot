import ModelFilterEditorScreen from 'components/ModelFilterEditorScreen';
import ModelFilterModelTypesScreen from 'components/ModelFilterModelTypesScreen';
import { ModelFiltersNavigatorParamList } from 'types/navigation';
import ModelFiltersScreen from 'components/ModelFiltersScreen';
import NavContext from './NavContext';
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'theme';

const ModelFiltersStack = createNativeStackNavigator<ModelFiltersNavigatorParamList>();

const ModelFiltersNavigator = () => {
  const theme = useTheme();

  return (
    <NavContext.Provider value={{isModal: true}}>
      <ModelFiltersStack.Navigator
      initialRouteName='ModelFilters'
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
        <ModelFiltersStack.Screen
          name='ModelFilters'
          component={ModelFiltersScreen}
          options={{
            title: 'Filters for Models',
          }}
        />
        <ModelFiltersStack.Screen
          name='ModelFilterEditor'
          component={ModelFilterEditorScreen}
          options={{
            title: 'Filter Editor',
          }}
        />
        <ModelFiltersStack.Screen
          name='ModelFilterModelTypes'
          component={ModelFilterModelTypesScreen}
          options={{
            title: 'Model Types',
          }}
        />
      </ModelFiltersStack.Navigator>
    </NavContext.Provider>
  );
};

export default ModelFiltersNavigator;
