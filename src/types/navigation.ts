import { ChecklistTemplateType } from 'types/checklistTemplate';
import { ContentView } from 'types/content';
import { EnumPickerInterface } from 'components/EnumPickerScreen';
import { FilterType } from 'types/filter';
import { FlightOutcome } from 'types/flight';
import { JChecklistAction } from 'realmdb/ChecklistTemplate';
import { ListBatteries } from 'types/battery';
import { ListModels } from 'types/model';
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
  Notes: {
    title?: string;
    headerButtonStyle?: TextStyle | TextStyle[];
    text?: string;
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
  BatteryCellResistances: {
    batteryCycleId: string;
  };
  BatteryCellVoltages: {
    batteryCycleId: string;
  };
  BatteryCycles: undefined;
  BatteryCycle: {
    batteryCycleId: string;
  };
  BatteryEditor: {
    batteryId: string;
  };
  BatteryFiltersNavigator: undefined;
  BatteryPerformance: undefined;
  BatteryPerformanceComparisonPicker: undefined;
  BatteryPerformanceNavigator: undefined;
  EnumPicker: EnumPickerInterface;
  NewBatteryNavigator: NavigatorScreenParams<NewBatteryNavigatorParamList>;
  NewBatteryCycleNavigator: NavigatorScreenParams<NewBatteryCycleNavigatorParamList>;
  Notes: {
    title?: string;
    headerButtonStyle?: TextStyle | TextStyle[];
    text?: string;
    eventName: string;
  };
};

export type BatteryPerformanceNavigatorParamList = {
  BatteryPerformanceFilters: undefined;
  BatteryPerformanceFilterEditor: {
    filterId: string;
  }
  EnumPicker: EnumPickerInterface;
  Notes: {
    title?: string;
    headerButtonStyle?: TextStyle | TextStyle[];
    text?: string;
    eventName: string;
  };
};

export type LogNavigatorParamList = {
  Log: undefined;
  FlightDetails: {
    flightId: string;
  };
  BatteryCycle: {
    batteryCycleId: string;
  };
};

export type MainNavigatorParamList = {
  Startup: NavigatorScreenParams<StartupNavigatorParamList>;
  Tabs: NavigatorScreenParams<TabNavigatorParamList>;
};

export type ModelsNavigatorParamList = {
  EnumPicker: EnumPickerInterface;
  Flights: {
    pilotId: string;
  };
  FlightDetails: {
    flightId: string;
  };
  FlightOutcome: {
    flightOutcome: FlightOutcome;
  };
  FlightNavigator: {
    modelId: string;
  };
  LocationDetails: {
    locationId: string;
  };
  NewModelNavigator: NavigatorScreenParams<NewModelNavigatorParamList>;
  ModelEditor: {
    modelId: string;
  };
  ModelStatistics: {
    modelId: string;
  };
  Models: {
    listModels?: ListModels;
  };
  ModelFiltersNavigator: undefined;
  Notes: {
    title?: string;
    headerButtonStyle?: TextStyle | TextStyle[];
    text?: string;
    eventName: string;
  };
};

export type ModelFiltersNavigatorParamList = {
  EnumPicker: EnumPickerInterface;
  ModelFilters: undefined;
  ModelFilterEditor: {
    filterId: string;
  };
  Notes: {
    title?: string;
    headerButtonStyle?: TextStyle | TextStyle[];
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

export type ReportFiltersNavigatorParamList = {
  EnumPicker: EnumPickerInterface;
  Notes: {
    title?: string;
    headerButtonStyle?: TextStyle | TextStyle[];
    text?: string;
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
  };
  Notes: {
    title?: string;
    headerButtonStyle?: TextStyle | TextStyle[];
    text?: string;
    eventName: string;
  };
};

export type NewBatteryCycleNavigatorParamList = {
  NewBatteryCycle: {
    batteryId: string;
  };
  BatteryCellResistances: {
    batteryCycleId: string;
  };
  BatteryCellVoltages: {
    batteryCycleId: string;
  };
  Notes: {
    title?: string;
    headerButtonStyle?: TextStyle | TextStyle[];
    text?: string;
    eventName: string;
  };
};

export type NewModelNavigatorParamList = {
  EnumPicker: EnumPickerInterface;
  NewModel: {
    modelId?: string;
  };
  Notes: {
    title?: string;
    headerButtonStyle?: TextStyle | TextStyle[];
    text?: string;
    eventName: string;
  };
};

export type FlightNavigatorParamList = {
  FlightBatteries: {
    modelId: string;
  };
  FlightPreFlight: {
    flightId: string;
  }
  FlightChecklistItem: {
    checklistId: string;
    actionIndex: number;
  }
  FlightTimer: {
    flightId: string;
  }
  Notes: {
    title?: string;
    headerButtonStyle?: TextStyle | TextStyle[];
    text?: string;
    eventName: string;
  }
};

export type LocationNavigatorParamList = {
  Locations: undefined;
  LocationDetails: {
    locationId: string;
  };
  Notes: {
    title?: string;
    headerButtonStyle?: TextStyle | TextStyle[];
    text?: string;
    eventName: string;
  };
};

export type NewModelFuelNavigatorParamList = {
  NewModelFuel: undefined;
  Notes: {
    title?: string;
    headerButtonStyle?: TextStyle | TextStyle[];
    text?: string;
    eventName: string;
  };
};

export type NewModelPropellerNavigatorParamList = {
  EnumPicker: EnumPickerInterface;
  NewModelPropeller: undefined;
  Notes: {
    title?: string;
    headerButtonStyle?: TextStyle | TextStyle[];
    text?: string;
    eventName: string;
  };
};

export type NewChecklistTemplateNavigatorParamList = {
  ChecklistActionEditor: {
    checklistAction?: JChecklistAction;
    checklistTemplateType: ChecklistTemplateType;
    eventName: string;
  };
  EnumPicker: EnumPickerInterface;
  NewChecklistTemplate: undefined;
  Notes: {
    title?: string;
    headerButtonStyle?: TextStyle | TextStyle[];
    text?: string;
    eventName: string;
  };
};

export type NewChecklistActionNavigatorParamList = {
  NewChecklistAction: {
    checklistAction?: JChecklistAction;
    checklistTemplateType: ChecklistTemplateType;
    eventName: string;
  };
  Notes: {
    title?: string;
    headerButtonStyle?: TextStyle | TextStyle[];
    text?: string;
    eventName: string;
  };
};

export type SetupNavigatorParamList = {
  About: undefined;
  AppSettings: undefined;
  ChecklistActionEditor: {
    checklistAction?: JChecklistAction;
    checklistTemplateType: ChecklistTemplateType;
    eventName: string;
  };
  ChecklistTemplates: undefined;
  ChecklistTemplateEditor: {
    checklistTemplateId: string;
  };
  Content: {
    content: ContentView;
  };
  DatabaseInfo: undefined;
  DropboxAccess: undefined;
  DatabaseReporting: undefined;
  EnumPicker: EnumPickerInterface;
  Flights: {
    pilotId: string;
  };
  FlightDetails: {
    flightId: string;
  };
  FlightOutcome: {
    flightOutcome: FlightOutcome;
  };
  LocationNavigator: NavigatorScreenParams<LocationNavigatorParamList>;
  Pilot: {
    pilotId: string;
  };
  Pilots: undefined;
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
  NewChecklistTemplateNavigator: undefined;
  NewChecklistActionNavigator: NavigatorScreenParams<NewChecklistActionNavigatorParamList>;
  NewEventStyle: {
    eventStyleId?: string;
  };
  NewModelCategory: undefined;
  NewModelFuelNavigator: undefined;
  NewModelPropellerNavigator: undefined;
  NewReportNavigator: NavigatorScreenParams<NewReportNavigatorParamList>;
  Notes: {
    title?: string;
    headerButtonStyle?: TextStyle | TextStyle[];
    text?: string;
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
