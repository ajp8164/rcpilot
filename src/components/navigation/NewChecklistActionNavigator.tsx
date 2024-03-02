import ChecklistActionEditorScreen from 'components/ChecklistActionEditorScreen';
import ChecklistActionHistoryScreen from 'components/ChecklistActionHistoryScreen';
import NavContext from './NavContext';
import { NewChecklistActionNavigatorParamList } from 'types/navigation';
import NotesScreen from 'components/NotesScreen';
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'theme';

const NewChecklistActionStack = createNativeStackNavigator<NewChecklistActionNavigatorParamList>();

const NewChecklistActionNavigator = () => {
  const theme = useTheme();

  return (
    <NavContext.Provider value={{isModal: true}}>
      <NewChecklistActionStack.Navigator
        initialRouteName='NewChecklistAction'
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.screenHeaderBackground },
          headerTitleStyle: { color: theme.colors.screenHeaderTitle },
          headerTintColor: theme.colors.screenHeaderButtonText,
        }}>
        <NewChecklistActionStack.Screen
          name="NewChecklistAction"
          // @ts-expect-error
          component={ChecklistActionEditorScreen}
          options={{
            title: 'New Action',
          }}
        />
        <NewChecklistActionStack.Screen
          name='Notes'
          component={NotesScreen}
          options={{
            title: 'Action Notes',
          }}
        />
        <NewChecklistActionStack.Screen
          name="ChecklistActionHistory"
          component={ChecklistActionHistoryScreen}
          options={{
            title: 'Action History',
          }}
        />
      </NewChecklistActionStack.Navigator>
    </NavContext.Provider>
  );
};

export default NewChecklistActionNavigator;
