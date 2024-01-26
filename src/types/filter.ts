import {
  BooleanFilterState,
  DateFilterState,
  EnumFilterState,
  NumberFilterState,
  StringFilterState
} from 'components/molecules/filters';

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
export type BatteryFilterValues = {
  name: StringFilterState;
  chemistry: EnumFilterState;
  totalTime: NumberFilterState;
  capacity: NumberFilterState;
  cRating: NumberFilterState;
  sCells: NumberFilterState;
  pCells: NumberFilterState;
};

// Model filter
//
export type ModelFilterValues = {
  name: StringFilterState;
  modelType: EnumFilterState;
  lastEvent: DateFilterState;
  totalTime: NumberFilterState;
  logsBatteries: BooleanFilterState;
  logsFuel: BooleanFilterState;
  damaged: BooleanFilterState;
  vendor: StringFilterState;
  notes: StringFilterState;
};

// Any report filter
//
export type ReportFilterValues = 
  EventReportFilterValues |
  MaintenanceReportFilterValues |
  ModelScanCodesReportFilterValues |
  BatteryScanCodesReportFilterValues;

// Event report filter
//
export type EventReportFilterValues = {
  model: EnumFilterState;
  modelType: EnumFilterState;
  category: EnumFilterState;
  date: DateFilterState;
  duration: NumberFilterState;
  pilot: EnumFilterState;
  location: EnumFilterState;
  modelStyle: EnumFilterState;
  outcome: EnumFilterState;
};

// Maintenance report filter
//
export type MaintenanceReportFilterValues = {
  model: EnumFilterState;
  modelType: EnumFilterState;
  category: EnumFilterState;
  date: DateFilterState;
  costs: NumberFilterState;
  notes: StringFilterState;
};

// Model scan code report filter
//
export type ModelScanCodesReportFilterValues = {
  modelType: EnumFilterState;
  category: EnumFilterState;
  lastEvent: DateFilterState;
};

// Battery scan code report filter
//
export type BatteryScanCodesReportFilterValues = {
  chemistry: EnumFilterState;
  capacity: NumberFilterState;
};
