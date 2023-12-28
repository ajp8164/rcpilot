import { BSON, Object, ObjectSchema } from 'realm';

import { BatteryChemistry } from 'types/battery';
import { ISODateString } from 'types/common';

export class Battery extends Object<Battery> {
  _id!: BSON.ObjectId;
  name!: string;
  chemistry!: BatteryChemistry;
  vendor?: string;
  purchasePrice?: number;
  retired?: boolean;
  inStorage?: boolean;
  cRating?: number;
  capacity?: number;
  sCells?: number;
  pCells?: number;
  totalCycles?: number;
  lastCycle?: ISODateString;
  notes?: string;

  static schema: ObjectSchema = {
    name: 'Battery',
    properties: {
      _id: { type: 'objectId', default: () => new BSON.ObjectId() },
      name: 'string',
      chemistry: { type: 'string', default: BatteryChemistry.LiPo },
      vendor: 'string',
      purchasePrice: 'float',
      retired: { type: 'bool', default: false },
      inStorage: { type: 'bool', default: false },
      cRating: 'int',
      capacity: 'int',
      sCells: 'int',
      pCells: 'int',
      totalCycles: 'int',
      lastCycle: 'string',
      notes: 'string',
    },
    primaryKey: '_id',
  };
};
