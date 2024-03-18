import {
  ChecklistActionSchedulePeriod,
  ChecklistActionScheduleType,
  ChecklistType,
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
}

export type JChecklistAction = {
  refId?: string;
  description: string;
  schedule: JChecklistActionSchedule;
  cost?: number;
  notes?: string;
  history: JChecklistActionHistoryEntry[];
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
}

// Plain JS object type.
export type JChecklistActionSchedule = Omit<ChecklistActionSchedule, keyof Realm.Object>;

export class ChecklistActionSchedule extends Object<ChecklistActionSchedule> {
  following?: string;
  period!: ChecklistActionSchedulePeriod;
  type!: ChecklistActionScheduleType;
  value!: number;
  state!: ChecklistActionScheduleState;

  static schema: ObjectSchema = {
    name: 'ChecklistActionSchedule',
    embedded: true,
    properties: {
      following: 'string?',
      period: 'string',
      type: 'string',
      value: 'int?',
      state: 'ChecklistActionScheduleState',
    },
  };
}

export class ChecklistActionScheduleState extends Object<ChecklistActionScheduleState> {
  text!: string;
  due!: ChecklistActionScheduleDue;

  static schema: ObjectSchema = {
    name: 'ChecklistActionScheduleState',
    embedded: true,
    properties: {
      text: 'string',
      due: 'ChecklistActionScheduleDue',
    },
  };
}

// Plain JS object type.
export type JChecklistActionScheduleDue = Omit<ChecklistActionScheduleDue, keyof Realm.Object>;

export class ChecklistActionScheduleDue extends Object<ChecklistActionScheduleDue> {
  now!: boolean;
  value!: number;
  units!: 'events' | 'days';

  static schema: ObjectSchema = {
    name: 'ChecklistActionScheduleDue',
    embedded: true,
    properties: {
      now: 'bool',
      value: 'int',
      units: 'string',
    },
  };
}

// Plain JS object type.
export type JChecklistActionHistoryEntry = Omit<ChecklistActionHistoryEntry, keyof Realm.Object>;

export class ChecklistActionHistoryEntry extends Object<ChecklistActionHistoryEntry> {
  refId!: string;
  date!: ISODateString;
  modelTime!: number;
  eventNumber!: number;
  cost?: number;

  static schema: ObjectSchema = {
    name: 'ChecklistActionHistoryEntry',
    embedded: true,
    properties: {
      refId: 'string',
      date: 'string',
      modelTime: 'int',
      eventNumber: 'int',
      cost: 'float?',
    },
  };
}
