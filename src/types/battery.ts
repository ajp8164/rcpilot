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
