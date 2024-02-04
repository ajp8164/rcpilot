import EnumPickerScreen from 'components/EnumPickerScreen';
import ModelPropellerEditorScreen from 'components/ModelPropellerEditorScreen';
import NavContext from './NavContext';
import { NewModelPropellerNavigatorParamList } from 'types/navigation';
import NotesScreen from 'components/NotesScreen';
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'theme';

const NewModelPropellerStack = createNativeStackNavigator<NewModelPropellerNavigatorParamList>();

const NewModelPropellerNavigator = () => {
  const theme = useTheme();

  return (
    <NavContext.Provider value={{isModal: true}}>
      <NewModelPropellerStack.Navigator
        initialRouteName='NewModelPropeller'
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.screenHeaderBackground },
          headerTitleStyle: { color: theme.colors.screenHeaderText },
          headerTintColor: theme.colors.screenHeaderBackButton,
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
          name='EnumPicker'
          component={EnumPickerScreen}
          options={{
            title: '',
          }}
        />
        <NewModelPropellerStack.Screen
          name='Notes'
          component={NotesScreen}
          options={{
            title: 'Propeller Notes',
          }}
        />
      </NewModelPropellerStack.Navigator>
    </NavContext.Provider>
  );
};

export default NewModelPropellerNavigator;
