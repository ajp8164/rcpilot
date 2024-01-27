import { BSON, Object, ObjectSchema } from 'realm';
import { ISODateString, ISODurationString } from 'types/common';

import { Battery } from 'realmdb/Battery';

export class BatteryCycle extends Object<BatteryCycle> {
  _id!: BSON.ObjectId;
  cycleNumber!: number;
  battery!: Battery;
  ignoreInPlots?: boolean;
  discharge?: BatteryDischarge;
  charge?: BatteryCharge;
  notes?: string;
  
  static schema: ObjectSchema = {
    name: 'BatteryCycle',
    properties: {
      _id: { type: 'objectId', default: () => new BSON.ObjectId() },
      cycleNumber: 'int',
      battery: 'Battery',
      ignoreInPlots: 'bool?',
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
  // “1P/1S ; 1P/2S ; 2P/1S ; 2P/2S”.
  cellVoltage?: number[];
  cellResistance?: number[];

  static schema: ObjectSchema = {
    name: 'BatteryCharge',
    embedded: true,
    properties: {
      date: 'string',
      amount: 'int?',
      packVoltage: 'float?',
      packResistance: 'flaot?',
      cellVoltage: 'float[]',
      cellResistance: 'float[]',
    },
  };
};

export class BatteryDischarge extends Object<BatteryDischarge> {
  date!: 'ISODateString;'
  duration!: ISODurationString;
  packVoltage?: number;
  packResistance?: number;
  // “1P/1S ; 1P/2S ; 2P/1S ; 2P/2S”.
  cellVoltage?: number[];
  cellResistance?: number[];

  static schema: ObjectSchema = {
    name: 'BatteryDischarge',
    embedded: true,
    properties: {
      date: 'string',
      duration: 'string',
      packVoltage: 'float',
      packResistance: 'float',
      cellVoltage: 'float[]',
      cellResistance: 'float[]',
    },
  };
};
