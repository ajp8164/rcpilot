import { BatteryTemplate, ListBatteries } from 'types/battery';
import { ChecklistType, EventSequenceChecklistType } from 'types/checklist';
import { ListModels, ModelType } from 'types/model';

import { BatteryCellValuesEditorConfig } from 'components/BatteryCellValuesEditorScreen';
import { BatteryPickerInterface } from 'components/BatteryPickerScreen';
import { ContentView } from 'types/content';
import { EnumPickerInterface } from 'components/EnumPickerScreen';
import { EventOutcome } from 'types/event';
import { FilterType } from 'types/filter';
import { JChecklistAction } from 'realmdb/Checklist';
import { ModelPickerInterface } from 'components/ModelPickerScreen';
import { NavigatorScreenParams } from '@react-navigation/core';
import { TextStyle } from 'react-native';
import { UserProfile } from 'types/user';

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
    text?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    extraData?: any;
    eventName: string;
  };
};

export type BatteriesNavigatorParamList = {
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
  BatteryPicker: BatteryPickerInterface;
  EnumPicker: EnumPickerInterface;
  EventFiltersNavigator: NavigatorScreenParams<EventFiltersNavigatorParamList>;
  NewBatteryNavigator: NavigatorScreenParams<NewBatteryNavigatorParamList>;
  NewBatteryCycleNavigator: NavigatorScreenParams<NewBatteryCycleNavigatorParamList>;
  NotesEditor: {
    title?: string;
    headerButtonStyle?: TextStyle;
    text?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    extraData?: any;
    eventName: string;
  };
};

export type LogNavigatorParamList = {
  Log: undefined;
  EventEditor: {
    eventId: string;
    modelType: ModelType;
  };
  BatteryCycleEditor: {
    batteryId: string;
    cycleNumber: number;
  };
};

export type MainNavigatorParamList = {
  Startup: NavigatorScreenParams<StartupNavigatorParamList>;
  Tabs: NavigatorScreenParams<TabNavigatorParamList>;
};

export type ModelsNavigatorParamList = {
  BatteryCycleEditor: {
    batteryId: string;
    cycleNumber: number;
  };
  BatteryPicker: BatteryPickerInterface;
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
  EnumPicker: EnumPickerInterface;
  Events: {
    filterType: FilterType;
    batteryId?: string;
    modelId?: string;
    modelType?: ModelType;
    pilotId?: string;
  };
  EventEditor: {
    eventId: string;
    modelType: ModelType;
  };
  EventFiltersNavigator: NavigatorScreenParams<EventFiltersNavigatorParamList>;
  EventOutcome: {
    eventOutcome: EventOutcome;
  };
  EventSequenceNavigator: NavigatorScreenParams<EventSequenceNavigatorParamList>;
  LocationDetails: {
    locationId: string;
  };
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
  NotesEditor: {
    title?: string;
    headerButtonStyle?: TextStyle;
    text?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    extraData?: any;
    eventName: string;
  };
};

export type EventFiltersNavigatorParamList = {
  EnumPicker: EnumPickerInterface;
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
  NotesEditor: {
    title?: string;
    headerButtonStyle?: TextStyle;
    text?: string;
    eventName: string;
  };
};

export type MaintenanceFiltersNavigatorParamList = {
  EnumPicker: EnumPickerInterface;
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
  NotesEditor: {
    title?: string;
    headerButtonStyle?: TextStyle;
    text?: string;
    eventName: string;
  };
};

export type ModelFiltersNavigatorParamList = {
  EnumPicker: EnumPickerInterface;
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
  NotesEditor: {
    title?: string;
    headerButtonStyle?: TextStyle;
    text?: string;
    eventName: string;
  };
};

export type BatteryFiltersNavigatorParamList = {
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
  EnumPicker: EnumPickerInterface;
};

export type BatteryCycleFiltersNavigatorParamList = {
  BatteryCycleFilters: {
    useGeneralFilter?: boolean;
  };
  BatteryCycleFilterEditor: {
    filterId: string;
    filterType: FilterType;
    requireFilterName?: boolean;
  };
  EnumPicker: EnumPickerInterface;
};

export type ReportEventFiltersNavigatorParamList = {
  EnumPicker: EnumPickerInterface;
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
  NotesEditor: {
    title?: string;
    headerButtonStyle?: TextStyle;
    text?: string;
    eventName: string;
  };
};

export type ReportMaintenanceFiltersNavigatorParamList = {
  EnumPicker: EnumPickerInterface;
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
  NotesEditor: {
    title?: string;
    headerButtonStyle?: TextStyle;
    text?: string;
    eventName: string;
  };
};

export type ReportModelScanCodeFiltersNavigatorParamList = {
  EnumPicker: EnumPickerInterface;
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
  NotesEditor: {
    title?: string;
    headerButtonStyle?: TextStyle;
    text?: string;
    eventName: string;
  };
};

export type ReportBatteryScanCodeFiltersNavigatorParamList = {
  EnumPicker: EnumPickerInterface;
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
  NotesEditor: {
    title?: string;
    headerButtonStyle?: TextStyle;
    text?: string;
    eventName: string;
  };
};

export type NewBatteryNavigatorParamList = {
  EnumPicker: EnumPickerInterface;
  NewBattery: {
    batteryId?: string;
    batteryTemplate?: BatteryTemplate;
  };
  NotesEditor: {
    title?: string;
    headerButtonStyle?: TextStyle;
    text?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    extraData?: any;
    eventName: string;
  };
};

export type NewBatteryCycleNavigatorParamList = {
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
  NotesEditor: {
    title?: string;
    headerButtonStyle?: TextStyle;
    text?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    extraData?: any;
    eventName: string;
  };
};

export type NewModelNavigatorParamList = {
  EnumPicker: EnumPickerInterface;
  NewModel: {
    modelId?: string;
  };
  NotesEditor: {
    title?: string;
    headerButtonStyle?: TextStyle;
    text?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    extraData?: any;
    eventName: string;
  };
};

export type EventSequenceNavigatorParamList = {
  EnumPicker: EnumPickerInterface;
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
  NotesEditor: {
    title?: string;
    headerButtonStyle?: TextStyle;
    text?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    extraData?: any;
    eventName: string;
  };
};

export type LocationNavigatorParamList = {
  Locations: undefined;
  LocationDetails: {
    locationId: string;
  };
  NotesEditor: {
    title?: string;
    headerButtonStyle?: TextStyle;
    text?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    extraData?: any;
    eventName: string;
  };
};

export type NewModelFuelNavigatorParamList = {
  NewModelFuel: undefined;
  NotesEditor: {
    title?: string;
    headerButtonStyle?: TextStyle;
    text?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    extraData?: any;
    eventName: string;
  };
};

export type NewModelPropellerNavigatorParamList = {
  EnumPicker: EnumPickerInterface;
  NewModelPropeller: undefined;
  NotesEditor: {
    title?: string;
    headerButtonStyle?: TextStyle;
    text?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    extraData?: any;
    eventName: string;
  };
};

export type NewChecklistNavigatorParamList = {
  ChecklistActionEditor: {
    checklistAction?: JChecklistAction;
    checklistType: ChecklistType;
    modelId?: string;
    eventName: string;
  };
  EnumPicker: EnumPickerInterface;
  NewChecklist: {
    checklistTemplateId?: string;
    modelId?: string;
    modelChecklistRefId?: string;
  };
  NotesEditor: {
    title?: string;
    headerButtonStyle?: TextStyle;
    text?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    extraData?: any;
    eventName: string;
  };
};

export type NewChecklistActionNavigatorParamList = {
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
  NotesEditor: {
    title?: string;
    headerButtonStyle?: TextStyle;
    text?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    extraData?: any;
    eventName: string;
  };
};

export type SetupNavigatorParamList = {
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
  DropboxAccess: undefined;
  DatabaseReporting: undefined;
  EnumPicker: EnumPickerInterface;
  Events: {
    filterType: FilterType;
    batteryId?: string;
    modelId?: string;
    modelType?: ModelType;
    pilotId?: string;
  };
  EventEditor: {
    eventId: string;
    modelType: ModelType;
  };
  EventOutcome: {
    eventOutcome: EventOutcome;
  };
  LocationNavigator: NavigatorScreenParams<LocationNavigatorParamList>;
  Pilot: {
    pilotId: string;
  };
  Pilots: undefined;
  PilotNavigator: NavigatorScreenParams<PilotNavigatorParamList>;
  PreferencesBasics: undefined;
  PreferencesEvents: undefined;
  PreferencesBatteries: undefined;
  PreferencesAudio: undefined;
  PreferencesChimeCues: undefined;
  PreferencesVoiceCues: undefined;
  PreferencesClickTrack: undefined;
  NewPilot: undefined;
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
  Locations: undefined;
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
  NotesEditor: {
    title?: string;
    headerButtonStyle?: TextStyle;
    text?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    extraData?: any;
    eventName: string;
  };
  ReportEventsMaintenanceEditor: {
    reportId?: string;
  };
  ReportScanCodesEditor: {
    reportId?: string;
  };
  ReportViewerNavigator: NavigatorScreenParams<ReportViewerNavigatorParamList>;
  UserAccount: undefined;
  UserProfile: {
    userProfile: UserProfile;
  };
  WebServerAccess: undefined;
};

export type PilotNavigatorParamList = {
  ModelPicker: ModelPickerInterface;
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
