import { BSON, Object, ObjectSchema } from 'realm';

import { ISODateString } from 'types/common';
import { LocationPosition } from 'types/location';

export class Location extends Object<Location> {
  _id!: BSON.ObjectId;
  createdOn!: ISODateString;
  updatedOn!: ISODateString;
  name!: string;
  position!: LocationPosition;
  notes?: string;

  static schema: ObjectSchema = {
    name: 'Event',
    properties: {
      _id: { type: 'objectId', default: () => new BSON.ObjectId() },
      createdOn: 'string',
      updatedOn: 'string',
      position: 'LocationPosition',
      notes: 'string?',
    },
    primaryKey: '_id',
  };
};
