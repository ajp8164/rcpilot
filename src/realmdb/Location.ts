import { BSON, Object, ObjectSchema } from 'realm';

import { ISODateString } from 'types/common';

export class Location extends Object<Location> {
  _id!: BSON.ObjectId;
  createdOn!: ISODateString;
  updatedOn!: ISODateString;
  name!: string;
  position!: LocationPosition;
  notes?: string;

  static schema: ObjectSchema = {
    name: 'Location',
    properties: {
      _id: { type: 'objectId', default: () => new BSON.ObjectId() },
      createdOn: 'string',
      updatedOn: 'string',
      name: 'string',
      position: 'LocationPosition',
      notes: 'string?',
    },
    primaryKey: '_id',
  };
};

export class LocationPosition extends Object<LocationPosition> {
  latitude!: number;
  longitude!: number;

  static schema: ObjectSchema = {
    name: 'LocationPosition',
    embedded: true,
    properties: {
      latitude: 'float',
      longitude: 'float',
    },
  };
};
