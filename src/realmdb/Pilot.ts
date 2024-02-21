import { BSON, Object, ObjectSchema } from 'realm';

import { ISODateString } from 'types/common';
import { Model } from 'realmdb/Model';

export class Pilot extends Object<Pilot> {
  _id!: BSON.ObjectId;
  createdOn!: ISODateString;
  updatedOn!: ISODateString;
  name!: string;
  favoriteModels: Model[] = [];

  static schema: ObjectSchema = {
    name: 'Pilot',
    properties: {
      _id: { type: 'objectId', default: () => new BSON.ObjectId() },
      createdOn: 'string',
      updatedOn: 'string',
      name: 'string',
      favoriteModels: { type: 'list', objectType: 'Model', default: [] }
    },
    primaryKey: '_id',
  };
};
