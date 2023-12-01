import EnumPickerScreen from 'components/EnumPickerScreen';
import NavContext from './NavContext';
import { NewChecklistTemplateNavigatorParamList } from 'types/navigation';
import NewChecklistTemplateScreen from 'components/NewChecklistTemplateScreen';
import NotesScreen from 'components/NotesScreen';
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'theme';

const NewChecklistTemplateStack = createNativeStackNavigator<NewChecklistTemplateNavigatorParamList>();

const NewChecklistTemplateNavigator = () => {
  const theme = useTheme();

  return (
    <NavContext.Provider value={{isModal: true}}>
      <NewChecklistTemplateStack.Navigator
      initialRouteName='NewChecklistTemplate'
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
        <NewChecklistTemplateStack.Screen
          name="NewChecklistTemplate"
          component={NewChecklistTemplateScreen}
          options={{
            title: 'New Template',
            presentation: 'modal',
          }}
        />
        <NewChecklistTemplateStack.Screen
          name='EnumPicker'
          component={EnumPickerScreen}
          options={{
            title: '',
            headerBackTitle: '',
          }}
        />
        <NewChecklistTemplateStack.Screen
          name='Notes'
          component={NotesScreen}
          options={{
            title: 'Action Notes',
          }}
        />
      </NewChecklistTemplateStack.Navigator>
    </NavContext.Provider>
  );
};

export default NewChecklistTemplateNavigator;
