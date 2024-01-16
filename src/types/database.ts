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

export enum OutputReportToDescription {
  AirPrint = 'Reports will sent to your AirPrint printer.',
  Dropbox = 'Reports will be saved to /Apps/RCPilot/Reports on your Dropbox.',
  WebServer = 'Reports will be made available through RCPilot\'s built-in web server.',
};

export enum ReportType {
  EventMaintenance = 'EventMaintenance',
  ScanCode = 'ScanCode',
};
