import EnumPickerScreen from 'components/EnumPickerScreen';
import ModelMaintenanceFilterEditorScreen from 'components/ModelMaintenanceFilterEditorScreen';
import { ModelMaintenanceFiltersNavigatorParamList } from 'types/navigation';
import ModelMaintenanceFiltersScreen from 'components/ModelMaintenanceFiltersScreen';
import NavContext from './NavContext';
import NotesEditorScreen from 'components/NotesEditorScreen';
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'theme';

const ModelMaintenanceFiltersStack = createNativeStackNavigator<ModelMaintenanceFiltersNavigatorParamList>();

const ModelMaintenanceFiltersNavigator = () => {
  const theme = useTheme();

  return (
    <NavContext.Provider value={{isModal: true}}>
      <ModelMaintenanceFiltersStack.Navigator
        initialRouteName='ModelMaintenanceFilters'
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.screenHeaderBackground },
          headerTitleStyle: { color: theme.colors.screenHeaderTitle },
          headerTintColor: theme.colors.screenHeaderButtonText,
        }}>
        <ModelMaintenanceFiltersStack.Screen
          name='EnumPicker'
          component={EnumPickerScreen}
          options={{
            title: '',
          }}
        />
        <ModelMaintenanceFiltersStack.Screen
          name='ModelMaintenanceFilters'
          component={ModelMaintenanceFiltersScreen}
          options={{
            title: 'Filters for Events',
          }}
        />
        <ModelMaintenanceFiltersStack.Screen
          name='ModelMaintenanceFilterEditor'
          component={ModelMaintenanceFilterEditorScreen}
          options={{
            title: 'Filter Editor',
          }}
        />
        <ModelMaintenanceFiltersStack.Screen
          name='NotesEditor'
          component={NotesEditorScreen}
          options={{
            title: 'String Value',
          }}
        />
      </ModelMaintenanceFiltersStack.Navigator>
    </NavContext.Provider>
  );
};

export default ModelMaintenanceFiltersNavigator;
