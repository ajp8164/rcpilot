import { BatteryCycle } from 'realmdb/BatteryCycle';

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
