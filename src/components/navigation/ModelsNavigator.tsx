import EnumPickerScreen from 'components/EnumPickerScreen';
import FlightDetailsScreen from 'components/FlightDetailsScreen';
import FlightNavigator from 'components/navigation/FlightNavigator';
import FlightsScreen from 'components/FlightsScreen';
import ModelEditorScreen from 'components/ModelEditorScreen';
import ModelFiltersNavigator from 'components/navigation/ModelFiltersNavigator';
import { ModelHeader } from 'components/molecules/ModelHeader';
import ModelStatisticsScreen from 'components/ModelStatisticsScreen';
import { ModelsNavigatorParamList } from 'types/navigation';
import ModelsScreen from 'components/ModelsScreen';
import NewModelNavigator from 'components/navigation/NewModelNavigator';
import NotesScreen from 'components/NotesScreen';
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'theme';

const ModelsStack = createNativeStackNavigator<ModelsNavigatorParamList>();

const ModelsNavigator = () => {
  const theme = useTheme();

  return (
    <ModelsStack.Navigator
    initialRouteName='Models'
    screenOptions={{
      headerStyle: { backgroundColor: theme.colors.screenHeaderBackground },
      headerTitleStyle: { color: theme.colors.screenHeaderText },
      headerTintColor: theme.colors.screenHeaderBackButton,
    }}>
      <ModelsStack.Screen
        name='Models'
        component={ModelsScreen}
        initialParams={{}}
        options={({ route }) => ({
          title: route.params.listModels === 'inactive' ? 'Retired' : 'Models',
          headerLargeTitle: route.params.listModels ? false : true,
          headerLargeTitleShadowVisible: false,
          headerLargeStyle: { backgroundColor: theme.colors.viewBackground },
        })}
      />
      <ModelsStack.Screen
        name='ModelEditor'
        component={ModelEditorScreen}
        options={({ route }) => ({
          header: () => <ModelHeader modelId={route.params.modelId}/>,
        })}
      />
      <ModelsStack.Screen
        name='ModelStatistics'
        component={ModelStatisticsScreen}
        options={{
          title: 'Model Statistics',
        }}
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
        name="EnumPicker"
        component={EnumPickerScreen}
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
