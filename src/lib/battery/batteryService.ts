import { BatteryCellArchitecture, BatteryChemistry } from "types/battery";
import { batterySCellConfigurationItems, batterySPCellConfigurationItems } from "lib/battery";

import { Battery } from "realmdb/Battery";

const getBatteryCellArchitecture = (chemistry: BatteryChemistry): BatteryCellArchitecture => {
  if (
    chemistry.includes(BatteryChemistry.NiCd) ||
    chemistry.includes(BatteryChemistry.NiMH)
  ) {
    return BatteryCellArchitecture.SeriesCells;
  } else {
    return BatteryCellArchitecture.SeriesParallelCells;
  }
};

export const batteryCellConfigurationToString = (
  chemistry: BatteryChemistry,
  cellConfiguration: string[] | number[],
) => {
  const sCells = typeof cellConfiguration[0] === 'string' ? parseInt(cellConfiguration[0]) : cellConfiguration[0];
  const pCells = typeof cellConfiguration[1] === 'string' ? parseInt(cellConfiguration[1]) : cellConfiguration[1];
  if (getBatteryCellArchitecture(chemistry) === BatteryCellArchitecture.SeriesParallelCells) {
    const series =
      sCells > 0
        ? batterySPCellConfigurationItems[0][Number(sCells) - 1].labelShort || ''
        : '';
    const parallel =
      pCells > 0
        ? batterySPCellConfigurationItems[1][Number(pCells) - 1].labelShort || ''
        : '';

    return `${series}${parallel.length > 0 ? ' / ' : ''}${parallel}`;
  } else {
    return batterySCellConfigurationItems[Number(sCells) - 1].label;
  }
};

export const getBatteryCellConfigurationItems = (chemistry: BatteryChemistry) => {
  if (getBatteryCellArchitecture(chemistry) === BatteryCellArchitecture.SeriesParallelCells) {
    return batterySPCellConfigurationItems;
  } else {
    return batterySCellConfigurationItems;
  }
};

export const batteryIsCharged = (battery: Battery) => {
  return battery.cycles[battery.cycles.length - 1]?.charge || !battery.cycles.length;
};
