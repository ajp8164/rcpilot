import { DurationString, ISODateString } from "types/common";

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
  chemistry: BatteryChemistry;
  cellConfiguration: number[];
};

export type BatteryCycle = {
  id: string;
  cycleNumber: number;
  batteryId: string;
  ignoreInPlots: boolean;
  discharge: {
    date: ISODateString;
    duration: DurationString;
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
