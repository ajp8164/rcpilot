import { BSON, Object, ObjectSchema } from 'realm';

import { Battery } from 'realmdb/Battery';
import { ISODateString } from 'types/common';

export class BatteryCycle extends Object<BatteryCycle> {
  _id!: BSON.ObjectId;
  cycleNumber!: number;
  battery!: Battery;
  excludeFromPlots?: boolean;
  discharge?: BatteryDischarge;
  charge?: BatteryCharge;
  notes?: string;
  
  static schema: ObjectSchema = {
    name: 'BatteryCycle',
    properties: {
      _id: { type: 'objectId', default: () => new BSON.ObjectId() },
      cycleNumber: 'int',
      battery: 'Battery',
      excludeFromPlots: 'bool?',
      discharge: 'BatteryDischarge?',
      charge: 'BatteryCharge?',
      notes: 'string?',
    },
    primaryKey: '_id',
  };
};

export class BatteryCharge extends Object<BatteryCharge> {
  date!: ISODateString;
  amount?: number; 
  packVoltage?: number;
  packResistance?: number;
  // Ordering P first then S: 1P/1S, 1P/2S, 2P/1S, 2P/2S...
  cellVoltage!: number[];
  cellResistance!: number[];

  static schema: ObjectSchema = {
    name: 'BatteryCharge',
    embedded: true,
    properties: {
      date: 'string',
      amount: 'int?',
      packVoltage: 'float?',
      packResistance: 'float?',
      cellVoltage: 'float[]',
      cellResistance: 'float[]',
    },
  };
};

export class BatteryDischarge extends Object<BatteryDischarge> {
  date!: 'ISODateString;'
  duration!: number;
  packVoltage?: number;
  packResistance?: number;
  // Ordering P first then S: 1P/1S, 1P/2S, 2P/1S, 2P/2S...
  cellVoltage!: number[];
  cellResistance!: number[];

  static schema: ObjectSchema = {
    name: 'BatteryDischarge',
    embedded: true,
    properties: {
      date: 'string',
      duration: 'int',
      packVoltage: 'float?',
      packResistance: 'float?',
      cellVoltage: 'float[]',
      cellResistance: 'float[]',
    },
  };
};
