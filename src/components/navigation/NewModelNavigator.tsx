import NavContext from './NavContext';
import { NewModelNavigatorParamList } from 'types/navigation';
import NewModelScreen from 'components/NewModelScreen';
import NotesScreen from 'components/NotesScreen';
import React from 'react';
import ValuePickerScreen from 'components/ValuePickerScreen';
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
        headerLargeTitleShadowVisible: theme.mode === 'light',
        headerLargeStyle: {
          backgroundColor: theme.colors.screenHeaderBackground,
        },
        headerStyle: {
          backgroundColor: theme.colors.screenHeaderBackground,
        },
        headerTitleStyle: {
          color: theme.colors.screenHeaderText,
        },
        headerTintColor: theme.colors.screenHeaderBackButton,
      }}>
        <NewModelStack.Screen
          name='NewModel'
          component={NewModelScreen}
          options={{
            title: 'New Model',
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
        name="ValuePicker"
        component={ValuePickerScreen}
        options={{
          title: '',
        }}
      />
      </NewModelStack.Navigator>
    </NavContext.Provider>
  );
};

export default NewModelNavigator;
