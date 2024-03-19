import { Achievement, Pilot } from './Pilot';
import { BatteryCharge, BatteryCycle, BatteryDischarge } from './BatteryCycle';
import {
  ChecklistAction,
  ChecklistActionHistoryEntry,
  ChecklistActionSchedule,
  ChecklistActionScheduleDue,
  ChecklistActionScheduleState,
} from './Checklist';
import { Filter, FilterState } from './Filter';
import { Location, LocationCoords } from './Location';
import { Model, ModelEventStyleData, ModelStatistics } from './Model';

import { Battery } from './Battery';
import { Checklist } from './Checklist';
import { ChecklistTemplate } from './ChecklistTemplate';
import { Event } from './Event';
import { EventStyle } from './EventStyle';
import { EventsMaintenanceReport } from './EventsMaintenanceReport';
import { ModelCategory } from './ModelCategory';
import { ModelFuel } from './ModelFuel';
import { ModelPropeller } from './ModelPropeller';
import { ScanCodesReport } from './ScanCodesReport';

const Schema = [
  Battery,
  BatteryCycle,
  ChecklistTemplate,
  Event,
  EventsMaintenanceReport,
  EventStyle,
  Filter,
  Location,
  ModelCategory,
  ModelFuel,
  ModelPropeller,
  Model,
  Pilot,
  ScanCodesReport,

  // Embedded objects
  Achievement,
  BatteryCharge,
  BatteryDischarge,
  Checklist,
  ChecklistAction,
  ChecklistActionHistoryEntry,
  ChecklistActionSchedule,
  ChecklistActionScheduleDue,
  ChecklistActionScheduleState,
  FilterState,
  LocationCoords,
  ModelEventStyleData,
  ModelStatistics,
];

export default Schema;
