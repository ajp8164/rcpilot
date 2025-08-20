import React from 'react';

import { useTheme } from '@react-native-hello/ui';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BatteryCycleFilterEditorScreen from 'components/BatteryCycleFilterEditorScreen';
import BatteryCycleFiltersScreen from 'components/BatteryCycleFiltersScreen';
import EnumPickerScreen from 'components/EnumPickerScreen';
import NotesEditorScreen from 'components/NotesEditorScreen';
import { BatteryCycleFiltersNavigatorParamList } from 'types/navigation';

import NavContext from './NavContext';

const BatteryCycleFiltersStack =
  createNativeStackNavigator<BatteryCycleFiltersNavigatorParamList>();

const BatteryCycleFiltersNavigator = () => {
  const theme = useTheme();

  return (
    <NavContext.Provider value={{ isModal: true }}>
      <BatteryCycleFiltersStack.Navigator
        initialRouteName="BatteryCycleFilters"
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.screenHeaderBackground,
          },
          headerTitleStyle: { color: theme.colors.screenHeaderTitle },
          headerTintColor: theme.colors.screenHeaderButtonText,
        }}>
        <BatteryCycleFiltersStack.Screen
          name="BatteryCycleFilters"
          component={BatteryCycleFiltersScreen}
          options={{
            title: 'Filters for Cycles',
          }}
        />
        <BatteryCycleFiltersStack.Screen
          name="BatteryCycleFilterEditor"
          component={BatteryCycleFilterEditorScreen}
          options={{
            title: 'Filter Editor',
          }}
        />
        <BatteryCycleFiltersStack.Screen
          name="EnumPicker"
          component={EnumPickerScreen}
          options={{
            title: '',
          }}
        />
        <BatteryCycleFiltersStack.Screen
          name="NotesEditor"
          component={NotesEditorScreen}
          options={{
            title: 'String Value',
          }}
        />
      </BatteryCycleFiltersStack.Navigator>
    </NavContext.Provider>
  );
};

export default BatteryCycleFiltersNavigator;
