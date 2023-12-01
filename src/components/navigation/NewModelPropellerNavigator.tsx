import EnumPickerScreen from 'components/EnumPickerScreen';
import NavContext from './NavContext';
import { NewModelPropellerNavigatorParamList } from 'types/navigation';
import NewModelPropellerScreen from 'components/NewModelPropellerScreen';
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
        <NewModelPropellerStack.Screen
          name="NewModelPropeller"
          component={NewModelPropellerScreen}
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
