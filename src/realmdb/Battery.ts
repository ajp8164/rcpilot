import { BSON, Object, ObjectSchema } from 'realm';
import { BatteryChemistry, BatteryTint } from 'types/battery';
import { ISODateString, ScanCodeSize } from 'types/common';

import { BatteryCycle } from 'realmdb/BatteryCycle';

export class Battery extends Object<Battery> {
  _id!: BSON.ObjectId;
  createdOn!: ISODateString;
  updatedOn!: ISODateString;
  name!: string;
  chemistry!: BatteryChemistry;
  vendor?: string;
  purchasePrice?: number;
  retired?: boolean;
  inStorage?: boolean;
  cRating?: number;
  capacity?: number;
  sCells!: number;
  pCells!: number;
  cycles!: BatteryCycle[];
  totalCycles?: number;
  tint!: BatteryTint;
  scanCodeSize!: ScanCodeSize;
  notes?: string;

  static schema: ObjectSchema = {
    name: 'Battery',
    properties: {
      _id: { type: 'objectId', default: () => new BSON.ObjectId() },
      createdOn: 'string',
      updatedOn: 'string',
      name: 'string',
      chemistry: { type: 'string', default: BatteryChemistry.LiPo },
      vendor: 'string?',
      purchasePrice: 'float?',
      retired: { type: 'bool', default: false },
      inStorage: { type: 'bool', default: false },
      cRating: 'int?',
      capacity: 'int?',
      sCells: 'int',
      pCells: 'int',
      cycles: { type: 'list', objectType: 'BatteryCycle', default: [] },
      totalCycles: 'int?',
      tint: 'string',
      scanCodeSize: 'string',
      notes: 'string?',
    },
    primaryKey: '_id',
  };
}
