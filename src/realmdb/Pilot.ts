import { BSON, Object, ObjectSchema } from 'realm';

import { Model } from 'realmdb/Model';

export class Pilot extends Object<Pilot> {
  _id!: BSON.ObjectId;
  name!: string;
  favoriteModels: Model[] = [];

  static schema: ObjectSchema = {
    name: 'Pilot',
    properties: {
      _id: { type: 'objectId', default: () => new BSON.ObjectId() },
      name: 'string',
      favoriteModels: { type: 'list', objectType: 'Model', default: () => [] }
    },
    primaryKey: '_id',
  };
};
