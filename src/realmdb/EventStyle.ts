import { BSON, Object, ObjectSchema } from 'realm';
import { ISODateString } from 'types/common';

export class EventStyle extends Object<EventStyle> {
  _id!: BSON.ObjectId;
  createdOn!: ISODateString;
  updatedOn!: ISODateString;
  name!: string;

  static schema: ObjectSchema = {
    name: 'EventStyle',
    properties: {
      _id: { type: 'objectId', default: () => new BSON.ObjectId() },
      createdOn: 'string',
      updatedOn: 'string',
      name: 'string',
    },
    primaryKey: '_id',
  };
}
