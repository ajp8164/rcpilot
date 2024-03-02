import { BatteryTemplate, ListBatteries } from 'types/battery';
import { ChecklistType, EventSequenceChecklistType } from 'types/checklist';

import { BatteryCellValuesEditorConfig } from 'components/BatteryCellValuesEditorScreen';
import { BatteryPickerInterface } from 'components/BatteryPickerScreen';
import { ContentView } from 'types/content';
import { EnumPickerInterface } from 'components/EnumPickerScreen';
import { EventOutcome } from 'types/event';
import { FilterType } from 'types/filter';
import { JChecklistAction } from 'realmdb/Checklist';
import { ListModels } from 'types/model';
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
  BatteryPerformanceNavigator: NavigatorScreenParams<BatteryPerformanceNavigatorParamList>;
  EnumPicker: EnumPickerInterface;
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

export type BatteryPerformanceNavigatorParamList = {
  BatteryPerformanceFilters: undefined;
  BatteryPerformanceFilterEditor: {
    filterId: string;
  }
  EnumPicker: EnumPickerInterface;
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
    modelId?: string;
    pilotId?: string;
  };
  EventEditor: {
    eventId: string;
  };
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
  ModelMaintenanceItem: {
    modelId: string;
    checklistRefId: string;
    actionRefId: string;
  };
  NotesEditor: {
    title?: string;
    headerButtonStyle?: TextStyle;
    text?: string;
    extraData?: any;
    eventName: string;
  };
};

export type ModelFiltersNavigatorParamList = {
  EnumPicker: EnumPickerInterface;
  ModelFilters: undefined;
  ModelFilterEditor: {
    filterId: string;
  };
  NotesEditor: {
    title?: string;
    headerButtonStyle?: TextStyle;
    text?: string;
    eventName: string;
  };
};

export type BatteryFiltersNavigatorParamList = {
  BatteryFilters: undefined;
  BatteryFilterEditor: {
    filterId: string;
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

export type ReportFiltersNavigatorParamList = {
  EnumPicker: EnumPickerInterface;
  NotesEditor: {
    title?: string;
    headerButtonStyle?: TextStyle;
    text?: string;
    extraData?: any;
    eventName: string;
  };
  ReportBatteryScanCodesFilterEditor: {
    filterId?: string;
    eventName: string;
  };
  ReportEventsFilterEditor: {
    filterId?: string;
    eventName: string;
  };
  ReportFilters: {
    filterId?: string;
    filterType: FilterType;
    eventName: string;
  };
  ReportMaintenanceFilterEditor: {
    filterId?: string;
    eventName: string;
  };
  ReportModelScanCodesFilterEditor: {
    filterId?: string;
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
    modelId?: string;
    pilotId?: string;
  };
  EventEditor: {
    eventId: string;
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
  ReportFiltersNavigator: NavigatorScreenParams<ReportFiltersNavigatorParamList>;
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
  ReportEventsMaintenanceEditor: {
    reportId?: string;
  };
  ReportScanCodesEditor: {
    reportId?: string;
  };
  ReportFiltersNavigator: NavigatorScreenParams<ReportFiltersNavigatorParamList>;
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
