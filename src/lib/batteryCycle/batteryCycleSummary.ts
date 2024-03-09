import { Battery } from 'realmdb/Battery';
import { BatteryCycle } from 'realmdb/BatteryCycle';
import { DateTime } from 'luxon';

export const batteryCycleTitle = (cycle: BatteryCycle) => {
  const kind = (cycle.charge && cycle.discharge) ? 'Full Cycle' : 'Partial Cycle (Discharge Only)';
  const averageCurrent = 'Average Current ?A';
  const cRating = (cycle.battery?.cRating && cycle.battery.cRating > 0) ? `(${cycle.battery.cRating}C)` : '';
  // return `#${cycle.cycleNumber} ${kind}, ${averageCurrent} ${cRating}`;
  return `#${cycle.cycleNumber}: ${kind}`;
};

export const batteryCycleDescription = (cycle: BatteryCycle) => {
  const averageCurrent = 'Average Current ?A';
  const cRating = (cycle.battery?.cRating && cycle.battery.cRating > 0) ? `(${cycle.battery.cRating}C)` : '';
  const notes = cycle.notes ? `\n\n${cycle.notes}` : '';
  return `${averageCurrent} ${cRating}\nD:\nC:\nS:${notes}`;
};


export const batteryCycleSummary = (battery: Battery) => {
  const lastCycle = battery?.cycles[battery.cycles.length - 1];
  const isCharged = battery?.cycles[battery.cycles.length - 1]?.charge || !battery?.cycles.length;

  const lastCycleDate = lastCycle
    ? isCharged
      ? `${DateTime.fromISO(lastCycle.charge!.date).toFormat('M/d/yyyy')} (charge)`
      : `${DateTime.fromISO(lastCycle.discharge!.date).toFormat('M/d/yyyy')} (discharge)`
    : 'none'

  const cRating = `${battery.cRating}mAh`;
  const configuration = `{battery.sCells}S/${battery.pCells}P`;
  const chemistry = battery.chemistry;
  const cycles = `${battery.cycles.length} cycles`;
  const last = `Last: ${lastCycleDate}`;
  return `${cRating}, ${configuration} ${chemistry}, ${cycles}\n${last}`;
};
