import { ReportType } from 'types/database';

export type FilterSelection = {
  select: string;
  value?: string;
};

export type BatteryFilter = {
  name: string;
  chemistry: FilterSelection;
  totalTime: FilterSelection;
  capacity: FilterSelection;
  cRating: FilterSelection;
  sCells: FilterSelection;
  pCells: FilterSelection;
};

export type ModelFilter = {
  name: string;
  type: FilterSelection;
  lastEvent: FilterSelection;
  totalTime: FilterSelection;
  logsBatteries: FilterSelection;
  logsFuel: FilterSelection;
  damaged: FilterSelection;
  vendor: FilterSelection;
  notes: FilterSelection;
};

export type ReportFilter = {
  name: string;
  reportType: ReportType;
  model: FilterSelection;
  modelType: FilterSelection;
  category: FilterSelection;
  date: FilterSelection;
  duration?: FilterSelection;
  pilot?: FilterSelection;
  location?: FilterSelection;
  modelStyle?: FilterSelection;
  outcome?: FilterSelection;
  costs?: FilterSelection;
  notes?: FilterSelection;
};
