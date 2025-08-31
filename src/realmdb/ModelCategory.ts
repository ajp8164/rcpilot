import { BSON, Object, ObjectSchema } from 'realm';
import { ISODateString } from 'types/common';

export class ModelCategory extends Object<ModelCategory> {
  _id!: BSON.ObjectId;
  createdOn!: ISODateString;
  updatedOn!: ISODateString;
  name!: string;

  static schema: ObjectSchema = {
    name: 'ModelCategory',
    properties: {
      _id: { type: 'objectId', default: () => new BSON.ObjectId() },
      createdOn: 'string',
      updatedOn: 'string',
      name: 'string',
    },
    primaryKey: '_id',
  };
}
