import { BatteryCycle } from 'realmdb/BatteryCycle';
import { batteryCycleChargeData } from '.';

export const batteryCycleTitle = (cycle: BatteryCycle) => {
  const kind = (cycle.charge && cycle.discharge) ? 'Full Cycle' : 'Partial Cycle (Discharge Only)';
  if (cycle.charge) {
    const d = batteryCycleChargeData(cycle).string;
    return `#${cycle.cycleNumber}: ${kind}, Avg Current ${d.averageCurrent} (${d.Cr})`;
  }
  return `#${cycle.cycleNumber}: ${kind}`;
};
