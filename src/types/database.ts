import { appConfig } from "config";

export enum DatabaseAccessWith {
  Dropbox = 'Dropbox',
  WebServer = 'Web Server',
};

// These enumes must have the same keys.
export enum OutputReportTo {
  AirPrint = 'AirPrint',
  Dropbox = 'Dropbox',
  WebServer = 'Web Server',
};

export const OutputReportToDescription = {
  AirPrint: 'Reports will sent to your AirPrint printer.',
  Dropbox: `Reports will be saved to ${appConfig.dropboxReportsPath} on your Dropbox.`,
  WebServer: `Reports will be made available through ${appConfig.appName}\'s built-in web server.`,
};

export enum ReportType {
  Events = 'Events',
  Maintenance = 'Maintenance',
  ModelScanCodes = 'ModelScanCodes',
  BatteryScanCodes = 'BatteryScanCodes',
};
