import { ChecklistActionInterface } from 'components/ChecklistActionEditorScreen';
import { ChecklistTemplateType } from 'types/checklistTemplate';
import { ContentView } from 'types/content';
import { EnumPickerInterface } from 'components/EnumPickerScreen';
import { FilterType } from 'types/filter';
import { FlightOutcome } from 'types/flight';
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
  Batteries: undefined;
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
  BatteryFiltersNavigator: undefined;
  BatteryPerformance: undefined;
  BatteryPerformanceComparisonPicker: undefined;
  BatteryPerformanceNavigator: undefined;
  EnumPicker: EnumPickerInterface;
  NewBatteryNavigator: undefined;
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
  NewModelNavigator: undefined;
  Models: undefined;
  Model: {
    modelId: string;
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
  };
  ReportEventsFilterEditor: {
    filterId?: string;
  };
  ReportFilters: {
    filterType?: FilterType;
    eventName: string;
  };
  ReportMaintenanceFilterEditor: {
    filterId?: string;
  };
  ReportModelScanCodesFilterEditor: {
    filterId?: string;
  };
};

export type NewBatteryNavigatorParamList = {
  EnumPicker: EnumPickerInterface;
  NewBattery: undefined;
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
  NewModel: undefined;
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
    checklistAction?: ChecklistActionInterface;
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
    checklistAction?: ChecklistActionInterface;
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
    checklistAction?: ChecklistActionInterface;
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
  NewEventStyle: undefined;
  NewModelCategory: undefined;
  NewModelFuelNavigator: undefined;
  NewModelPropellerNavigator: undefined;
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
  UserAccount: undefined;
  UserProfile: {
    userProfile: UserProfile;
  };
  WebServerAccess: undefined;
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
