import { ISODateString } from '@react-native-hello/common';
import { BSON, Object, ObjectSchema } from 'realm';

export type LocationKind = 'club' | 'user';

export class Location extends Object<Location> {
  _id!: BSON.ObjectId;
  createdOn!: ISODateString;
  updatedOn!: ISODateString;
  name!: string;
  kind!: LocationKind;
  coords!: LocationCoords;
  notes?: string;

  static schema: ObjectSchema = {
    name: 'Location',
    properties: {
      _id: { type: 'objectId', default: () => new BSON.ObjectId() },
      createdOn: 'string',
      updatedOn: 'string',
      name: 'string',
      kind: { type: 'string', default: 'user' },
      coords: 'LocationCoords',
      notes: 'string?',
    },
    primaryKey: '_id',
  };
}

export class LocationCoords extends Object<LocationCoords> {
  latitude!: number;
  longitude!: number;

  static schema: ObjectSchema = {
    name: 'LocationCoords',
    embedded: true,
    properties: {
      latitude: 'double',
      longitude: 'double',
    },
  };
}
