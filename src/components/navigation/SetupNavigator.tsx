import AboutScreen from 'components/AboutScreen';
import AppSettingsScreen from 'components/AppSettingsScreen';
import ChecklistTemplatesScreen from 'components/ChecklistTemplatesScreen';
import ContentScreen from 'components/ContentScreen';
import EnumPickerScreen from 'components/EnumPickerScreen';
import EventStyleEditorScreen from 'components/EventStyleEditorScreen';
import EventStylesScreen from 'components/EventStylesScreen';
import FlightDetailsScreen from 'components/FlightDetailsScreen';
import FlightsScreen from 'components/FlightsScreen';
import ModelCategoriesScreen from 'components/ModelCategoriesScreen';
import ModelCategoryEditorScreen from 'components/ModelCategoryEditorScreen';
import ModelFuelEditorScreen from 'components/ModelFuelEditorScreen';
import ModelFuelsScreen from 'components/ModelFuelsScreen';
import ModelPropellerEditorScreen from 'components/ModelPropellerEditorScreen';
import ModelPropellersScreen from 'components/ModelPropellersScreen';
import NewEventStyleScreen from 'components/NewEventStyleScreen';
import NewModelCategoryScreen from 'components/NewModelCategoryScreen';
import NewModelFuelNavigator from 'components/navigation/NewModelFuelNavigator';
import NewModelPropellerNavigator from 'components/navigation/NewModelPropellerNavigator';
import NewPilotScreen from 'components/NewPilotScreen';
import NotesScreen from 'components/NotesScreen';
import PilotScreen from 'components/PilotScreen';
import PilotsScreen from 'components/PilotsScreen';
import PreferencesAudioScreen from 'components/PreferencesAudioScreen';
import PreferencesBasicsScreen from 'components/PreferencesBasicsScreen';
import PreferencesBatteriesScreen from 'components/PreferencesBatteriesScreen';
import PreferencesChimeCuesScreen from 'components/PreferencesChimeCuesScreen';
import PreferencesClickTrackScreen from 'components/PreferencesClickTrackScreen';
import PreferencesEventsScreen from 'components/PreferencesEventsScreen';
import PreferencesVoiceCuesScreen from 'components/PreferencesVoiceCuesScreen';
import React from 'react';
import { SetupNavigatorParamList } from 'types/navigation';
import SetupScreen from 'components/SetupScreen';
import UserAccountScreen from 'components/UserAccountScreen';
import UserProfileScreen from 'components/UserProfileScreen';
import { appConfig } from 'config';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'theme';

const SetupStack = createNativeStackNavigator<SetupNavigatorParamList>();

const SetupNavigator = () => {
  const theme = useTheme();

  return (
    <SetupStack.Navigator
      initialRouteName="Setup"
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
      <SetupStack.Screen
        name="Setup"
        component={SetupScreen}
        options={{
          title: 'Setup',
          headerLeft: () => null,
          headerLargeTitle: true,
        }}
      />
      <SetupStack.Screen
        name="Pilot"
        component={PilotScreen}
      />
      <SetupStack.Screen
        name="Pilots"
        component={PilotsScreen}
      />
      <SetupStack.Screen
        name="NewPilot"
        component={NewPilotScreen}
        options={{
          title: "Pilot's Name",
          presentation: 'modal',
        }}
      />
      <SetupStack.Screen
        name="Flights"
        component={FlightsScreen}
      />
      <SetupStack.Screen
        name="FlightDetails"
        component={FlightDetailsScreen}
        options={{
          title: 'Flight Details',
        }}
      />
      <SetupStack.Screen
        name="EventStyles"
        component={EventStylesScreen}
        options={{
          title: 'Styles',
        }}
      />
      <SetupStack.Screen
        name="EventStyleEditor"
        component={EventStyleEditorScreen}
        options={{
          title: 'Style Name',
        }}
      />
      <SetupStack.Screen
        name="NewEventStyle"
        component={NewEventStyleScreen}
        options={{
          title: 'Style Name',
          presentation: 'modal',
        }}
      />
      <SetupStack.Screen
        name="ModelCategories"
        component={ModelCategoriesScreen}
        options={{
          title: 'Categories',
        }}
      />
      <SetupStack.Screen
        name="ModelCategoryEditor"
        component={ModelCategoryEditorScreen}
        options={{
          title: 'Catgeory Name',
        }}
      />
      <SetupStack.Screen
        name="NewModelCategory"
        component={NewModelCategoryScreen}
        options={{
          title: 'Category Name',
          presentation: 'modal',
        }}
      />
      <SetupStack.Screen
        name="ModelFuels"
        component={ModelFuelsScreen}
        options={{
          title: 'Fuels',
        }}
      />
      <SetupStack.Screen
        name="NewModelFuelNavigator"
        component={NewModelFuelNavigator}
        options={{
          headerShown: false,
          presentation: 'modal',
        }}
      />
      <SetupStack.Screen
        name="ModelFuelEditor"
        component={ModelFuelEditorScreen}
        options={{
          title: 'Fuel',
        }}
      />
      <SetupStack.Screen
        name="ModelPropellers"
        component={ModelPropellersScreen}
        options={{
          title: 'Propellers',
        }}
      />
      <SetupStack.Screen
        name="ModelPropellerEditor"
        component={ModelPropellerEditorScreen}
        options={{
          title: 'Propeller',
        }}
      />
      <SetupStack.Screen
        name="NewModelPropellerNavigator"
        component={NewModelPropellerNavigator}
        options={{
          headerShown: false,
          presentation: 'modal',
        }}
      />
      <SetupStack.Screen
        name='Notes'
        component={NotesScreen}
        options={{
          title: '',
        }}
      />
      <SetupStack.Screen
        name="EnumPicker"
        component={EnumPickerScreen}
        options={{
          title: '',
          headerBackTitle: 'Flight',
        }}
      />
      <SetupStack.Screen
        name="ChecklistTemplates"
        component={ChecklistTemplatesScreen}
        options={{
          title: 'List Templates',
        }}
      />
      <SetupStack.Screen
        name="PreferencesBasics"
        component={PreferencesBasicsScreen}
        options={{
          title: 'Basics',
        }}
      />
      <SetupStack.Screen
        name="PreferencesEvents"
        component={PreferencesEventsScreen}
        options={{
          title: 'Events',
        }}
      />
      <SetupStack.Screen
        name="PreferencesBatteries"
        component={PreferencesBatteriesScreen}
        options={{
          title: 'Batteries',
        }}
      />
      <SetupStack.Screen
        name="PreferencesAudio"
        component={PreferencesAudioScreen}
        options={{
          title: 'Audio',
        }}
      />
      <SetupStack.Screen
        name="PreferencesChimeCues"
        component={PreferencesChimeCuesScreen}
        options={{
          title: 'Chime Cues',
        }}
      />
      <SetupStack.Screen
        name="PreferencesVoiceCues"
        component={PreferencesVoiceCuesScreen}
        options={{
          title: 'Voice Cues',
        }}
      />
      <SetupStack.Screen
        name="PreferencesClickTrack"
        component={PreferencesClickTrackScreen}
        options={{
          title: 'Click Track',
        }}
      />
      <SetupStack.Screen
        name="UserAccount"
        component={UserAccountScreen}
        options={{
          headerLargeTitle: true,
        }}
      />
      <SetupStack.Screen
        name="UserProfile"
        component={UserProfileScreen}
        options={{
          title: '',
        }}
      />
      <SetupStack.Screen
        name="AppSettings"
        component={AppSettingsScreen}
        options={{
          title: 'App Settings',
          headerLargeTitle: true,
        }}
      />
      <SetupStack.Screen
        name="Content"
        component={ContentScreen}
        options={{
          title: '',
          headerLargeTitle: true,
        }}
      />
      <SetupStack.Screen
        name="About"
        component={AboutScreen}
        options={{
          title: `About ${appConfig.appName}`,
          headerLargeTitle: true,
        }}
      />
    </SetupStack.Navigator>
  );
};

export default SetupNavigator;
