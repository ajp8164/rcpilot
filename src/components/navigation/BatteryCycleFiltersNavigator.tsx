import BatteryCycleFilterEditorScreen from 'components/BatteryCycleFilterEditorScreen';
import { BatteryCycleFiltersNavigatorParamList } from 'types/navigation';
import BatteryCycleFiltersScreen from 'components/BatteryCycleFiltersScreen';
import EnumPickerScreen from 'components/EnumPickerScreen';
import NavContext from './NavContext';
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'theme';

const BatteryCycleFiltersStack = createNativeStackNavigator<BatteryCycleFiltersNavigatorParamList>();

const BatteryCycleFiltersNavigator = () => {
  const theme = useTheme();

  return (
    <NavContext.Provider value={{isModal: true}}>
      <BatteryCycleFiltersStack.Navigator
        initialRouteName='BatteryCycleFilters'
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.screenHeaderBackground },
          headerTitleStyle: { color: theme.colors.screenHeaderTitle },
          headerTintColor: theme.colors.screenHeaderButtonText,
        }}>
        <BatteryCycleFiltersStack.Screen
          name='BatteryCycleFilters'
          component={BatteryCycleFiltersScreen}
          options={{
            title: 'Filters for Cycles',
          }}
        />
        <BatteryCycleFiltersStack.Screen
          name='BatteryCycleFilterEditor'
          component={BatteryCycleFilterEditorScreen}
          options={{
            title: 'Filter Editor',
          }}
        />
        <BatteryCycleFiltersStack.Screen
          name='EnumPicker'
          component={EnumPickerScreen}
          options={{
            title: '',
          }}
        />
      </BatteryCycleFiltersStack.Navigator>
    </NavContext.Provider>
  );
};

export default BatteryCycleFiltersNavigator;
