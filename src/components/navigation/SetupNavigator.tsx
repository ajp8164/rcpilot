import AboutScreen from 'components/AboutScreen';
import AppSettingsScreen from 'components/AppSettingsScreen';
import BatteryCycleEditorScreen from 'components/BatteryCycleEditorScreen';
import ChecklistActionEditorScreen from 'components/ChecklistActionEditorScreen';
import ChecklistEditorScreen from 'components/ChecklistEditorScreen';
import ChecklistTemplatesScreen from 'components/ChecklistTemplatesScreen';
import ContentScreen from 'components/ContentScreen';
import DatabaseInfoScreen from 'components/DatabaseInfoScreen';
import DatabaseReportingScreen from 'components/DatabaseReportingScreen';
import DatabaseBackupScreen from 'components/DatabaseBackupScreen';
import EnumPickerScreen from 'components/EnumPickerScreen';
import EventEditorScreen from 'components/EventEditorScreen';
import EventStyleEditorScreen from 'components/EventStyleEditorScreen';
import EventStylesScreen from 'components/EventStylesScreen';
import EventsScreen from 'components/EventsScreen';
import LocationNavigator from 'components/navigation/LocationNavigator';
import ModelCategoriesScreen from 'components/ModelCategoriesScreen';
import ModelCategoryEditorScreen from 'components/ModelCategoryEditorScreen';
import ModelFuelEditorScreen from 'components/ModelFuelEditorScreen';
import ModelFuelsScreen from 'components/ModelFuelsScreen';
import ModelPropellerEditorScreen from 'components/ModelPropellerEditorScreen';
import ModelPropellersScreen from 'components/ModelPropellersScreen';
import NewChecklistActionNavigator from 'components/navigation/NewChecklistActionNavigator';
import NewChecklistNavigator from 'components/navigation/NewChecklistNavigator';
import NewModelFuelNavigator from 'components/navigation/NewModelFuelNavigator';
import NewModelPropellerNavigator from 'components/navigation/NewModelPropellerNavigator';
import NewPilotScreen from 'components/NewPilotScreen';
import NewReportNavigator from 'components/navigation/NewReportNavigator';
import NotesEditorScreen from 'components/NotesEditorScreen';
import PilotNavigator from 'components/navigation/PilotNavigator';
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
import ReportBatteryScanCodeFiltersNavigator from 'components/navigation/ReportBatteryScanCodeFiltersNavigator';
import ReportEventFiltersNavigator from 'components/navigation/ReportEventFiltersNavigator';
import ReportEventsMaintenaceEditorScreen from 'components/ReportEventsMaintenaceEditorScreen';
import ReportMaintenanceFiltersNavigator from 'components/navigation/ReportMaintenanceFiltersNavigator';
import ReportModelScanCodeFiltersNavigator from 'components/navigation/ReportModelScanCodeFiltersNavigator';
import ReportScanCodesEditorScreen from 'components/ReportScanCodesEditorScreen';
import ReportViewerNavigator from 'components/navigation/ReportViewerNavigator';
import { SetupNavigatorParamList } from 'types/navigation';
import SetupScreen from 'components/SetupScreen';
import UserAccountScreen from 'components/UserAccountScreen';
import UserProfileScreen from 'components/UserProfileScreen';
import WebServerAccessScreen from 'components/WebServerAccessScreen';
import { appConfig } from 'config';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'theme';
import DatabaseBackupsScreen from 'components/DatabaseBackupsScreen';

const SetupStack = createNativeStackNavigator<SetupNavigatorParamList>();

const SetupNavigator = () => {
  const theme = useTheme();

  return (
    <SetupStack.Navigator
      initialRouteName="Setup"
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.screenHeaderBackground },
        headerTitleStyle: { color: theme.colors.screenHeaderTitle },
        headerTintColor: theme.colors.screenHeaderButtonText,
      }}>
      <SetupStack.Screen
        name="Setup"
        component={SetupScreen}
        options={{
          title: 'Setup',
          headerLeft: () => null,
          headerLargeTitle: true,
          headerLargeTitleShadowVisible: false,
          headerLargeStyle: { backgroundColor: theme.colors.viewBackground },
        }}
      />
      <SetupStack.Screen
        name="Pilot"
        component={PilotScreen}
        options={{
          title: '',
        }}
      />
      <SetupStack.Screen name="Pilots" component={PilotsScreen} />
      <SetupStack.Screen
        name="NewPilot"
        component={NewPilotScreen}
        options={{
          title: "Pilot's Name",
          presentation: 'modal',
        }}
      />
      <SetupStack.Screen
        name="PilotNavigator"
        component={PilotNavigator}
        options={{
          headerShown: false,
          presentation: 'modal',
        }}
      />
      <SetupStack.Screen name="Events" component={EventsScreen} />
      <SetupStack.Screen
        name="EventEditor"
        component={EventEditorScreen}
        options={{
          title: 'Event Details',
        }}
      />
      <SetupStack.Screen
        name="BatteryCycleEditor"
        component={BatteryCycleEditorScreen}
        options={{
          title: 'Cycle Details',
        }}
      />
      <SetupStack.Screen
        name="LocationNavigator"
        component={LocationNavigator}
        options={{
          headerShown: false,
          presentation: 'fullScreenModal',
        }}
      />
      <SetupStack.Screen
        name="EventStyles"
        component={EventStylesScreen}
        options={{
          title: 'Event Styles',
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
        component={EventStyleEditorScreen}
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
        component={ModelCategoryEditorScreen}
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
        name="NewReportNavigator"
        component={NewReportNavigator}
        options={{
          headerShown: false,
          presentation: 'fullScreenModal',
        }}
      />
      <SetupStack.Screen
        name="ReportViewerNavigator"
        component={ReportViewerNavigator}
        options={{
          headerShown: false,
          presentation: 'modal',
        }}
      />
      <SetupStack.Screen
        name="NotesEditor"
        component={NotesEditorScreen}
        options={{
          title: '',
        }}
      />
      <SetupStack.Screen
        name="EnumPicker"
        component={EnumPickerScreen}
        options={{
          title: '',
          headerBackTitle: '',
        }}
      />
      <SetupStack.Screen
        name="ChecklistActionEditor"
        component={ChecklistActionEditorScreen}
        options={{
          title: 'Action',
        }}
      />
      <SetupStack.Screen
        name="NewChecklistActionNavigator"
        component={NewChecklistActionNavigator}
        options={{
          headerShown: false,
          presentation: 'fullScreenModal',
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
        name="ChecklistEditor"
        component={ChecklistEditorScreen}
        options={{
          title: 'Template',
          headerBackTitle: 'Templates',
        }}
      />
      <SetupStack.Screen
        name="NewChecklistNavigator"
        component={NewChecklistNavigator}
        options={{
          headerShown: false,
          presentation: 'fullScreenModal',
        }}
      />
      <SetupStack.Screen
        name="DatabaseInfo"
        component={DatabaseInfoScreen}
        options={{
          title: 'Database',
        }}
      />
      <SetupStack.Screen
        name="DatabaseBackup"
        component={DatabaseBackupScreen}
        options={{
          title: 'Backup & Export',
        }}
      />
      <SetupStack.Screen
        name="DatabaseBackups"
        component={DatabaseBackupsScreen}
        options={{
          title: 'Database Backups',
          headerBackTitle: 'Backup',
        }}
      />
      <SetupStack.Screen
        name="WebServerAccess"
        component={WebServerAccessScreen}
        options={{
          title: 'Web Server',
          presentation: 'modal',
        }}
      />
      <SetupStack.Screen
        name="DatabaseReporting"
        component={DatabaseReportingScreen}
        options={{
          title: 'Reporting',
        }}
      />
      <SetupStack.Screen
        name="ReportEventsMaintenanceEditor"
        component={ReportEventsMaintenaceEditorScreen}
        options={{
          title: 'Log Report',
        }}
      />
      <SetupStack.Screen
        name="ReportScanCodesEditor"
        component={ReportScanCodesEditorScreen}
        options={{
          title: 'QR Code Report',
        }}
      />
      <SetupStack.Screen
        name="ReportEventFiltersNavigator"
        component={ReportEventFiltersNavigator}
        options={{
          headerShown: false,
          presentation: 'modal',
        }}
      />
      <SetupStack.Screen
        name="ReportBatteryScanCodeFiltersNavigator"
        component={ReportBatteryScanCodeFiltersNavigator}
        options={{
          headerShown: false,
          presentation: 'modal',
        }}
      />
      <SetupStack.Screen
        name="ReportModelScanCodeFiltersNavigator"
        component={ReportModelScanCodeFiltersNavigator}
        options={{
          headerShown: false,
          presentation: 'modal',
        }}
      />
      <SetupStack.Screen
        name="ReportMaintenanceFiltersNavigator"
        component={ReportMaintenanceFiltersNavigator}
        options={{
          headerShown: false,
          presentation: 'modal',
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
          title: 'My Account',
          headerLargeTitle: true,
          headerLargeTitleShadowVisible: false,
          headerLargeStyle: { backgroundColor: theme.colors.viewBackground },
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
          headerLargeTitleShadowVisible: false,
          headerLargeStyle: { backgroundColor: theme.colors.viewBackground },
        }}
      />
      <SetupStack.Screen
        name="Content"
        component={ContentScreen}
        options={{
          title: '',
          headerLargeTitle: true,
          headerLargeTitleShadowVisible: false,
          headerLargeStyle: { backgroundColor: theme.colors.viewBackground },
        }}
      />
      <SetupStack.Screen
        name="About"
        component={AboutScreen}
        options={{
          title: `About ${appConfig.appName}`,
          headerLargeTitle: true,
          headerLargeTitleShadowVisible: false,
          headerLargeStyle: { backgroundColor: theme.colors.viewBackground },
        }}
      />
    </SetupStack.Navigator>
  );
};

export default SetupNavigator;
