import { BatteryCellArchitecture, BatteryChemistry } from "types/battery";

import { ExtendedWheelPickerItem } from "types/wheelPicker";
import { WheelPickerItem } from "components/atoms/WheelPicker";

export const batterySCellConfigurationItems: WheelPickerItem[] = [
  { label: '1 Cell', value: '1' },
  { label: '2 Cells', value: '2' },
  { label: '3 Cells', value: '3' },
  { label: '4 Cells', value: '4' },
  { label: '5 Cells', value: '5' },
  { label: '6 Cells', value: '6' },
  { label: '7 Cells', value: '7' },
  { label: '8 Cells', value: '8' },
  { label: '9 Cells', value: '9' },
  { label: '10 Cells', value: '10' },
  { label: '11 Cells', value: '11' },
  { label: '12 Cells', value: '12' },
];

export const batterySPCellConfigurationItems: ExtendedWheelPickerItem[][] = [
  [
    { label: '1 Series', labelShort: '1S', value: '1' },
    { label: '2 Series', labelShort: '2S', value: '2' },
    { label: '3 Series', labelShort: '3S', value: '3' },
    { label: '4 Series', labelShort: '4S', value: '4' },
    { label: '5 Series', labelShort: '5S', value: '5' },
    { label: '6 Series', labelShort: '6S', value: '6' },
    { label: '7 Series', labelShort: '7S', value: '7' },
    { label: '8 Series', labelShort: '8S', value: '8' },
    { label: '9 Series', labelShort: '9S', value: '9' },
    { label: '10 Series', labelShort: '10S', value: '10' },
    { label: '11 Series', labelShort: '11S', value: '11' },
    { label: '12 Series', labelShort: '12S', value: '12' },
  ],
  [
    { label: 'None', labelShort: '', value: '1' },
    { label: '2 Parallel', labelShort: '2P', value: '2' },
    { label: '3 Parallel', labelShort: '3P', value: '3' },
    { label: '4 Parallel', labelShort: '4P', value: '4' },
    { label: '5 Parallel', labelShort: '5P', value: '5' },
    { label: '6 Parallel', labelShort: '6P', value: '6' },
    { label: '7 Parallel', labelShort: '7P', value: '7' },
    { label: '8 Parallel', labelShort: '8P', value: '8' },
    { label: '9 Parallel', labelShort: '9P', value: '9' },
    { label: '10 Parallel', labelShort: '10P', value: '10' },
    { label: '11 Parallel', labelShort: '11P', value: '11' },
    { label: '12 Parallel', labelShort: '12P', value: '12' },
  ],
];

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
