import { ChecklistActionSchedulePeriod, ChecklistActionScheduleType, ChecklistType } from 'types/checklist';
import { Object, ObjectSchema } from 'realm';

export class Checklist extends Object<Checklist> {
  refId!: string;
  name!: string;
  type!: ChecklistType;
  actions!: ChecklistAction[];

  static schema: ObjectSchema = {
    name: 'Checklist',
    embedded: true,
    properties: {
      refId: 'string',
      name: 'string',
      type: 'string',
      actions: 'ChecklistAction[]',
    },
  };
};

export type JChecklistAction =  {
  refId?: string;
  description: string;
  schedule: JChecklistActionSchedule;
  cost?: number;
  notes?: string;
};

export class ChecklistAction extends Object<ChecklistAction> {
  refId!: string;
  description!: string;
  schedule!: ChecklistActionSchedule;
  cost?: number;
  notes?: string;

  static schema: ObjectSchema = {
    name: 'ChecklistAction',
    embedded: true,
    properties: {
      refId: 'string',
      description: 'string',
      schedule: 'ChecklistActionSchedule',
      cost: 'float?',
      notes: 'string?',
    },
  };
};

// Plain JS object type.
export interface JChecklistActionSchedule  {
  period: keyof typeof ChecklistActionSchedulePeriod;
  type: ChecklistActionScheduleType;
  value: number;
};

export class ChecklistActionSchedule extends Object<ChecklistActionSchedule> {
  period!: keyof typeof ChecklistActionSchedulePeriod;
  type!: ChecklistActionScheduleType;
  value!: number;

  static schema: ObjectSchema = {
    name: 'ChecklistActionSchedule',
    embedded: true,
    properties: {
      period: 'string',
      type: 'string',
      value: 'int?',
    },
  };
};
