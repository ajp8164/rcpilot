import { ContentView } from 'types/content';
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
  BatteryChemistry: undefined;
  BatteryCycles: undefined;
  BatteryCycle: {
    batteryCycleId: string;
  };
  BatteryFiltersNavigator: undefined;
  BatteryPerformance: undefined;
  BatteryTint: undefined;
  NewBatteryNavigator: undefined;
  Notes: {
    title?: string;
    headerButtonStyle?: TextStyle | TextStyle[];
  };
  ScanCodeSize: undefined;
};

export type LogNavigatorParamList = {
  Log: undefined;
};

export type MainNavigatorParamList = {
  Startup: NavigatorScreenParams<StartupNavigatorParamList>;
  Tabs: NavigatorScreenParams<TabNavigatorParamList>;
};

export type ModelsNavigatorParamList = {
  EventStyle: undefined;
  Flights: {
    pilotId: string;
  };
  FlightNavigator: {
    modelId: string;
  };
  NewModelNavigator: undefined;
  Models: undefined;
  Model: {
    modelId: string;
  };
  ModelCategory: undefined;
  ModelFiltersNavigator: undefined;
  Notes: {
    title?: string;
    headerButtonStyle?: TextStyle | TextStyle[];
  };
  Propeller: undefined;
  ScanCodeSize: undefined;
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
  BatteryChemistry: undefined;
  BatteryTint: undefined;
  Notes: {
    title?: string;
    headerButtonStyle?: TextStyle | TextStyle[];
  };
  ScanCodeSize: undefined;
};

export type NewModelNavigatorParamList = {
  EventStyle: undefined;
  ModelCategory: undefined;
  ModelType: undefined;
  NewModel: undefined;
  Notes: {
    title?: string;
    headerButtonStyle?: TextStyle | TextStyle[];
  };
  Propeller: undefined;
  ScanCodeSize: undefined;
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
  Pilot: undefined;
  Setup: {
    subNav?: string;
  };
  UserAccount: undefined;
  UserProfile: {
    userProfile: UserProfile;
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
