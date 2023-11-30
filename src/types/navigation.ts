import { ContentView } from 'types/content';
import { EnumPickerInterface } from 'components/EnumPickerScreen';
import { FlightOutcome } from 'types/flight';
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
  BatteryPerformanceComparisonPicker: undefined;
  BatteryPerformanceNavigator: undefined;
  EnumPicker: EnumPickerInterface;
  NewBatteryNavigator: undefined;
  Notes: {
    title?: string;
    headerButtonStyle?: TextStyle | TextStyle[];
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
  };
};

export type BatteryFiltersNavigatorParamList = {
  BatteryFilters: undefined;
  BatteryFilterEditor: {
    filterId: string;
  };
  EnumPicker: EnumPickerInterface;
};

export type NewBatteryNavigatorParamList = {
  EnumPicker: EnumPickerInterface;
  NewBattery: undefined;
  Notes: {
    title?: string;
    headerButtonStyle?: TextStyle | TextStyle[];
  };
};

export type NewModelNavigatorParamList = {
  EnumPicker: EnumPickerInterface;
  NewModel: undefined;
  Notes: {
    title?: string;
    headerButtonStyle?: TextStyle | TextStyle[];
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
