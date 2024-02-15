import { BSON, Object, ObjectSchema } from 'realm';

import { ChecklistAction } from './Checklist';
import { ChecklistType } from 'types/checklist';

export class ChecklistTemplate extends Object<ChecklistTemplate> {
  _id!: BSON.ObjectId;
  name!: string;
  type!: ChecklistType;
  actions!: Realm.List<ChecklistAction>;

  static schema: ObjectSchema = {
    name: 'ChecklistTemplate',
    properties: {
      _id: { type: 'objectId', default: () => new BSON.ObjectId() },
      name: 'string',
      type: 'string',
      actions: { type: 'list', objectType: 'ChecklistAction', default: [] },
    },
    primaryKey: '_id',
  };
};
