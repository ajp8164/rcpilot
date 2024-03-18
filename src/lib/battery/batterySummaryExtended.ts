import { Battery } from 'realmdb/Battery';
import { DateTime } from 'luxon';
import { batterySummary } from '.';

export const batterySummaryExtended = (battery: Battery) => {
  const summary = batterySummary(battery);
  const lastCycle = battery.cycles[battery.cycles.length - 1];
  const lastCycleInfo = lastCycle
    ? lastCycle.charge
      ? `Charged on ${DateTime.fromISO(lastCycle.charge.date).toFormat('M/d/yyyy')}`
      : lastCycle.discharge
        ? `Discharged on ${DateTime.fromISO(lastCycle.discharge.date).toFormat('M/d/yyyy')}`
        : 'No cycles are logged'
    : 'No cycles are logged';

  return `${summary}\n${lastCycleInfo}`;
};
