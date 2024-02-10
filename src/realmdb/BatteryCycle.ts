import { Object, ObjectSchema } from 'realm';

import { ISODateString } from 'types/common';

export class BatteryCycle extends Object<BatteryCycle> {
  cycleNumber!: number;
  excludeFromPlots?: boolean;
  discharge?: BatteryDischarge;
  charge?: BatteryCharge;
  notes?: string;
  
  static schema: ObjectSchema = {
    name: 'BatteryCycle',
    embedded: true,
    properties: {
      cycleNumber: 'int',
      excludeFromPlots: 'bool?',
      discharge: 'BatteryDischarge?',
      charge: 'BatteryCharge?',
      notes: 'string?',
    },
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
  date!: ISODateString;
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
