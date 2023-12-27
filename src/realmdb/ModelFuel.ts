import Realm, { BSON, ObjectSchema } from 'realm';

export class ModelFuel extends Realm.Object<ModelFuel> {
  id!: BSON.ObjectId;
  name!: string;
  cost?: number;
  notes?: string;

  static schema: ObjectSchema = {
    name: 'ModelFuel',
    properties: {
      id: 'objectId',
      name: 'string',
      cost: 'float',
      notes: 'string',
    },
    primaryKey: 'id',
  };
};
