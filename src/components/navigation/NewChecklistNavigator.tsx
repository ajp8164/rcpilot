import ChecklistActionEditorScreen from 'components/ChecklistActionEditorScreen';
import ChecklistEditorScreen from 'components/ChecklistEditorScreen';
import EnumPickerScreen from 'components/EnumPickerScreen';
import NavContext from './NavContext';
import { NewChecklistNavigatorParamList } from 'types/navigation';
import NotesEditorScreen from 'components/NotesEditorScreen';
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'theme';

const NewChecklistStack =
  createNativeStackNavigator<NewChecklistNavigatorParamList>();

const NewChecklistNavigator = () => {
  const theme = useTheme();

  return (
    <NavContext.Provider value={{ isModal: true }}>
      <NewChecklistStack.Navigator
        initialRouteName="NewChecklist"
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.screenHeaderBackground },
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
