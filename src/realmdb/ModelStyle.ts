import Realm, { BSON, ObjectSchema } from 'realm';

export class ModelStyle extends Realm.Object<ModelStyle> {
  id!: BSON.ObjectId;
  name!: string;

  static schema: ObjectSchema = {
    name: 'ModelStyle',
    properties: {
      id: 'objectId',
      name: 'string',
    },
    primaryKey: 'id',
  };
};
