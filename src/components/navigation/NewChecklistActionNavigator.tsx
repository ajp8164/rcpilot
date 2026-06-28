import React from 'react';

import { useTheme } from '@react-native-hello/ui';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { navigatorScreenOptions } from 'components/atoms/navigation/navigatorScreenOptions';
import ChecklistActionEditorScreen from 'components/ChecklistActionEditorScreen';
import ChecklistActionHistoryScreen from 'components/ChecklistActionHistoryScreen';
import NotesEditorScreen from 'components/NotesEditorScreen';
import { NewChecklistActionNavigatorParamList } from 'types/navigation';

import NavContext from './NavContext';

const NewChecklistActionStack =
  createNativeStackNavigator<NewChecklistActionNavigatorParamList>();

const NewChecklistActionNavigator = () => {
  const theme = useTheme();

  return (
    <NavContext.Provider value={{ isModal: true }}>
      <NewChecklistActionStack.Navigator
        initialRouteName="NewChecklistAction"
        screenOptions={navigatorScreenOptions(theme)}>
        <NewChecklistActionStack.Screen
          name="NewChecklistAction"
          // @ts-expect-error
          component={ChecklistActionEditorScreen}
          options={{
            title: 'New Action',
          }}
        />
        <NewChecklistActionStack.Screen
          name="NotesEditor"
          component={NotesEditorScreen}
          options={{
            title: 'Action Notes',
          }}
        />
        <NewChecklistActionStack.Screen
          name="ChecklistActionHistory"
          component={ChecklistActionHistoryScreen}
          options={{
            title: 'Action Log',
          }}
        />
      </NewChecklistActionStack.Navigator>
    </NavContext.Provider>
  );
};

export default NewChecklistActionNavigator;
