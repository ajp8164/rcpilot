import { ContentView } from 'types/content';
import { FlightOutcome } from 'types/flight';
import { IconProps } from 'types/common';
import { NavigatorScreenParams } from '@react-navigation/core';
import { TextStyle } from 'react-native';
import { UserProfile } from 'types/user';

export enum StartupScreen {
  None = 'None',
  Home = 'Log',
  Welcome = 'Welcome',
}

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
  NewBatteryNavigator: undefined;
  Notes: {
    title?: string;
    headerButtonStyle?: TextStyle | TextStyle[];
  };
  ScanCodeSize: undefined;
  ValuePicker: {
    title: string;
    kind?: string;
    values: string[] | {[key in string]: string};
    selected: string;
    icons?: {[key in string]: IconProps};
  };
};

export type LogNavigatorParamList = {
  Log: undefined;
};

export type MainNavigatorParamList = {
  Startup: NavigatorScreenParams<StartupNavigatorParamList>;
  Tabs: NavigatorScreenParams<TabNavigatorParamList>;
};

export type ModelsNavigatorParamList = {
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
  NewModelNavigator: undefined;
  Models: undefined;
  Model: {
    modelId: string;
  };
  ModelFiltersNavigator: undefined;
  Notes: {
    title?: string;
    headerButtonStyle?: TextStyle | TextStyle[];
  };
  ScanCodeSize: undefined;
  ValuePicker: {
    title: string;
    kind?: string;
    values: string[] | {[key in string]: string};
    selected: string;
    icons?: {[key in string]: IconProps};
  };
};

export type ModelFiltersNavigatorParamList = {
  ModelFilters: undefined;
  ModelFilterEditor: {
    filterId: string;
  };
  ModelFilterModelTypes: undefined;
  Notes: {
    title?: string;
    headerButtonStyle?: TextStyle | TextStyle[];
  };
};

export type BatteryFiltersNavigatorParamList = {
  BatteryFilters: undefined;
  BatteryFilterEditor: {
    filterId: string;
  };
  BatteryFilterChemistry: undefined;
};

export type NewBatteryNavigatorParamList = {
  NewBattery: undefined;
  Notes: {
    title?: string;
    headerButtonStyle?: TextStyle | TextStyle[];
  };
  ScanCodeSize: undefined;
  ValuePicker: {
    title: string;
    kind?: string;
    values: string[] | {[key in string]: string};
    selected: string;
    icons?: {[key in string]: IconProps};
  };
};

export type NewModelNavigatorParamList = {
  NewModel: undefined;
  Notes: {
    title?: string;
    headerButtonStyle?: TextStyle | TextStyle[];
  };
  ScanCodeSize: undefined;
  ValuePicker: {
    title: string;
    kind?: string;
    values: string[] | {[key in string]: string};
    selected: string;
    icons?: {[key in string]: IconProps};
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
  }
};

export type SetupNavigatorParamList = {
  About: undefined;
  AppSettings: undefined;
  Content: {
    content: ContentView;
  };
  Flights: {
    pilotId: string;
  };
  FlightDetails: {
    flightId: string;
  };
  FlightOutcome: {
    flightOutcome: FlightOutcome;
  };
  Pilot: undefined;
  Setup: {
    subNav?: string;
  };
  UserAccount: undefined;
  UserProfile: {
    userProfile: UserProfile;
  };
  ValuePicker: {
    title: string;
    kind?: string;
    values: string[] | {[key in string]: string};
    selected: string;
    icons?: {[key in string]: IconProps};
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
