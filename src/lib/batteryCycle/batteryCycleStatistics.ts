import { Milliamps, MilliampsPerMinute, Seconds, Volts } from 'types/battery';

import { BatteryCycle } from 'realmdb/BatteryCycle';
import { DateTime } from 'luxon';
import { ISODateString } from 'types/common';
import { secondsToFormat } from 'lib/formatters';

export type BatteryCycleStaticsticsData = {
  value: {
    averageDischargeCurrent?: MilliampsPerMinute; // The average discharge current over all full cycles
    dischargeBy80Percent?: Seconds; // Time to discharge battery by 80% of capacity
  };
  string: {
    averageDischargeCurrent: string;
    dischargeBy80Percent: string;
  };
};

export type BatteryDischargeData = {
  value: {
    dischargeDuration?: Seconds; // Duration of the discharge event
    dischargeRestingVoltage?: Volts; // The pack voltage after discharge
  };
  string: {
    dischargeDate: ISODateString;
    dischargeDuration: string;
    dischargeRestingVoltage: string;
  };
};

export type BatteryChargeData = {
  value: {
    chargeAmount?: Milliamps; // Total energy replaced during the charge phase
    chargeToCapacityPercentage?: number; // Percentage of capacity replaced (range 0-100)
    chargeToCapacity?: number; // Same as chargeToCapacityPercentage (range 0-1)
    chargeRestingVoltage?: Volts; // The pack voltage after charge
    averageCurrent?: Milliamps; // The average current delivered during the discharge phase of this cycle
    Cr?: number;
  };
  string: {
    chargeDate: string;
    chargeAmount: string;
    chargeToCapacityPercentage: string;
    chargeToCapacity?: string;
    chargeRestingVoltage: string;
    averageCurrent: string;
    Cr: string;
  };
};

export const batteryCycleStatisticsData = (cycle: BatteryCycle) => {
  let result: BatteryCycleStaticsticsData = {
    value: {},
    string: {
      averageDischargeCurrent: '',
      dischargeBy80Percent: '',
    },
  };

  const c = batteryCycleChargeData(cycle);

  if (cycle.discharge && cycle.charge) {
    const averageDischargeCurrent =
      cycle.battery.capacity && c.value.chargeToCapacity
        ? (cycle.battery.capacity * c.value.chargeToCapacity) / (cycle.discharge?.duration / 60) // mA/min
        : 0;
    const dischargeBy80Percent = c.value.chargeToCapacity
      ? (cycle.discharge.duration / c.value.chargeToCapacity) * 0.8 // Seconds
      : 0;

    result = {
      value: {
        averageDischargeCurrent,
        dischargeBy80Percent,
      },
      string: {
        averageDischargeCurrent: `${Math.trunc(averageDischargeCurrent)} mA`,
        dischargeBy80Percent: secondsToFormat(dischargeBy80Percent, { format: 'm:ss' }),
      },
    };
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
    },
  };

  if (cycle.discharge) {
    const dischargeDuration = cycle.discharge.duration; // Seconds
    const dischargeRestingVoltage = cycle.discharge.packVoltage; // Volts

    result = {
      value: {
        dischargeDuration,
        dischargeRestingVoltage,
      },
      string: {
        dischargeDate: DateTime.fromISO(cycle.discharge.date).toFormat('M/d/yy'),
        dischargeDuration: secondsToFormat(dischargeDuration, { format: 'm:ss' }),
        dischargeRestingVoltage: dischargeRestingVoltage
          ? `${dischargeRestingVoltage.toFixed(1)}V`
          : 'unknown',
      },
    };
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
  const chargeToCapacity =
    cycle.charge?.amount && cycle.battery.capacity
      ? cycle.charge.amount / cycle.battery.capacity
      : 0;

  // See https://www.batteriesinaflash.com/c-rating-calculator
  // Cr = 60mins / discharge-time, (discharge-time in mins)
  const Cr = cycle.discharge
    ? Math.round((60 / (cycle.discharge.duration / 60)) * chargeToCapacity) // C rating
    : 0;
  const averageCurrent = cycle.battery.capacity ? cycle.battery.capacity * Cr : 0; // mA

  if (cycle.charge) {
    result = {
      value: {
        chargeAmount: cycle.charge.amount,
        chargeToCapacityPercentage:
          cycle.charge.amount && cycle.battery.capacity
            ? (cycle.charge.amount / cycle.battery.capacity) * 100
            : 0,
        chargeToCapacity,
        chargeRestingVoltage: cycle.charge.packVoltage,
        Cr,
        averageCurrent,
      },
      string: {
        chargeDate: DateTime.fromISO(cycle.charge.date).toFormat('M/d/yy'),
        chargeAmount: `${cycle.charge.amount}mA`,
        chargeToCapacityPercentage:
          cycle.charge.amount && cycle.battery.capacity
            ? `${((cycle.charge.amount / cycle.battery.capacity) * 100).toFixed(1)}%`
            : '0%',
        chargeToCapacity: `${chargeToCapacity}`,
        chargeRestingVoltage: cycle.charge.packVoltage ? `${cycle.charge.packVoltage}V` : 'unknown',
        Cr: `${Cr}C`,
        averageCurrent: `${(averageCurrent / 1000).toFixed(1)}A`,
      },
    };
  }
  return result;
};
