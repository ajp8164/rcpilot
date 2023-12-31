import { BSON, Object, ObjectSchema } from 'realm';

export class ModelFuel extends Object<ModelFuel> {
  _id!: BSON.ObjectId;
  name!: string;
  cost?: number;
  notes?: string;

  static schema: ObjectSchema = {
    name: 'ModelFuel',
    properties: {
      _id: { type: 'objectId', default: () => new BSON.ObjectId() },
      name: 'string',
      cost: 'float?',
      notes: 'string?',
    },
    primaryKey: '_id',
  };
};
