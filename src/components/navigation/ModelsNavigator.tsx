import BatteryCycleEditorScreen from 'components/BatteryCycleEditorScreen';
import BatteryPickerScreen from 'components/BatteryPickerScreen';
import ChecklistActionEditorScreen from 'components/ChecklistActionEditorScreen';
import ChecklistActionHistoryScreen from 'components/ChecklistActionHistoryScreen';
import ChecklistEditorScreen from 'components/ChecklistEditorScreen';
import ChecklistTemplatePickerScreen from 'components/ChecklistTemplatePickerScreen';
import EnumPickerScreen from 'components/EnumPickerScreen';
import EventEditorScreen from 'components/EventEditorScreen';
import EventFiltersNavigator from 'components/navigation/EventFiltersNavigator';
import EventSequenceNavigator from 'components/navigation/EventSequenceNavigator';
import EventsScreen from 'components/EventsScreen';
import ModelChecklistsScreen from 'components/ModelChecklistsScreen';
import ModelEditorScreen from 'components/ModelEditorScreen';
import ModelFiltersNavigator from 'components/navigation/ModelFiltersNavigator';
import { ModelHeader } from 'components/molecules/ModelHeader';
import ModelMaintenanceActionScreen from 'components/ModelMaintenanceActionScreen';
import ModelMaintenanceFiltersNavigator from 'components/navigation/ModelMaintenanceFiltersNavigator';
import ModelMaintenanceHistoryEntryScreen from 'components/ModelMaintenanceHistoryEntryScreen';
import ModelMaintenanceHistoryScreen from 'components/ModelMaintenanceHistoryScreen';
import ModelMaintenanceScreen from 'components/ModelMaintenanceScreen';
import ModelStatisticsScreen from 'components/ModelStatisticsScreen';
import { ModelsNavigatorParamList } from 'types/navigation';
import ModelsScreen from 'components/ModelsScreen';
import NewChecklistActionNavigator from 'components/navigation/NewChecklistActionNavigator';
import NewChecklistNavigator from 'components/navigation/NewChecklistNavigator';
import NewModelNavigator from 'components/navigation/NewModelNavigator';
import NotesEditorScreen from 'components/NotesEditorScreen';
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { eventKind } from 'lib/modelEvent';
import { useTheme } from 'theme';

const ModelsStack = createNativeStackNavigator<ModelsNavigatorParamList>();

const ModelsNavigator = () => {
  const theme = useTheme();

  return (
    <ModelsStack.Navigator
    initialRouteName='Models'
    screenOptions={{
      headerStyle: { backgroundColor: theme.colors.screenHeaderBackground },
      headerTitleStyle: { color: theme.colors.screenHeaderTitle },
      headerTintColor: theme.colors.screenHeaderButtonText,
    }}>
      <ModelsStack.Screen
        name='Models'
        component={ModelsScreen}
        initialParams={{listModels: 'all'}}
        options={({ route }) => ({
          title: route.params.listModels === 'retired' ? 'Retired' : 'Models',
          headerLargeTitle: route.params.listModels === 'all' ? true : false,
          headerLargeTitleShadowVisible: false,
          headerLargeStyle: { backgroundColor: theme.colors.viewBackground },
        })}
      />
      <ModelsStack.Screen
        name='ModelEditor'
        component={ModelEditorScreen}
        options={({ route }) => ({
          header: () => <ModelHeader modelId={route.params.modelId}/>,
          title: 'Model',
        })}
      />
      <ModelsStack.Screen
        name='BatteryCycleEditor'
        component={BatteryCycleEditorScreen}
        options={{
          title: 'Cycle Details',
        }}
      />
      <ModelsStack.Screen
        name="BatteryPicker"
        component={BatteryPickerScreen}
        options={{
          title: '',
          headerBackTitle: '',
        }}
      />
      <ModelsStack.Screen
        name="ChecklistTemplatePicker"
        component={ChecklistTemplatePickerScreen}
        options={{
          title: 'Checklist Templates',
          presentation: 'modal',
        }}
      />
      <ModelsStack.Screen
        name="ChecklistEditor"
        component={ChecklistEditorScreen}
        options={{
          title: 'Checklist',
        }}
      />
      <ModelsStack.Screen
        name="ChecklistActionEditor"
        component={ChecklistActionEditorScreen}
        options={{
          title: 'Action',
        }}
      />
      <ModelsStack.Screen
        name="ChecklistActionHistory"
        component={ChecklistActionHistoryScreen}
        options={{
          title: 'Action Log',
        }}
      />
      <ModelsStack.Screen
        name="NewChecklistActionNavigator"
        component={NewChecklistActionNavigator}
        options={{
          headerShown: false,
          presentation: 'fullScreenModal',
        }}
      />
      <ModelsStack.Screen
        name="NewChecklistNavigator"
        component={NewChecklistNavigator}
        options={{
          headerShown: false,
          presentation: 'fullScreenModal',
        }}
      />
      <ModelsStack.Screen
        name='ModelStatistics'
        component={ModelStatisticsScreen}
        options={{
          title: 'Model Statistics',
        }}
      />
      <ModelsStack.Screen
        name="ModelMaintenance"
        component={ModelMaintenanceScreen}
        options={{
          title: 'Maintenance',
        }}
      />
      <ModelsStack.Screen
        name="ModelMaintenanceHistory"
        component={ModelMaintenanceHistoryScreen}
        options={{
          title: 'Maintenance Log',
        }}
      />
      <ModelsStack.Screen
        name="ModelMaintenanceHistoryEntry"
        component={ModelMaintenanceHistoryEntryScreen}
        options={{
          title: 'Action',
          headerBackTitle: 'Log',
        }}
      />
      <ModelsStack.Screen
        name="ModelMaintenanceAction"
        component={ModelMaintenanceActionScreen}
        options={{
          title: 'Action',
        }}
      />
      <ModelsStack.Screen
        name='ModelMaintenanceFiltersNavigator'
        component={ModelMaintenanceFiltersNavigator}
        options={{
          headerShown: false,
          presentation: 'modal',
        }}
      />
      <ModelsStack.Screen
        name='ModelFiltersNavigator'
        component={ModelFiltersNavigator}
        options={{
          headerShown: false,
          presentation: 'modal',
        }}
      />
      <ModelsStack.Screen
        name='EventFiltersNavigator'
        component={EventFiltersNavigator}
        options={{
          headerShown: false,
          presentation: 'modal',
        }}
      />
      <ModelsStack.Screen
        name='EventSequenceNavigator'
        component={EventSequenceNavigator}
        options={{
          headerShown: false,
          presentation: 'fullScreenModal',
        }}
      />
      <ModelsStack.Screen
        name='NotesEditor'
        component={NotesEditorScreen}
        options={{
          title: 'Model Notes',
        }}
      />
      <ModelsStack.Screen
        name="Events"
        component={EventsScreen}
        options={({ route }) => ({
          title: `${eventKind(route.params.modelType).name} Log`,
        })}
      />
      <ModelsStack.Screen
        name="EventEditor"
        component={EventEditorScreen}
        options={({ route }) => ({
          headerTitle: `${eventKind(route.params.modelType).name} Details`,
        })}
      />
      <ModelsStack.Screen
        name='ModelChecklists'
        component={ModelChecklistsScreen}
        options={{
          title: 'Checklists',
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
