import NavContext from './NavContext';
import { NewModelFuelNavigatorParamList } from 'types/navigation';
import NewModelFuelScreen from 'components/NewModelFuelScreen';
import NotesScreen from 'components/NotesScreen';
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'theme';

const NewModelFuelStack = createNativeStackNavigator<NewModelFuelNavigatorParamList>();

const NewModelFuelNavigator = () => {
  const theme = useTheme();

  return (
    <NavContext.Provider value={{isModal: true}}>
      <NewModelFuelStack.Navigator
      initialRouteName='NewModelFuel'
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
        <NewModelFuelStack.Screen
          name="NewModelFuel"
          component={NewModelFuelScreen}
          options={{
            title: 'New Fuel',
            presentation: 'modal',
          }}
        />
        <NewModelFuelStack.Screen
          name='Notes'
          component={NotesScreen}
          options={{
            title: 'Fuel Notes',
          }}
        />
      </NewModelFuelStack.Navigator>
    </NavContext.Provider>
  );
};

export default NewModelFuelNavigator;
