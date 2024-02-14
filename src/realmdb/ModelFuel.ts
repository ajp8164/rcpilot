import { BSON, Object, ObjectSchema } from 'realm';

import { ISODateString } from 'types/common';

export class ModelFuel extends Object<ModelFuel> {
  _id!: BSON.ObjectId;
  createdOn!: ISODateString;
  updatedOn!: ISODateString;
  name!: string;
  cost?: number;
  notes?: string;

  static schema: ObjectSchema = {
    name: 'ModelFuel',
    properties: {
      _id: { type: 'objectId', default: () => new BSON.ObjectId() },
      createdOn: 'string',
      updatedOn: 'string',
      name: 'string',
      cost: 'float?',
      notes: 'string?',
    },
    primaryKey: '_id',
  };
};
