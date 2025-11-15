import { ISODateString } from '@react-native-hello/common';
import { BSON, Object, ObjectSchema } from 'realm';
import { Location } from 'realmdb';

import { Address } from './Address';

export class Club extends Object<Club> {
  _id!: BSON.ObjectId;
  createdOn!: ISODateString;
  updatedOn!: ISODateString;
  name!: string;
  briefDescription!: string;
  location?: Location;
  websiteUrl!: string;
  keyFeatures!: string;
  address!: Address;
  amaChartered!: boolean;
  driving!: boolean;
  flying!: boolean;
  boating!: boolean;

  static schema: ObjectSchema = {
    name: 'Club',
    properties: {
      _id: { type: 'objectId', default: () => new BSON.ObjectId() },
      createdOn: 'string',
      updatedOn: 'string',
      name: 'string',
      briefDescription: 'string',
      location: 'Location?',
      websiteUrl: 'string',
      keyFeatures: 'string',
      address: 'Address',
      amaChartered: { type: 'bool', default: false },
      driving: { type: 'bool', default: false },
      flying: { type: 'bool', default: false },
      boating: { type: 'bool', default: false },
    },
    primaryKey: '_id',
  };
}
