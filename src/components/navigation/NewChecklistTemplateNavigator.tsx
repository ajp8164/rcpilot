import ChecklistActionEditorScreen from 'components/ChecklistActionEditorScreen';
import ChecklistEditorScreen from 'components/ChecklistEditorScreen';
import EnumPickerScreen from 'components/EnumPickerScreen';
import NavContext from './NavContext';
import { NewChecklistTemplateNavigatorParamList } from 'types/navigation';
import NotesScreen from 'components/NotesScreen';
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'theme';

const NewChecklistTemplateStack = createNativeStackNavigator<NewChecklistTemplateNavigatorParamList>();

const NewChecklistTemplateNavigator = () => {
  const theme = useTheme();

  return (
    <NavContext.Provider value={{isModal: true}}>
      <NewChecklistTemplateStack.Navigator
        initialRouteName='NewChecklistTemplate'
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.screenHeaderBackground },
          headerTitleStyle: { color: theme.colors.screenHeaderTitle },
          headerTintColor: theme.colors.screenHeaderButtonText,
        }}>
        <NewChecklistTemplateStack.Screen
          name="NewChecklistTemplate"
          // @ts-expect-error
          component={ChecklistEditorScreen}
          options={{
            title: 'New Template',
          }}
        />
        <NewChecklistTemplateStack.Screen
          name="ChecklistActionEditor"
          component={ChecklistActionEditorScreen}
          options={{
            title: 'Action',
          }}
        />
        <NewChecklistTemplateStack.Screen
          name='EnumPicker'
          component={EnumPickerScreen}
          options={{
            title: '',
            headerBackTitle: '',
          }}
        />
        <NewChecklistTemplateStack.Screen
          name='Notes'
          component={NotesScreen}
          options={{
            title: 'Action Notes',
          }}
        />
      </NewChecklistTemplateStack.Navigator>
    </NavContext.Provider>
  );
};

export default NewChecklistTemplateNavigator;
