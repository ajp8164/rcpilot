import BatteryEditorScreen from 'components/BatteryEditorScreen';
import EnumPickerScreen from 'components/EnumPickerScreen';
import NavContext from './NavContext';
import { NewBatteryNavigatorParamList } from 'types/navigation';
import NotesScreen from 'components/NotesScreen';
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'theme';

const NewBatteryStack = createNativeStackNavigator<NewBatteryNavigatorParamList>();

const NewBatteryNavigator = () => {
  const theme = useTheme();

  return (
    <NavContext.Provider value={{isModal: true}}>
      <NewBatteryStack.Navigator
      initialRouteName='NewBattery'
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
        <NewBatteryStack.Screen
          name='NewBattery'
          // @ts-expect-error
          component={BatteryEditorScreen}
          options={{
            title: '',
          }}
        />
        <NewBatteryStack.Screen
          name='Notes'
          component={NotesScreen}
          options={{
            title: 'Battery Notes',
          }}
        />
        <NewBatteryStack.Screen
          name='EnumPicker'
          component={EnumPickerScreen}
          options={{
            title: '',
          }}
        />
      </NewBatteryStack.Navigator>
    </NavContext.Provider>
  );
};

export default NewBatteryNavigator;
