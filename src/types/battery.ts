export enum BatteryChemistry {
  LiPo = 'LiPo',
  LiIon = 'LiIon',
  LiFe = 'LiFe',
  LiHV = 'LiHV',
  NiCd = 'NiCd',
  NiMH = 'NiMH',
  Other = 'Other',
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
