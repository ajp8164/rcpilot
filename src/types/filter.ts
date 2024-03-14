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
  BatteryCyclesFilter = 'BatteryCyclesFilter',
  EventsBatteryPerformanceFilter = 'EventsBatteryPerformanceFilter',
  EventsModelFilter = 'EventsModelFilter',
  MaintenanceFilter = 'MaintenanceFilter',
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
  & EventFilterValues
  & MaintenanceFilterValues

export type AnyFilterValues =
  | ModelFilterValues
  | BatteryFilterValues
  | BatteryCycleFilterValues
  | EventFilterValues
  | MaintenanceFilterValues

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

// Maintenace filter
//
export type MaintenanceFilterValues = {
  date: DateFilterState;
  costs: NumberFilterState;
  notes: StringFilterState;
};
