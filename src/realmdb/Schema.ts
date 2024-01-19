import { ChecklistAction, ChecklistActionSchedule, ChecklistTemplate } from './ChecklistTemplate';

import { Battery } from './Battery';
import { EventStyle } from './EventStyle';
import { Filter } from './Filter';
import { Model } from './Model';
import { ModelCategory } from './ModelCategory';
import { ModelFuel } from './ModelFuel';
import { ModelPropeller } from './ModelPropeller';
import { Pilot } from './Pilot';
import { Report } from './Report';

const Schema = [
  Battery,
  ChecklistTemplate,
  EventStyle,
  Filter,
  ModelCategory,
  ModelFuel,
  ModelPropeller,
  Model,
  Pilot,
  Report,
  
  // Embedded objects
  ChecklistAction,
  ChecklistActionSchedule,
];

export default Schema;
