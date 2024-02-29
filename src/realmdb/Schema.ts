import { Achievement, Pilot } from './Pilot';
import { BatteryCharge, BatteryCycle, BatteryDischarge } from './BatteryCycle';
import { ChecklistAction, ChecklistActionHistoryEntry, ChecklistActionSchedule, ChecklistActionScheduleDue, ChecklistActionScheduleState } from './Checklist';
import { Filter, FilterState } from './Filter';
import { Location, LocationPosition } from './Location';

import { Battery } from './Battery';
import { Checklist } from './Checklist';
import { ChecklistTemplate } from './ChecklistTemplate';
import { Event } from './Event';
import { EventStyle } from './EventStyle';
import { EventsMaintenanceReport } from './EventsMaintenanceReport';
import { Model } from './Model';
import { ModelCategory } from './ModelCategory';
import { ModelFuel } from './ModelFuel';
import { ModelPropeller } from './ModelPropeller';
import { ScanCodesReport } from './ScanCodesReport';

const Schema = [
  Battery,
  Checklist,
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
  BatteryCycle,
  BatteryDischarge,
  ChecklistAction,
  ChecklistActionHistoryEntry,
  ChecklistActionSchedule,
  ChecklistActionScheduleDue,
  ChecklistActionScheduleState,
  FilterState,
  LocationPosition,
];

export default Schema;
