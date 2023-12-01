import { ISODateString, ISODurationString } from "types/common";

export enum BatteryChemistry {
  LiPo = 'LiPo',
  LiIon = 'LiIon',
  LiFe = 'LiFe',
  LiHV = 'LiHV',
  NiCd = 'NiCd',
  NiMH = 'NiMH',
  Other = 'Other',
}

export enum BatteryTint {
  Red = 'Red',
  Orange = 'Orange',
  Green = 'Green',
  Cyan = 'Cyan',
  Blue = 'Blue',
  Violet = 'Violet',
  None = 'None',
}

export enum BatteryCellArchitecture {
  SeriesCells = 'SeriesCells',
  SeriesParallelCells = 'SeriesParallelCells',
}

export type Battery = {
  id: string;
  name: string;
  chemistry: BatteryChemistry;
  vendor: string;
  purchasePrice: number;
  retired:  boolean;
  inStorage: boolean;
  cRating: number;
  capacity: number;
  sCells: number;
  pCells: number;
  totalCycles: number;
  lastCycle: ISODateString;
  notes: string;
};

export type BatteryCycle = {
  id: string;
  cycleNumber: number;
  batteryId: string;
  ignoreInPlots: boolean;
  discharge: {
    date: ISODateString;
    duration: ISODurationString;
    packVoltage: number;
    packResistance: number;
    // “1P/1S ; 1P/2S ; 2P/1S ; 2P/2S”.
    cellVoltage: number[];
    cellResisance: number[];
  },
  charge: {
    date: ISODateString;
    amount: number; 
    packVoltage: number;
    packResistance: number;
    // “1P/1S ; 1P/2S ; 2P/1S ; 2P/2S”.
    cellVoltage: number[];
    cellResisance: number[];
  },
  notes: string;
};
