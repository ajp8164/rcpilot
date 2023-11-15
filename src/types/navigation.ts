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
  NewBattery: undefined;
};

export type LogNavigatorParamList = {
  Log: undefined;
};

export type MainNavigatorParamList = {
  Startup: NavigatorScreenParams<StartupNavigatorParamList>;
  Tabs: NavigatorScreenParams<TabNavigatorParamList>;
};

export type ModelsNavigatorParamList = {
  Models: undefined;
  Model: {
    modelId: string;
  };
  ModelCategory: undefined;
  NewModelNavigator: undefined;
};

export type NewModelNavigatorParamList = {
  NewModel: undefined;
  ModelCategory: undefined;
  ModelType: undefined;
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
