import { BSON, Object, ObjectSchema } from 'realm';

export class ModelCategory extends Object<ModelCategory> {
  _id!: BSON.ObjectId;
  name!: string;

  static schema: ObjectSchema = {
    name: 'ModelCategory',
    properties: {
      _id: { type: 'objectId', default: () => new BSON.ObjectId() },
      name: 'string',
    },
    primaryKey: '_id',
  };
}
