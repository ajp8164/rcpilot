import { FilterState } from 'components/molecules/filters';

export enum FilterType {
  BatteriesFilter = 'BatteriesFilter',
  ModelsFilter = 'ModelFilter',
  ReportEventsFilter = 'ReportEventsFilter',
  ReportMaintenanceFilter = 'ReportMaintenanceFilter',
  ReportBatteryScanCodesFilter = 'ReportBatteryScanCodesFilter',
  ReportModelScanCodesFilter = 'ReportModelScanCodesFilter',
};

// Battery filter
//
export type BatteryFilter = {
  name: string;
  values: ModelFilterValues;
};

export type BatteryFilterValues = {[key in BatteryFilterValue]: FilterState};

export enum BatteryFilterValue {
  Name = 'name',
  Chemistry = 'chemistry',
  TotalTime = 'totalTime',
  Capacity = 'capacity',
  CRating = 'cRating',
  SCells = 'sCells',
  PCells = 'pCells',
};

// Model filter
//
export type ModelFilter = {
  name: string;
  values: ModelFilterValues;
};

export type ModelFilterValues = {[key in ModelFilterValue]: FilterState};

export enum ModelFilterValue {
  Name = 'name',
  Type = 'type',
  LastEvent = 'lastEvent',
  TotalTime = 'totalTime',
  LogsBatteries = 'logsBatteries',
  LogsFuel = 'logsFuel',
  Damaged = 'damaged',
  Vendor = 'vendor',
  Notes = 'notes',
};

// Any report filter
//
export type ReportFilter = 
  EventReportFilter |
  MaintenanceReportFilter |
  ModelScanCodeReportFilter |
  BatteryScanCodeReportFilter;

// Event report filter
//
export type EventReportFilter = {
  name: string;
  values: EventReportFilterValues;
};

export type EventReportFilterValues = {[key in EventReportFilterValue]: FilterState};

export enum EventReportFilterValue {
  Model = 'model',
  ModelType = 'modelType',
  Category = 'category',
  Date = 'date',
  Duration = 'duration',
  Pilot = 'pilot',
  Location = 'location',
  ModelStyle = 'modelStyle',
  Outcome = 'outcome',
};

// Maintenance report filter
//
export type MaintenanceReportFilter = {
  name: string;
  values: MaintenanceReportFilterValues;
};

export type MaintenanceReportFilterValues = {[key in MaintenanceReportFilterValue]: FilterState};

export enum MaintenanceReportFilterValue {
  Model = 'model',
  ModelType = 'modelType',
  Category = 'category',
  Date = 'date',
  Costs = 'costs',
  Notes = 'notes',
};

// Model scan code report filter
//
export type ModelScanCodeReportFilter = {
  name: string;
  values: ModelScanCodeReportFilterValues;
};

export type ModelScanCodeReportFilterValues = {[key in ModelScanCodeReportFilterValue]: FilterState};

export enum ModelScanCodeReportFilterValue {
  ModelType = 'modelType',
  Category = 'category',
  LastEvent = 'lastEvent',
};

// Battery scan code report filter
//
export type BatteryScanCodeReportFilter = {
  name: string;
  values: BatteryScanCodeReportFilterValues;
};

export type BatteryScanCodeReportFilterValues = {[key in BatteryScanCodeReportFilterValue]: FilterState};

export enum BatteryScanCodeReportFilterValue {
  Chemistry = 'chemistry',
  Capacity = 'capacity',
};
