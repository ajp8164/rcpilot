import { Battery } from 'realmdb/Battery';
import { DateTime } from 'luxon';

export const batteryCycleSummary = (battery: Battery) => {
  const lastCycle = battery?.cycles[battery.cycles.length - 1];
  const isCharged = battery?.cycles[battery.cycles.length - 1]?.charge || !battery?.cycles.length;

  const lastCycleDate = lastCycle
    ? isCharged
      ? `${DateTime.fromISO(lastCycle.charge!.date).toFormat('M/d/yyyy')} (charge)`
      : `${DateTime.fromISO(lastCycle.discharge!.date).toFormat('M/d/yyyy')} (discharge)`
    : 'none'

  const capacity = `${battery.capacity}mAh`;
  const configuration = `${battery.sCells}S/${battery.pCells}P`;
  const chemistry = battery.chemistry;
  const cycles = `${battery.cycles.length} cycle${battery.cycles.length !== 1 ? 's' : ''}`;
  const last = `Last: ${lastCycleDate}`;
  return `${capacity}, ${configuration} ${chemistry}, ${cycles}\n${last}`;
};
