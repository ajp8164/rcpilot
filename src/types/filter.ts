import {
  BooleanFilterState,
  DateFilterState,
  EnumFilterState,
  NumberFilterState,
  StringFilterState
} from 'components/molecules/filters';

import { PickEnum } from 'types/custom';

export enum FilterType {
  BatteriesFilter = 'BatteriesFilter',
  BatteryCycleFilter = 'BatteryCycleFilter',
  ModelsFilter = 'ModelFilter',
  ReportEventsFilter = 'ReportEventsFilter',
  ReportMaintenanceFilter = 'ReportMaintenanceFilter',
  ReportBatteryScanCodesFilter = 'ReportBatteryScanCodesFilter',
  ReportModelScanCodesFilter = 'ReportModelScanCodesFilter',
};

// Only report filter types.
export type ReportFilterType = PickEnum<
  FilterType,
  | FilterType.ReportEventsFilter
  | FilterType.ReportMaintenanceFilter
  | FilterType.ReportModelScanCodesFilter
  | FilterType.ReportBatteryScanCodesFilter
>;

export type FilterValues =
  & ModelFilterValues
  & BatteryFilterValues
  & BatteryCycleFilterValues
  & EventReportFilterValues
  & EventFilterValues
  & MaintenanceReportFilterValues
  & ModelScanCodesReportFilterValues
  & BatteryScanCodesReportFilterValues;

export type AnyFilterValues =
  | ModelFilterValues
  | BatteryFilterValues
  | BatteryCycleFilterValues
  | EventReportFilterValues
  | EventFilterValues
  | MaintenanceReportFilterValues
  | ModelScanCodesReportFilterValues
  | BatteryScanCodesReportFilterValues;

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

// Battery cycle filter
//
export type BatteryCycleFilterValues = {
  dischargeDate: DateFilterState;
  dischargeDuration: NumberFilterState;
  chargeDate: DateFilterState;
  chargeAmount: NumberFilterState;
  notes: StringFilterState;
};

// Model filter
//
export type ModelFilterValues = {
  modelType: EnumFilterState;
  category: EnumFilterState;
  lastEvent: DateFilterState;
  totalTime: NumberFilterState;
  logsBatteries: BooleanFilterState;
  logsFuel: BooleanFilterState;
  damaged: BooleanFilterState;
  vendor: StringFilterState;
  notes: StringFilterState;
};

// Event filter
//
export type EventFilterValues = {
  date: DateFilterState;
  duration: NumberFilterState;
  style: EnumFilterState;
  location: StringFilterState;
  battery: StringFilterState;
  pilot: StringFilterState;
  outcome: EnumFilterState;
  notes: StringFilterState;
};

// Any report filter
//
export type ReportFilterValues = 
  | EventReportFilterValues
  | MaintenanceReportFilterValues
  | ModelScanCodesReportFilterValues
  | BatteryScanCodesReportFilterValues;

// Event report filter
//
export type EventReportFilterValues = {
  model: EnumFilterState;
  modelType: EnumFilterState;
  category: EnumFilterState;
  date: DateFilterState;
  duration: NumberFilterState;
  pilot: EnumFilterState;
  location: StringFilterState;
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
