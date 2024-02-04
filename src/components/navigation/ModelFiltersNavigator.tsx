import EnumPickerScreen from 'components/EnumPickerScreen';
import ModelFilterEditorScreen from 'components/ModelFilterEditorScreen';
import { ModelFiltersNavigatorParamList } from 'types/navigation';
import ModelFiltersScreen from 'components/ModelFiltersScreen';
import NavContext from './NavContext';
import NotesScreen from 'components/NotesScreen';
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
          headerLargeTitleShadowVisible: false,
          headerLargeStyle: { backgroundColor: theme.colors.viewBackground },
          headerStyle: { backgroundColor: theme.colors.screenHeaderBackground },
          headerTitleStyle: { color: theme.colors.screenHeaderText },
          headerTintColor: theme.colors.screenHeaderBackButton,
        }}>
        <ModelFiltersStack.Screen
          name='EnumPicker'
          component={EnumPickerScreen}
          options={{
            title: '',
          }}
        />
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
          name='Notes'
          component={NotesScreen}
          options={{
            title: 'String Value',
          }}
        />
      </ModelFiltersStack.Navigator>
    </NavContext.Provider>
  );
};

export default ModelFiltersNavigator;
