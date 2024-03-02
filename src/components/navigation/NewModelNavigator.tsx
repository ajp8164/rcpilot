import EnumPickerScreen from 'components/EnumPickerScreen';
import ModelEditorScreen from 'components/ModelEditorScreen';
import NavContext from './NavContext';
import { NewModelNavigatorParamList } from 'types/navigation';
import NotesEditorScreen from 'components/NotesEditorScreen';
import React from 'react';
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
          headerStyle: { backgroundColor: theme.colors.screenHeaderBackground },
          headerTitleStyle: { color: theme.colors.screenHeaderTitle },
          headerTintColor: theme.colors.screenHeaderButtonText,
        }}>
        <NewModelStack.Screen
          name='NewModel'
          // @ts-expect-error
          component={ModelEditorScreen}
          options={{
            title: '',
          }}
        />
        <NewModelStack.Screen
          name='NotesEditor'
          component={NotesEditorScreen}
          options={{
            title: 'Model Notes',
          }}
        />
        <NewModelStack.Screen
          name="EnumPicker"
          component={EnumPickerScreen}
          options={{
            title: '',
          }}
        />
      </NewModelStack.Navigator>
    </NavContext.Provider>
  );
};

export default NewModelNavigator;
