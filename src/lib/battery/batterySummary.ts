import { Battery } from 'realmdb/Battery';

export const batterySummary = (battery: Battery) => {
  const capacity = `${battery.capacity}mAh`;
  const cells = `${battery.sCells}S/${battery.pCells}P`;
  const chemistry = battery.chemistry;
  const cycles = `${battery.totalCycles || 0} cycles`;
  return `${capacity} ${cells} ${chemistry}\n${cycles}`;
};
