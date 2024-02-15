import { BatteryCharge, BatteryCycle, BatteryDischarge } from './BatteryCycle';
import { ChecklistAction, ChecklistActionSchedule } from './Checklist';
import { Filter, FilterState } from './Filter';

import { Battery } from './Battery';
import { Checklist } from './Checklist';
import { ChecklistTemplate } from './ChecklistTemplate';
import { EventStyle } from './EventStyle';
import { EventsMaintenanceReport } from './EventsMaintenanceReport';
import { Model } from './Model';
import { ModelCategory } from './ModelCategory';
import { ModelFuel } from './ModelFuel';
import { ModelPropeller } from './ModelPropeller';
import { Pilot } from './Pilot';
import { ScanCodesReport } from './ScanCodesReport';

const Schema = [
  Battery,
  Checklist,
  ChecklistTemplate,
  EventsMaintenanceReport,
  EventStyle,
  Filter,
  ModelCategory,
  ModelFuel,
  ModelPropeller,
  Model,
  Pilot,
  ScanCodesReport,
  
  // Embedded objects
  BatteryCharge,
  BatteryCycle,
  BatteryDischarge,
  ChecklistAction,
  ChecklistActionSchedule,
  FilterState,
];

export default Schema;
