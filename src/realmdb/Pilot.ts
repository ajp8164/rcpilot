import { BSON, Object, ObjectSchema } from 'realm';

export class Pilot extends Object<Pilot> {
  _id!: BSON.ObjectId;
  name!: string;

  static schema: ObjectSchema = {
    name: 'Pilot',
    properties: {
      _id: { type: 'objectId', default: () => new BSON.ObjectId() },
      name: 'string',
    },
    primaryKey: '_id',
  };
};
