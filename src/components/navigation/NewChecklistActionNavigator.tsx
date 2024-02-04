import ChecklistActionEditorScreen from 'components/ChecklistActionEditorScreen';
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
          headerLargeTitleShadowVisible: false,
          headerLargeStyle: { backgroundColor: theme.colors.viewBackground },
          headerStyle: { backgroundColor: theme.colors.screenHeaderBackground },
          headerTitleStyle: { color: theme.colors.screenHeaderText },
          headerTintColor: theme.colors.screenHeaderBackButton,
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
      </NewChecklistActionStack.Navigator>
    </NavContext.Provider>
  );
};

export default NewChecklistActionNavigator;
