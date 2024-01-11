import { BSON, Object, ObjectSchema } from 'realm';
import { ChecklistActionSchedulePeriod, ChecklistTemplateActionScheduleType, ChecklistTemplateType } from 'types/checklistTemplate';

export class ChecklistTemplate extends Object<ChecklistTemplate> {
  _id!: BSON.ObjectId;
  name!: string;
  type!: ChecklistTemplateType;
  // actions!: ChecklistAction[];
  actions!: Realm.List<ChecklistAction>;

  static schema: ObjectSchema = {
    name: 'ChecklistTemplate',
    properties: {
      _id: { type: 'objectId', default: () => new BSON.ObjectId() },
      name: 'string',
      type: 'string',
      actions: { type: 'list', objectType: 'ChecklistAction', default: [] },
      // actions: 'ChecklistAction[]',
    },
    primaryKey: '_id',
  };
};

export class ChecklistAction extends Object<ChecklistAction> {
  description!: string;
  schedule!: ChecklistActionSchedule;
  cost?: number;
  notes?: string;

  static schema: ObjectSchema = {
    name: 'ChecklistAction',
    embedded: true,
    properties: {
      description: 'string',
      schedule: 'ChecklistActionSchedule',
      cost: 'float?',
      notes: 'string?',
    },
  };
};

export class ChecklistActionSchedule extends Object<ChecklistActionSchedule> {
  period!: keyof typeof ChecklistActionSchedulePeriod;
  type!: ChecklistTemplateActionScheduleType;
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
