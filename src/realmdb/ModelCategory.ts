import Realm, { BSON, ObjectSchema } from 'realm';

export class ModelCategory extends Realm.Object<ModelCategory> {
  id!: BSON.ObjectId;
  name!: string;

  static schema: ObjectSchema = {
    name: 'ModelCategory',
    properties: {
      id: 'objectId',
      name: 'string',
    },
    primaryKey: 'id',
  };
};
