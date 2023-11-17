import { ISODateString } from "types/common";

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
  number: number;
  date: ISODateString;
};
