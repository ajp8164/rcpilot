import React from 'react';

import { useTheme } from '@react-native-hello/ui';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { navigatorScreenOptions } from 'components/atoms/navigation/navigatorScreenOptions';
import EnumPickerScreen from 'components/EnumPickerScreen';
import ModelFilterEditorScreen from 'components/ModelFilterEditorScreen';
import ModelFiltersScreen from 'components/ModelFiltersScreen';
import NotesEditorScreen from 'components/NotesEditorScreen';
import { ModelFiltersNavigatorParamList } from 'types/navigation';

import NavContext from './NavContext';

const ModelFiltersStack =
  createNativeStackNavigator<ModelFiltersNavigatorParamList>();

const ModelFiltersNavigator = () => {
  const theme = useTheme();

  return (
    <NavContext.Provider value={{ isModal: true }}>
      <ModelFiltersStack.Navigator
        initialRouteName="ModelFilters"
        screenOptions={navigatorScreenOptions(theme)}>
        <ModelFiltersStack.Screen
          name="EnumPicker"
          component={EnumPickerScreen}
          options={{
            title: '',
          }}
        />
        <ModelFiltersStack.Screen
          name="ModelFilters"
          component={ModelFiltersScreen}
          options={{
            title: 'Filters for Models',
          }}
        />
        <ModelFiltersStack.Screen
          name="ModelFilterEditor"
          component={ModelFilterEditorScreen}
          options={{
            title: 'Filter Editor',
          }}
        />
        <ModelFiltersStack.Screen
          name="NotesEditor"
          component={NotesEditorScreen}
          options={{
            title: 'String Value',
          }}
        />
      </ModelFiltersStack.Navigator>
    </NavContext.Provider>
  );
};

export default ModelFiltersNavigator;
