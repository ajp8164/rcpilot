import {
  ChecklistActionSchedulePeriod,
  ChecklistActionScheduleType,
  ChecklistType
} from 'types/checklist';
import { Object, ObjectSchema } from 'realm';

import { ISODateString } from 'types/common';

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
  history!: ChecklistActionHistoryEntry[];

  static schema: ObjectSchema = {
    name: 'ChecklistAction',
    embedded: true,
    properties: {
      refId: 'string',
      description: 'string',
      schedule: 'ChecklistActionSchedule',
      cost: 'float?',
      notes: 'string?',
      history: { type: 'list', objectType: 'ChecklistActionHistoryEntry', default: [] },
    },
  };
};

// Plain JS object type.
export interface JChecklistActionSchedule  {
  following?: string;
  period: keyof typeof ChecklistActionSchedulePeriod;
  type: ChecklistActionScheduleType;
  value: number;
};

export class ChecklistActionSchedule extends Object<ChecklistActionSchedule> {
  following?: string;
  period!: keyof typeof ChecklistActionSchedulePeriod;
  type!: ChecklistActionScheduleType;
  value!: number;

  static schema: ObjectSchema = {
    name: 'ChecklistActionSchedule',
    embedded: true,
    properties: {
      following: 'string?',
      period: 'string',
      type: 'string',
      value: 'int?',
    },
  };
};

// Plain JS object type.
export class JChecklistActionHistoryEntry {
  date!: ISODateString;
  complete!: boolean;
  notes?: string;
};

export class ChecklistActionHistoryEntry extends Object<ChecklistActionHistoryEntry> {
  date!: ISODateString;
  complete!: boolean;
  notes?: string;

  static schema: ObjectSchema = {
    name: 'ChecklistActionHistoryEntry',
    embedded: true,
    properties: {
      date: 'string',
      complete: 'bool',
      notes: 'string?',
    },
  };
};
