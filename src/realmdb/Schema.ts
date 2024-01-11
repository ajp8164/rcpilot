import { ChecklistAction, ChecklistActionSchedule, ChecklistTemplate } from './ChecklistTemplate';

import { Battery } from './Battery';
import { EventStyle } from './EventStyle';
import { Model } from './Model';
import { ModelCategory } from './ModelCategory';
import { ModelFuel } from './ModelFuel';
import { ModelPropeller } from './ModelPropeller';
import { Pilot } from './Pilot';

const Schema = [
  Battery,
  ChecklistTemplate,
  EventStyle,
  ModelCategory,
  ModelFuel,
  ModelPropeller,
  Model,
  Pilot,
  
  // Embedded objects
  ChecklistAction,
  ChecklistActionSchedule,
];

export default Schema;
