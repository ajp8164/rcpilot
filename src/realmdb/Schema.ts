import { BatteryCharge, BatteryCycle, BatteryDischarge } from './BatteryCycle';
import { ChecklistAction, ChecklistActionSchedule, ChecklistTemplate } from './ChecklistTemplate';
import { Filter, FilterState } from './Filter';

import { Battery } from './Battery';
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
  BatteryCycle,
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
  BatteryDischarge,
  ChecklistAction,
  ChecklistActionSchedule,
  FilterState,
];

export default Schema;
