import { Battery, BatteryCellArchitecture, BatteryChemistry } from "types/battery";
import { batterySCellConfigurationItems, batterySPCellConfigurationItems } from "lib/battery";

const getBatteryCellArchitecture = (battery: Battery): BatteryCellArchitecture => {
  if (
    battery.chemistry.includes(BatteryChemistry.NiCd) ||
    battery.chemistry.includes(BatteryChemistry.NiMH)
  ) {
    return BatteryCellArchitecture.SeriesCells;
  } else {
    return BatteryCellArchitecture.SeriesParallelCells;
  }
};

export const batteryCellConfigurationToString = (battery: Battery) => {
  const value = battery.cellConfiguration;
  if (value) {
    if (getBatteryCellArchitecture(battery) === BatteryCellArchitecture.SeriesParallelCells) {
      const s = value[0];
      const p = value[1];
      const series =
        s > 0
          ? batterySPCellConfigurationItems[0][Number(s) - 1].labelShort || ''
          : '';
      const parallel =
        p > 0
          ? batterySPCellConfigurationItems[1][Number(p) - 1].labelShort || ''
          : '';

      return `${series}${parallel.length > 0 ? ' / ' : ''}${parallel}`;
    } else {
      const s = value[0];
      return batterySCellConfigurationItems[Number(s) - 1].label;
    }
  }
  return '';
};

export const getBatteryCellConfigurationItems = (battery: Battery) => {
  if (getBatteryCellArchitecture(battery) === BatteryCellArchitecture.SeriesParallelCells) {
    return batterySPCellConfigurationItems;
  } else {
    return batterySCellConfigurationItems;
  }
};
