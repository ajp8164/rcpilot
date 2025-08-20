import React from 'react';

import { useTheme } from '@react-native-hello/ui';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ChecklistActionEditorScreen from 'components/ChecklistActionEditorScreen';
import ChecklistEditorScreen from 'components/ChecklistEditorScreen';
import EnumPickerScreen from 'components/EnumPickerScreen';
import NotesEditorScreen from 'components/NotesEditorScreen';
import { NewChecklistNavigatorParamList } from 'types/navigation';

import NavContext from './NavContext';

const NewChecklistStack =
  createNativeStackNavigator<NewChecklistNavigatorParamList>();

const NewChecklistNavigator = () => {
  const theme = useTheme();

  return (
    <NavContext.Provider value={{ isModal: true }}>
      <NewChecklistStack.Navigator
        initialRouteName="NewChecklist"
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.screenHeaderBackground,
          },
          headerTitleStyle: { color: theme.colors.screenHeaderTitle },
          headerTintColor: theme.colors.screenHeaderButtonText,
        }}>
        <NewChecklistStack.Screen
          name="NewChecklist"
          // @ts-expect-error
          component={ChecklistEditorScreen}
          options={({ route }) => ({
            title: route.params.modelId ? 'New Checklist' : 'New Template',
          })}
        />
        <NewChecklistStack.Screen
          name="ChecklistActionEditor"
          component={ChecklistActionEditorScreen}
          options={{
            title: 'Action',
          }}
        />
        <NewChecklistStack.Screen
          name="EnumPicker"
          component={EnumPickerScreen}
          options={{
            title: '',
            headerBackTitle: '',
          }}
        />
        <NewChecklistStack.Screen
          name="NotesEditor"
          component={NotesEditorScreen}
          options={{
            title: 'Action Notes',
          }}
        />
      </NewChecklistStack.Navigator>
    </NavContext.Provider>
  );
};

export default NewChecklistNavigator;
