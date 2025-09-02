import { BSON, Object, ObjectSchema } from 'realm';
import { Event } from 'realmdb/Event';
import { Model } from 'realmdb/Model';
import { ISODateString } from 'types/common';

export class Commander extends Object<Commander> {
  _id!: BSON.ObjectId;
  createdOn!: ISODateString;
  updatedOn!: ISODateString;
  name!: string;
  unknownCommander!: boolean;
  favoriteModels: Model[] = [];
  achievements: Achievement[] = [];

  static schema: ObjectSchema = {
    name: 'Commander',
    properties: {
      _id: { type: 'objectId', default: () => new BSON.ObjectId() },
      createdOn: 'string',
      updatedOn: 'string',
      name: 'string',
      unknownCommander: { type: 'bool', default: false },
      favoriteModels: { type: 'list', objectType: 'Model', default: [] },
      achievements: { type: 'list', objectType: 'Achievement', default: [] },
    },
    primaryKey: '_id',
  };
}

export class Achievement extends Object<Achievement> {
  date!: ISODateString;
  name!: string;
  event!: Event;

  static schema: ObjectSchema = {
    name: 'Achievement',
    embedded: true,
    properties: {
      date: 'string',
      name: 'string',
      event: 'Event',
    },
  };
}
