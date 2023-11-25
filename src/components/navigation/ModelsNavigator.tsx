import FlightDetailsScreen from 'components/FlightDetailsScreen';
import FlightNavigator from 'components/navigation/FlightNavigator';
import FlightOutcomeScreen from 'components/FlightOutcomeScreen';
import FlightsScreen from 'components/FlightsScreen';
import ModelFiltersNavigator from 'components/navigation/ModelFiltersNavigator';
import ModelScreen from 'components/ModelScreen';
import { ModelsNavigatorParamList } from 'types/navigation';
import ModelsScreen from 'components/ModelsScreen';
import NewModelNavigator from 'components/navigation/NewModelNavigator';
import NotesScreen from 'components/NotesScreen';
import React from 'react';
import ValuePickerScreen from 'components/ValuePickerScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'theme';

const ModelsStack = createNativeStackNavigator<ModelsNavigatorParamList>();

const ModelsNavigator = () => {
  const theme = useTheme();

  return (
    <ModelsStack.Navigator
    initialRouteName='Models'
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
      <ModelsStack.Screen
        name='Models'
        component={ModelsScreen}
        options={{
          title: 'Models',
          headerLargeTitle: true,
        }}
      />
      <ModelsStack.Screen
        name='Model'
        component={ModelScreen}
        />
      <ModelsStack.Screen
        name='ModelFiltersNavigator'
        component={ModelFiltersNavigator}
        options={{
          headerShown: false,
          presentation: 'modal'
        }}
      />
      <ModelsStack.Screen
        name='FlightNavigator'
        component={FlightNavigator}
        options={{
          headerShown: false,
          presentation: 'fullScreenModal'
        }}
      />
      <ModelsStack.Screen
        name='Notes'
        component={NotesScreen}
        options={{
          title: 'Model Notes',
        }}
      />
      <ModelsStack.Screen
        name="Flights"
        component={FlightsScreen}
      />
      <ModelsStack.Screen
        name="FlightDetails"
        component={FlightDetailsScreen}
        options={{
          title: 'Flight Details',
        }}
      />
      <ModelsStack.Screen
        name="FlightOutcome"
        component={FlightOutcomeScreen}
        options={{
          title: 'Flight Outcome',
          headerBackTitle: 'Flight'
        }}
      />
      <ModelsStack.Screen
        name="ValuePicker"
        component={ValuePickerScreen}
        options={{
          title: '',
        }}
      />
      <ModelsStack.Screen
        name='NewModelNavigator'
        component={NewModelNavigator}
        options={{
          headerShown: false,
          presentation: 'modal'
        }}
      />
    </ModelsStack.Navigator>
  );
};

export default ModelsNavigator;
