import { BSON, Object, ObjectSchema } from 'realm';

export class EventStyle extends Object<EventStyle> {
  _id!: BSON.ObjectId;
  name!: string;

  static schema: ObjectSchema = {
    name: 'EventStyle',
    properties: {
      _id: { type: 'objectId', default: () => new BSON.ObjectId() },
      name: 'string',
    },
    primaryKey: '_id',
  };
};
