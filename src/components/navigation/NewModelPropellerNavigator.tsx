import EnumPickerScreen from 'components/EnumPickerScreen';
import ModelPropellerEditorScreen from 'components/ModelPropellerEditorScreen';
import NavContext from './NavContext';
import { NewModelPropellerNavigatorParamList } from 'types/navigation';
import NotesEditorScreen from 'components/NotesEditorScreen';
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'theme';

const NewModelPropellerStack =
  createNativeStackNavigator<NewModelPropellerNavigatorParamList>();

const NewModelPropellerNavigator = () => {
  const theme = useTheme();

  return (
    <NavContext.Provider value={{ isModal: true }}>
      <NewModelPropellerStack.Navigator
        initialRouteName="NewModelPropeller"
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.screenHeaderBackground },
          headerTitleStyle: { color: theme.colors.screenHeaderTitle },
          headerTintColor: theme.colors.screenHeaderButtonText,
        }}>
        <NewModelPropellerStack.Screen
          name="NewModelPropeller"
          // @ts-expect-error
          component={ModelPropellerEditorScreen}
          options={{
            title: 'New Propeller',
            presentation: 'modal',
          }}
        />
        <NewModelPropellerStack.Screen
          name="EnumPicker"
          component={EnumPickerScreen}
          options={{
            title: '',
          }}
        />
        <NewModelPropellerStack.Screen
          name="NotesEditor"
          component={NotesEditorScreen}
          options={{
            title: 'Propeller Notes',
          }}
        />
      </NewModelPropellerStack.Navigator>
    </NavContext.Provider>
  );
};

export default NewModelPropellerNavigator;
