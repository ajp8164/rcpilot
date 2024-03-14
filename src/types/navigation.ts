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
    extraData?: any;
    eventName: string;
  };
};

export type BatteriesNavigatorParamList = {
  Batteries: {
    listBatteries?: ListBatteries;
  },
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
  EnumPicker: EnumPickerInterface;
  EventFiltersNavigator: NavigatorScreenParams<EventFiltersNavigatorParamList>;
  NewBatteryNavigator: NavigatorScreenParams<NewBatteryNavigatorParamList>;
  NewBatteryCycleNavigator: NavigatorScreenParams<NewBatteryCycleNavigatorParamList>;
  NotesEditor: {
    title?: string;
    headerButtonStyle?: TextStyle;
    text?: string;
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
    modelId: string;
    modelType?: ModelType;
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
  ModelMaintenanceFiltersNavigator: NavigatorScreenParams<ModelMaintenanceFiltersNavigatorParamList>;
  ModelStatistics: {
    modelId: string;
  };
  Models: {
    listModels?: ListModels;
  };
  ModelFiltersNavigator: NavigatorScreenParams<ModelFiltersNavigatorParamList>;
  ModelMaintenance: {
    modelId: string;
  };
  ModelMaintenanceHistory: {
    modelId: string;
  };
  ModelMaintenanceAction: {
    modelId: string;
    checklistRefId: string;
    actionRefId: string;
  };
  ModelMaintenanceHistoryEntry: {
    modelId: string;
    checklistRefId: string;
    actionRefId: string;
    historyRefId: string;
  };
  NotesEditor: {
    title?: string;
    headerButtonStyle?: TextStyle;
    text?: string;
    extraData?: any;
    eventName: string;
  };
};

export type EventFiltersNavigatorParamList = {
  EnumPicker: EnumPickerInterface;
  EventFilters: {
    filterType: FilterType;
    modelType?: ModelType;
  };
  EventFilterEditor: {
    filterId: string;
    filterType: FilterType;
    generalFilterName: string;
    modelType?: ModelType;
  };
  NotesEditor: {
    title?: string;
    headerButtonStyle?: TextStyle;
    text?: string;
    eventName: string;
  };
};

export type ModelMaintenanceFiltersNavigatorParamList = {
  EnumPicker: EnumPickerInterface;
  ModelMaintenanceFilters: {
    filterType: FilterType;
    modelType?: ModelType;
  };
  ModelMaintenanceFilterEditor: {
    filterId: string;
    filterType: FilterType;
    generalFilterName: string;
    modelType?: ModelType;
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
  };
  ModelFilterEditor: {
    filterId: string;
    filterType: FilterType;
    generalFilterName: string;
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
  };
  BatteryFilterEditor: {
    filterId: string;
    filterType: FilterType;
    generalFilterName: string;
  };
  EnumPicker: EnumPickerInterface;
};

export type BatteryCycleFiltersNavigatorParamList = {
  BatteryCycleFilters: undefined;
  BatteryCycleFilterEditor: {
    filterId: string;
  };
  EnumPicker: EnumPickerInterface;
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
    extraData?: any;
    eventName: string;
  };
};

export type NewBatteryCycleNavigatorParamList = {
  NewBatteryCycle: {
    batteryId: string;
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
  }
  EventSequenceTimer:  {
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
    extraData?: any;
    eventName: string;
  }
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
  NewChecklist:{
    checklistTemplateId?: string;
    modelId?: string;
    modelChecklistRefId?: string;
  },
  NotesEditor: {
    title?: string;
    headerButtonStyle?: TextStyle;
    text?: string;
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
    modelId: string;
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
  EventFiltersNavigator: NavigatorScreenParams<EventFiltersNavigatorParamList>;
  BatteryFiltersNavigator: NavigatorScreenParams<BatteryFiltersNavigatorParamList>;
  ModelFiltersNavigator: NavigatorScreenParams<ModelFiltersNavigatorParamList>;
  ModelMaintenanceFiltersNavigator: NavigatorScreenParams<ModelMaintenanceFiltersNavigatorParamList>;
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
  }
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
  EventFiltersNavigator: NavigatorScreenParams<EventFiltersNavigatorParamList>;
  BatteryFiltersNavigator: NavigatorScreenParams<BatteryFiltersNavigatorParamList>;
  ModelFiltersNavigator: NavigatorScreenParams<ModelFiltersNavigatorParamList>;
  ModelMaintenanceFiltersNavigator: NavigatorScreenParams<ModelMaintenanceFiltersNavigatorParamList>;
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
  }
  ReportScanCodesViewer: {
    reportId: string;
  }
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
