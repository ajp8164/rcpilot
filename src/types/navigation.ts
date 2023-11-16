import { ContentView } from 'types/content';
import { NavigatorScreenParams } from '@react-navigation/core';
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
  BatteryChemistry: undefined;
  NewBatteryNavigator: undefined;
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
  NewModelNavigator: undefined;
  Models: undefined;
  Model: {
    modelId: string;
  };
  ModelCategory: undefined;
  Notes: undefined;
  Propeller: undefined;
  ScanCodeSize: undefined;
};

export type NewBatteryNavigatorParamList = {
  NewBattery: undefined;
  BatteryChemistry: undefined;
};

export type NewModelNavigatorParamList = {
  EventStyle: undefined;
  ModelCategory: undefined;
  ModelType: undefined;
  NewModel: undefined;
  Notes: undefined;
  Propeller: undefined;
  ScanCodeSize: undefined;
};

export type SetupNavigatorParamList = {
  About: undefined;
  AppSettings: undefined;
  Content: {
    content: ContentView;
  };
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
