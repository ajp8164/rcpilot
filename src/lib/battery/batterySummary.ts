import { Battery } from 'realmdb/Battery';
import { DateTime } from 'luxon';

export const batterySummary = (battery: Battery) => {
  const capacity = `${battery.capacity}mAh`;
  const cells = `${battery.sCells}S/${battery.pCells}P`;
  const chemistry = battery.chemistry;
  const cycles = `${battery.totalCycles || 0} cycle${battery.totalCycles !== 1 ? 's' : ''}`;
  return `${capacity} ${cells} ${chemistry}\n${cycles}`;
};

export const batteryExtendedSummary = (battery: Battery) => {
  const summary = batterySummary(battery);
  const lastCycle = battery.cycles[battery.cycles.length - 1];
  const lastCycleInfo = lastCycle ? (
    lastCycle.charge
      ? `Charged on ${DateTime.fromISO(lastCycle.charge.date).toFormat('M/d/yyyy')}`
      : lastCycle.discharge
      ? `Discharged on ${DateTime.fromISO(lastCycle.discharge.date).toFormat('M/d/yyyy')}`
      : 'No cycles are logged'
  ) : 'No cycles are logged';
  
  return `${summary}\n${lastCycleInfo}`;
};
