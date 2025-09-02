import { Battery } from './Battery';
import { BatteryCharge, BatteryCycle, BatteryDischarge } from './BatteryCycle';
import {
  Checklist,
  ChecklistAction,
  ChecklistActionHistoryEntry,
  ChecklistActionSchedule,
  ChecklistActionScheduleDue,
  ChecklistActionScheduleState,
} from './Checklist';
import { ChecklistTemplate } from './ChecklistTemplate';
import { Achievement, Commander } from './Commander';
import { Event } from './Event';
import { EventStyle } from './EventStyle';
import { EventsMaintenanceReport } from './EventsMaintenanceReport';
import { Filter, FilterState } from './Filter';
import { Location, LocationCoords } from './Location';
import { Model, ModelEventStyleData, ModelStatistics } from './Model';
import { ModelCategory } from './ModelCategory';
import { ModelFuel } from './ModelFuel';
import { ModelPropeller } from './ModelPropeller';
import { ScanCodesReport } from './ScanCodesReport';

const Schema = [
  Battery,
  BatteryCycle,
  ChecklistTemplate,
  Commander,
  Event,
  EventsMaintenanceReport,
  EventStyle,
  Filter,
  Location,
  ModelCategory,
  ModelFuel,
  ModelPropeller,
  Model,
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
