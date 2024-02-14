export type ListBatteries = 'all' | 'retired' | 'in-storage';

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

export type BatteryTemplate = {
  capacity?: number;
  chemistry?: BatteryChemistry;
  cRating?: number;
  name?: string;
  pCells?: number;
  sCells?: number;
  tint?: string;
  vendor?: string;
};
