import { TextStyle } from 'react-native';

import { NavigatorScreenParams } from '@react-navigation/core';
import { BatteryCellValuesEditorConfig } from 'components/BatteryCellValuesEditorScreen';
import { BatteryPickerInterface } from 'components/BatteryPickerScreen';
import { EnumPickerInterface } from 'components/EnumPickerScreen';
import { ModelPickerInterface } from 'components/ModelPickerScreen';
import { JChecklistAction } from 'realmdb/Checklist';
import { BatteryTemplate, ListBatteries } from 'types/battery';
import { ChecklistType, EventSequenceChecklistType } from 'types/checklist';
import { ContentView } from 'types/content';
import { EventOutcome } from 'types/event';
import { FilterType } from 'types/filter';
import { ListModels, ModelType } from 'types/model';

export enum StartupScreen {
  None = 'None',
  Home = 'Log',
  Welcome = 'Welcome',
}

// This type should be used when type checking a screen that appears in multiple navigators.
// Using this type avoids screen components having to import all the ..NavigatorParamList types
// instead of chosing one at random.
export type MultipleNavigatorParamList = {
  EnumPicker: EnumPickerInterface;
  BatteryPicker: BatteryPickerInterface;
  ModelPicker: ModelPickerInterface;
  NotesEditor: {
    title?: string;
    headerButtonStyle?: TextStyle;
    headerBackgroundColor?: string;
    text?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    extraData?: any;
    eventName: string;
  };
};

export type BatteriesNavigatorParamList = MultipleNavigatorParamList & {
  Batteries: {
    listBatteries?: ListBatteries;
  };
  Battery: {
    batteryId: string;
  };
  BatteryTemplates: undefined;
  BatteryCellValuesEditor: {
    config: BatteryCellValuesEditorConfig;
    packValue: number;
    cellValues: number[];
    sCells: number;
    pCells: number;
    eventName: string;
  };
  BatteryCycles: {
    batteryId: string;
  };
  BatteryCycleEditor: {
    batteryId: string;
    cycleNumber: number;
  };
  BatteryEditor: {
    batteryId: string;
    batteryTemplate?: BatteryTemplate;
  };
  BatteryFiltersNavigator: NavigatorScreenParams<BatteryFiltersNavigatorParamList>;
  BatteryCycleFiltersNavigator: NavigatorScreenParams<BatteryCycleFiltersNavigatorParamList>;
  BatteryPerformance: undefined;
  BatteryPerformanceComparisonPicker: undefined;
  EventFiltersNavigator: NavigatorScreenParams<EventFiltersNavigatorParamList>;
  NewBatteryNavigator: NavigatorScreenParams<NewBatteryNavigatorParamList>;
  NewBatteryCycleNavigator: NavigatorScreenParams<NewBatteryCycleNavigatorParamList>;
};

export type LogNavigatorParamList = MultipleNavigatorParamList & {
  Log: undefined;
  EventEditor: {
    eventId: string;
    modelType?: ModelType;
  };
  BatteryCycleEditor: {
    batteryId: string;
    cycleNumber: number;
  };
  LocationNavigator: NavigatorScreenParams<LocationNavigatorParamList>;
};

export type MainNavigatorParamList = {
  Startup: NavigatorScreenParams<StartupNavigatorParamList>;
  Tabs: NavigatorScreenParams<TabNavigatorParamList>;
};

export type ModelsNavigatorParamList = MultipleNavigatorParamList & {
  BatteryCycleEditor: {
    batteryId: string;
    cycleNumber: number;
  };
  ChecklistTemplatePicker: {
    eventName: string;
  };
  ChecklistEditor: {
    checklistTemplateId?: string;
    modelId?: string;
    modelChecklistRefId?: string;
  };
  ChecklistActionEditor: {
    checklistAction?: JChecklistAction;
    checklistType: ChecklistType;
    modelId?: string;
    eventName: string;
  };
  ChecklistActionHistory: {
    action: JChecklistAction;
    modelId: string;
  };
  Events: {
    filterType: FilterType;
    batteryId?: string;
    eventStyleId?: string;
    locationId?: string;
    modelId?: string;
    modelType?: ModelType;
    commanderId?: string;
    readOnly?: boolean;
  };

  EventEditor: {
    eventId: string;
    modelType?: ModelType;
  };
  EventFiltersNavigator: NavigatorScreenParams<EventFiltersNavigatorParamList>;
  EventOutcome: {
    eventOutcome: EventOutcome;
  };
  EventSequenceNavigator: NavigatorScreenParams<EventSequenceNavigatorParamList>;
  LocationNavigator: NavigatorScreenParams<LocationNavigatorParamList>;
  NewChecklistNavigator: NavigatorScreenParams<NewChecklistNavigatorParamList>;
  NewChecklistActionNavigator: NavigatorScreenParams<NewChecklistActionNavigatorParamList>;
  NewModelNavigator: NavigatorScreenParams<NewModelNavigatorParamList>;
  ModelChecklists: {
    modelId?: string;
  };
  ModelEditor: {
    modelId: string;
  };
  MaintenanceFiltersNavigator: NavigatorScreenParams<MaintenanceFiltersNavigatorParamList>;
  ModelStatistics: {
    modelId: string;
  };
  Models: {
    listModels?: ListModels;
  };
  ModelFiltersNavigator: NavigatorScreenParams<ModelFiltersNavigatorParamList>;
  Maintenance: {
    modelId: string;
  };
  MaintenanceHistory: {
    modelId: string;
  };
  MaintenanceAction: {
    modelId: string;
    checklistRefId: string;
    actionRefId: string;
  };
  MaintenanceHistoryEntry: {
    modelId: string;
    checklistRefId: string;
    actionRefId: string;
    historyRefId: string;
  };
};

export type EventFiltersNavigatorParamList = MultipleNavigatorParamList & {
  EventFilters: {
    filterType: FilterType;
    modelType?: ModelType;
    useGeneralFilter?: boolean;
  };
  EventFilterEditor: {
    filterId: string;
    filterType: FilterType;
    generalFilterName: string;
    modelType?: ModelType;
    requireFilterName?: boolean;
  };
};

export type MaintenanceFiltersNavigatorParamList = MultipleNavigatorParamList & {
  MaintenanceFilters: {
    filterType: FilterType;
    modelType?: ModelType;
    useGeneralFilter?: boolean;
  };
  MaintenanceFilterEditor: {
    filterId: string;
    filterType: FilterType;
    generalFilterName: string;
    modelType?: ModelType;
    requireFilterName?: boolean;
  };
};

export type ModelFiltersNavigatorParamList = MultipleNavigatorParamList & {
  ModelFilters: {
    filterType: FilterType;
    modelType?: ModelType;
    useGeneralFilter?: boolean;
  };
  ModelFilterEditor: {
    filterId: string;
    filterType: FilterType;
    generalFilterName: string;
    requireFilterName?: boolean;
  };
};

export type BatteryFiltersNavigatorParamList = MultipleNavigatorParamList & {
  BatteryFilters: {
    filterType: FilterType;
    modelType?: ModelType;
    useGeneralFilter?: boolean;
  };
  BatteryFilterEditor: {
    filterId: string;
    filterType: FilterType;
    generalFilterName: string;
    requireFilterName?: boolean;
  };
};

export type BatteryCycleFiltersNavigatorParamList = MultipleNavigatorParamList & {
  BatteryCycleFilters: {
    useGeneralFilter?: boolean;
  };
  BatteryCycleFilterEditor: {
    filterId: string;
    filterType: FilterType;
    requireFilterName?: boolean;
  };
};

export type ReportEventFiltersNavigatorParamList = MultipleNavigatorParamList & {
  ReportEventFilters: {
    filterType: FilterType;
    modelType?: ModelType;
    useGeneralFilter?: boolean;
  };
  ReportEventFilterEditor: {
    filterId: string;
    filterType: FilterType;
    generalFilterName: string;
    modelType?: ModelType;
    requireFilterName?: boolean;
  };
};

export type ReportMaintenanceFiltersNavigatorParamList = MultipleNavigatorParamList & {
  ReportMaintenanceFilters: {
    filterType: FilterType;
    modelType?: ModelType;
    useGeneralFilter?: boolean;
  };
  ReportMaintenanceFilterEditor: {
    filterId: string;
    filterType: FilterType;
    generalFilterName: string;
    modelType?: ModelType;
    requireFilterName?: boolean;
  };
};

export type ReportModelScanCodeFiltersNavigatorParamList = MultipleNavigatorParamList & {
  ReportModelScanCodeFilters: {
    filterType: FilterType;
    modelType?: ModelType;
    useGeneralFilter?: boolean;
  };
  ReportModelScanCodeFilterEditor: {
    filterId: string;
    filterType: FilterType;
    generalFilterName: string;
    modelType?: ModelType;
    requireFilterName?: boolean;
  };
};

export type ReportBatteryScanCodeFiltersNavigatorParamList = MultipleNavigatorParamList & {
  ReportBatteryScanCodeFilters: {
    filterType: FilterType;
    modelType?: ModelType;
    useGeneralFilter?: boolean;
  };
  ReportBatteryScanCodeFilterEditor: {
    filterId: string;
    filterType: FilterType;
    generalFilterName: string;
    modelType?: ModelType;
    requireFilterName?: boolean;
  };
};

export type NewBatteryNavigatorParamList = MultipleNavigatorParamList & {
  NewBattery: {
    batteryId?: string;
    batteryTemplate?: BatteryTemplate;
  };
};

export type NewBatteryCycleNavigatorParamList = MultipleNavigatorParamList & {
  NewBatteryCycle: {
    batteryIds: string[];
  };
  BatteryCellValuesEditor: {
    config: BatteryCellValuesEditorConfig;
    packValue: number;
    cellValues: number[];
    sCells: number;
    pCells: number;
    eventName: string;
  };
};

export type NewModelNavigatorParamList = MultipleNavigatorParamList & {
  NewModel: {
    modelId?: string;
  };
};

export type EventSequenceNavigatorParamList = MultipleNavigatorParamList & {
  EventSequenceNewEventEditor: undefined;
  EventSequenceBatteryPicker: {
    cancelable?: boolean;
  };
  EventSequenceChecklist: {
    cancelable?: boolean;
    checklistType: EventSequenceChecklistType;
  };
  EventSequenceChecklistItem: {
    checklistRefId: string;
    actionRefId: string;
  };
  EventSequenceTimer: {
    cancelable?: boolean;
  };
  BatteryCellValuesEditor: {
    config: BatteryCellValuesEditorConfig;
    packValue: number;
    cellValues: number[];
    sCells: number;
    pCells: number;
    eventName: string;
  };
  LocationNavigator: NavigatorScreenParams<LocationNavigatorParamList>;
};

export type LocationNavigatorParamList = MultipleNavigatorParamList & {
  Events: {
    filterType: FilterType;
    batteryId?: string;
    eventStyleId?: string;
    locationId?: string;
    modelId?: string;
    modelType?: ModelType;
    commanderId?: string;
    readOnly?: boolean;
  };
  LocationsMap: {
    enableLocationSelection?: boolean;
    eventName?: string;
    locationId?: string;
  };
};

export type NewModelFuelNavigatorParamList = MultipleNavigatorParamList & {
  NewModelFuel: undefined;
};

export type NewModelPropellerNavigatorParamList = MultipleNavigatorParamList & {
  NewModelPropeller: undefined;
};

export type NewChecklistNavigatorParamList = MultipleNavigatorParamList & {
  ChecklistActionEditor: {
    checklistAction?: JChecklistAction;
    checklistType: ChecklistType;
    modelId?: string;
    eventName: string;
  };
  NewChecklist: {
    checklistTemplateId?: string;
    modelId?: string;
    modelChecklistRefId?: string;
  };
};

export type NewChecklistActionNavigatorParamList = MultipleNavigatorParamList & {
  NewChecklistAction: {
    checklistAction?: JChecklistAction;
    checklistType: ChecklistType;
    modelId?: string;
    eventName: string;
  };
  ChecklistActionHistory: {
    action: JChecklistAction;
    modelId: string;
  };
};

export type SetupNavigatorParamList = MultipleNavigatorParamList & {
  About: undefined;
  AppSettings: undefined;
  BatteryCycleEditor: {
    batteryId: string;
    cycleNumber: number;
  };
  ChecklistActionEditor: {
    checklistAction?: JChecklistAction;
    checklistType: ChecklistType;
    modelId?: string;
    eventName: string;
  };
  ChecklistTemplates: undefined;
  ChecklistEditor: {
    checklistTemplateId?: string;
    modelId?: string;
    modelChecklistRefId?: string;
  };
  Content: {
    content: ContentView;
  };
  DatabaseInfo: undefined;
  DatabaseBackups: undefined;
  DatabaseReporting: undefined;
  DatabaseBackup: undefined;
  Events: {
    filterType: FilterType;
    batteryId?: string;
    eventStyleId?: string;
    locationId?: string;
    modelId?: string;
    modelType?: ModelType;
    commanderId?: string;
    readOnly?: boolean;
  };
  EventEditor: {
    eventId: string;
    modelType?: ModelType;
  };
  EventOutcome: {
    eventOutcome: EventOutcome;
  };
  LocationNavigator: NavigatorScreenParams<LocationNavigatorParamList>;
  Commander: {
    commanderId: string;
  };
  Commanders: undefined;
  CommanderNavigator: NavigatorScreenParams<CommanderNavigatorParamList>;
  PreferencesBasics: undefined;
  PreferencesEvents: undefined;
  PreferencesBatteries: undefined;
  PreferencesAudio: undefined;
  PreferencesChimeCues: undefined;
  PreferencesVoiceCues: undefined;
  PreferencesClickTrack: undefined;
  NewCommander: undefined;
  Setup: {
    subNav?: string;
  };
  ReportEventFiltersNavigator: NavigatorScreenParams<ReportEventFiltersNavigatorParamList>;
  ReportMaintenanceFiltersNavigator: NavigatorScreenParams<ReportMaintenanceFiltersNavigatorParamList>;
  ReportModelScanCodeFiltersNavigator: NavigatorScreenParams<ReportModelScanCodeFiltersNavigatorParamList>;
  ReportBatteryScanCodeFiltersNavigator: NavigatorScreenParams<ReportBatteryScanCodeFiltersNavigatorParamList>;
  EventStyles: undefined;
  EventStyleEditor: {
    eventStyleId: string;
  };
  ModelCategories: undefined;
  ModelCategoryEditor: {
    modelCategoryId: string;
  };
  ModelFuels: undefined;
  ModelFuelEditor: {
    modelFuelId: string;
  };
  ModelPropellers: undefined;
  ModelPropellerEditor: {
    modelPropellerId: string;
  };
  NewChecklistNavigator: NavigatorScreenParams<NewChecklistNavigatorParamList>;
  NewChecklistActionNavigator: NavigatorScreenParams<NewChecklistActionNavigatorParamList>;
  NewEventStyle: {
    eventStyleId?: string;
  };
  NewModelCategory: undefined;
  NewModelFuelNavigator: NavigatorScreenParams<NewModelFuelNavigatorParamList>;
  NewModelPropellerNavigator: NavigatorScreenParams<NewModelPropellerNavigatorParamList>;
  NewReportNavigator: NavigatorScreenParams<NewReportNavigatorParamList>;
  ReportEventsMaintenanceEditor: {
    reportId?: string;
  };
  ReportScanCodesEditor: {
    reportId?: string;
  };
  ReportViewerNavigator: NavigatorScreenParams<ReportViewerNavigatorParamList>;
  UserAccount: undefined;
  UserProfileEditor: undefined;
  WebServerAccess: undefined;
};

export type CommanderNavigatorParamList = MultipleNavigatorParamList & {
};

export type NewReportNavigatorParamList = {
  ReportEventFiltersNavigator: NavigatorScreenParams<ReportEventFiltersNavigatorParamList>;
  ReportMaintenanceFiltersNavigator: NavigatorScreenParams<ReportMaintenanceFiltersNavigatorParamList>;
  ReportModelScanCodeFiltersNavigator: NavigatorScreenParams<ReportModelScanCodeFiltersNavigatorParamList>;
  ReportBatteryScanCodeFiltersNavigator: NavigatorScreenParams<ReportBatteryScanCodeFiltersNavigatorParamList>;
  ReportEventsMaintenanceEditor: {
    reportId?: string;
  };
  ReportScanCodesEditor: {
    reportId?: string;
  };
};

export type ReportViewerNavigatorParamList = {
  ReportEventsMaintenanceViewer: {
    reportId: string;
  };
  ReportScanCodesViewer: {
    reportId: string;
  };
};

export type ScanNavigatorParamList = {
  Scan: undefined;
};

export type StartupNavigatorParamList = {
  Welcome: undefined;
};

export type TabNavigatorParamList = {
  BatteriesTab: undefined;
  LogTab: undefined;
  ModelsTab: undefined;
  ScanTab: undefined;
  SetupTab: {
    screen: string;
    params: object;
  };
};
