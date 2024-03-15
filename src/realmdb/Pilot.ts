import { BSON, Object, ObjectSchema } from 'realm';

import { Event } from 'realmdb/Event';
import { ISODateString } from 'types/common';
import { Model } from 'realmdb/Model';

export class Pilot extends Object<Pilot> {
  _id!: BSON.ObjectId;
  createdOn!: ISODateString;
  updatedOn!: ISODateString;
  name!: string;
  unknownPilot!: boolean;
  favoriteModels: Model[] = [];
  achievements: Achievement[] = [];

  static schema: ObjectSchema = {
    name: 'Pilot',
    properties: {
      _id: { type: 'objectId', default: () => new BSON.ObjectId() },
      createdOn: 'string',
      updatedOn: 'string',
      name: 'string',
      unknownPilot: { type: 'bool', default: false },
      favoriteModels: { type: 'list', objectType: 'Model', default: [] },
      achievements: { type: 'list', objectType: 'Achievement', default: [] },
    },
    primaryKey: '_id',
  };
};

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
};
