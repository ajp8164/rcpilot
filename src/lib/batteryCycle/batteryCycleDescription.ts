import {
  batteryCycleChargeData,
  batteryCycleDischargeData,
  batteryCycleStatisticsData
} from '.';

import { BatteryCycle } from 'realmdb/BatteryCycle';

export const batteryCycleDescription = (cycle: BatteryCycle) => {
  const d = batteryCycleDischargeData(cycle).string;
  const s = batteryCycleStatisticsData(cycle).string;

  const dischargeSummary = `${d.dischargeDate} - For ${d.dischargeDuration}, resting voltage ${d.dischargeRestingVoltage}`;
  const notes = cycle.notes ? `\n\n${cycle.notes}` : '';

  if (cycle.charge) {
    const c = batteryCycleChargeData(cycle).string;
    const chargeSummary = `${c.chargeDate} - Add ${c.chargeAmount} (${c.chargeToCapacityPercentage}), resting voltage ${c.chargeRestingVoltage}`;
    const statistics = `Averaged ${s.averageDischargeCurrent} per minute, about ${s.dischargeBy80Percent} to 80%`;
    return `D: ${dischargeSummary}\nC: ${chargeSummary}\nS: ${statistics}${notes}`;
  }
  return `D: ${dischargeSummary}\nC: No charge phase for this cycle${notes}`;
};
