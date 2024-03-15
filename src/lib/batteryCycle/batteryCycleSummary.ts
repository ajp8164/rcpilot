import { Milliamps, MilliampsPerMinute, Seconds, Volts } from 'types/battery';

import { Battery } from 'realmdb/Battery';
import { BatteryCycle } from 'realmdb/BatteryCycle';
import { DateTime } from 'luxon';
import { ISODateString } from 'types/common';
import { secondsToMSS } from 'lib/formatters';

export type BatteryCycleStaticsticsData = {
  value: {
    averageDischargeCurrent?: MilliampsPerMinute; // The average discharge current over all full cycles
    dischargeBy80Percent?: Seconds; // Time to discharge battery by 80% of capacity
  },
  string: {
    averageDischargeCurrent: string;
    dischargeBy80Percent: string;
  }
};

export type BatteryDischargeData = {
  value: {
    dischargeDuration?: Seconds; // Duration of the discharge event
    dischargeRestingVoltage?: Volts; // The pack voltage after discharge
  },
  string: {
    dischargeDate: ISODateString;
    dischargeDuration: string;
    dischargeRestingVoltage: string;
  }
};

export type BatteryChargeData = {
  value: {
    chargeAmount?: Milliamps; // Total energy replaced during the charge phase
    chargeToCapacityPercentage?: number; // Percentage of capacity replaced (range 0-100)
    chargeToCapacity?: number; // Same as chargeToCapacityPercentage (range 0-1)
    chargeRestingVoltage?: Volts; // The pack voltage after charge
    averageCurrent?: Milliamps; // The average current delivered during the discharge phase of this cycle
    Cr?: number;
  },
  string: {
    chargeDate: string;
    chargeAmount: string;
    chargeToCapacityPercentage: string;
    chargeToCapacity?: string;
    chargeRestingVoltage: string;
    averageCurrent: string;
    Cr: string;
  },
};

export const batteryCycleTitle = (cycle: BatteryCycle) => {
  const kind = (cycle.charge && cycle.discharge) ? 'Full Cycle' : 'Partial Cycle (Discharge Only)';
  if (cycle.charge) {
    const d = batteryCycleChargeData(cycle).string;
    return `#${cycle.cycleNumber}: ${kind}, Avg Current ${d.averageCurrent} (${d.Cr})`;
  }
  return `#${cycle.cycleNumber}: ${kind}`;
};

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

export const batteryCycleStatisticsData = (cycle: BatteryCycle) => {
  let result: BatteryCycleStaticsticsData = {
    value: {},
    string: {
      averageDischargeCurrent:'',
      dischargeBy80Percent: '',
    }
  };

  const c = batteryCycleChargeData(cycle);

  if (cycle.discharge && cycle.charge) {
    const averageDischargeCurrent = cycle.battery.capacity! * c.value.chargeToCapacity! / (cycle.discharge?.duration / 60); // mA/min
    const dischargeBy80Percent = (cycle.discharge.duration / c.value.chargeToCapacity!) * 0.8; // Seconds

    result = {
      value: {
        averageDischargeCurrent,
        dischargeBy80Percent,
      },
      string: {
        averageDischargeCurrent: `${Math.trunc(averageDischargeCurrent)} mA`,
        dischargeBy80Percent: secondsToMSS(dischargeBy80Percent, {format: 'm:ss'}),
      },
    }
  }
  return result;
};

export const batteryCycleDischargeData = (cycle: BatteryCycle) => {
  let result: BatteryDischargeData = {
    value: {},
    string: {
      dischargeDate: '',
      dischargeDuration: '',
      dischargeRestingVoltage: '',
      // averageDischargeCurrent:'',
      // dischargeBy80Percent: '',
    }
  };

  if (cycle.discharge) {
    const dischargeDuration = cycle.discharge.duration; // Seconds
    const dischargeRestingVoltage = cycle.discharge.packVoltage; // Volts
    // const averageDischargeCurrent = cycle.battery.capacity! / (cycle.discharge?.duration / 60); // mA/min
    // const dischargeBy80Percent = cycle.discharge.duration * 0.8; // Seconds
  
    result = {
      value: {
        dischargeDuration,
        dischargeRestingVoltage,
        // averageDischargeCurrent,
        // dischargeBy80Percent,
      },
      string: {
        dischargeDate: DateTime.fromISO(cycle.discharge.date).toFormat('d/M/yy'),
        dischargeDuration: secondsToMSS(dischargeDuration, {format: 'm:ss'}),
        dischargeRestingVoltage: dischargeRestingVoltage ? `${dischargeRestingVoltage}V` : 'unknown',
        // averageDischargeCurrent: `${averageDischargeCurrent} mA`,
        // dischargeBy80Percent: secondsToMSS(dischargeBy80Percent, {format: 'm:ss'}),
      },
    }
  }
  return result;
};

export const batteryCycleChargeData = (cycle: BatteryCycle) => {
  let result: BatteryChargeData = {
    value: {},
    string: {
      chargeDate: '',
      chargeAmount: '',
      chargeToCapacityPercentage: '',
      chargeRestingVoltage: '',
      Cr: '',
      averageCurrent: '',
    },
  };

  // Battery Charged to some amount relative to it's capacity.
  // E.g. 1000 mAh battery charged to 500 mAh has 50% capacity.
  const chargeToCapacity = cycle.charge?.amount! / cycle.battery.capacity!;

  // See https://www.batteriesinaflash.com/c-rating-calculator
  // Cr = 60mins / discharge-time, (discharge-time in mins)
  const Cr = Math.round(60 / (cycle.discharge!.duration / 60) * chargeToCapacity); // C rating
  const averageCurrent = cycle.battery.capacity! * Cr; // mA

  if (cycle.charge) {
    result = {
      value: {
        chargeAmount: cycle.charge.amount!,
        chargeToCapacityPercentage: cycle.charge.amount! / cycle.battery.capacity! * 100,
        chargeToCapacity,
        chargeRestingVoltage: cycle.charge.packVoltage,
        Cr,
        averageCurrent,
      },
      string: {
        chargeDate: DateTime.fromISO(cycle.charge.date).toFormat('d/M/yy'),
        chargeAmount: `${cycle.charge.amount}mA`,
        chargeToCapacityPercentage: `${cycle.charge.amount! / cycle.battery.capacity! * 100}%`,
        chargeToCapacity: `${chargeToCapacity}`,
        chargeRestingVoltage: cycle.charge.packVoltage ? `${cycle.charge.packVoltage}V` : 'unknown',
        Cr: `${Cr}C`,
        averageCurrent: `${averageCurrent / 1000}A`,
      },
    }
  }
  return result;
};
