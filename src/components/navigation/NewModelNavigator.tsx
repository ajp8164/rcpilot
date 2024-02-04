import EnumPickerScreen from 'components/EnumPickerScreen';
import ModelEditorScreen from 'components/ModelEditorScreen';
import NavContext from './NavContext';
import { NewModelNavigatorParamList } from 'types/navigation';
import NotesScreen from 'components/NotesScreen';
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
          headerLargeTitleShadowVisible: false,
          headerLargeStyle: { backgroundColor: theme.colors.viewBackground },
          headerStyle: { backgroundColor: theme.colors.screenHeaderBackground },
          headerTitleStyle: { color: theme.colors.screenHeaderText },
          headerTintColor: theme.colors.screenHeaderBackButton,
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
          name='Notes'
          component={NotesScreen}
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
