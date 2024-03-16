import {
  BooleanFilterState,
  DateFilterState,
  EnumFilterState,
  NumberFilterState,
  StringFilterState
} from 'components/molecules/filters';

import { PickEnum } from 'types/custom';

export enum FilterType {
  BypassFilter = 'BypassFilter',
  //
  BatteriesFilter = 'BatteriesFilter',
  BatteryCyclesFilter = 'BatteryCyclesFilter',
  EventsBatteryPerformanceFilter = 'EventsBatteryPerformanceFilter',
  EventsModelFilter = 'EventsModelFilter',
  MaintenanceFilter = 'MaintenanceFilter',
  ModelsFilter = 'ModelFilter',
  ReportBatteryScanCodesFilter = 'ReportBatteryScanCodesFilter',
  ReportEventsFilter = 'ReportEventsFilter',
  ReportMaintenanceFilter = 'ReportMaintenanceFilter',
  ReportModelScanCodesFilter = 'ReportModelScanCodesFilter',
};

// Only report filter types.
export type ReportFilterType = PickEnum<
  FilterType,
  | FilterType.ReportBatteryScanCodesFilter
  | FilterType.ReportEventsFilter
  | FilterType.ReportMaintenanceFilter
  | FilterType.ReportModelScanCodesFilter
>;

export type FilterValues =
  & ModelFilterValues
  & BatteryFilterValues
  & BatteryCycleFilterValues
  & EventFilterValues
  & MaintenanceFilterValues
  & ReportBatteryScanCodeFilterValues
  & ReportEventFilterValues
  & ReportMaintenanceFilterValues
  & ReportModelScanCodeFilterValues

export type AnyFilterValues =
  | ModelFilterValues
  | BatteryFilterValues
  | BatteryCycleFilterValues
  | EventFilterValues
  | MaintenanceFilterValues
  | ReportBatteryScanCodeFilterValues
  | ReportEventFilterValues
  | ReportMaintenanceFilterValues
  | ReportModelScanCodeFilterValues

// Battery filter
//
export type BatteryFilterValues = {
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
  location: EnumFilterState;
  battery: EnumFilterState;
  pilot: EnumFilterState;
  outcome: EnumFilterState;
  notes: StringFilterState;
};

// Maintenance filter
//
export type MaintenanceFilterValues = {
  date: DateFilterState;
  costs: NumberFilterState;
  notes: StringFilterState;
};

// Report event filter
//
export type ReportEventFilterValues = {
  model: EnumFilterState;
  modelType: EnumFilterState;
  category: EnumFilterState;
  date: DateFilterState;
  duration: NumberFilterState;
  pilot: EnumFilterState;
  style: EnumFilterState;
  outcome: EnumFilterState;
};

// Report model maintenance filter
//
export type ReportMaintenanceFilterValues = {
  model: EnumFilterState;
  modelType: EnumFilterState;
  category: EnumFilterState;
  date: DateFilterState;
  costs: NumberFilterState;
  notes: StringFilterState;
};

// Report model scan codes filter
//
export type ReportModelScanCodeFilterValues = {
  modelType: EnumFilterState;
  category: EnumFilterState;
  lastEvent: DateFilterState;
};

// Report battery scan codes filter
//
export type ReportBatteryScanCodeFilterValues = {
  chemistry: EnumFilterState;
  capacity: NumberFilterState;
};
