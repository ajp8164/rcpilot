import { ChecklistAction, ChecklistActionSchedule, ChecklistTemplate } from './ChecklistTemplate';

import { Battery } from './Battery';
import { EventStyle } from './EventStyle';
import { EventsMaintenanceReport } from './EventsMaintenanceReport';
import { Filter } from './Filter';
import { Model } from './Model';
import { ModelCategory } from './ModelCategory';
import { ModelFuel } from './ModelFuel';
import { ModelPropeller } from './ModelPropeller';
import { Pilot } from './Pilot';
import { ScanCodesReport } from './ScanCodesReport';

const Schema = [
  Battery,
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
  ChecklistAction,
  ChecklistActionSchedule,
];

export default Schema;
