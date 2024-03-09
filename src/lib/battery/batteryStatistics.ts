import { Battery } from 'realmdb/Battery';
import { MilliampsPerMinute } from 'types/battery';
import { batteryCycleStatisticsData } from 'lib/batteryCycle';

export type BatteryStatistics = {
  value: {
    averageDischargeCurrent?: MilliampsPerMinute;
  },
  string: {
    averageDischargeCurrent: string;
  },
};

export const batteryStatistics = (battery: Battery) => {
  // Compute average discharge rate over logged full cycles.
  let count = 0;
  let sumDischargeCurrent = 0;
  battery.cycles.forEach(cycle => {
    if (cycle.charge && cycle.discharge) {
      count++;
      sumDischargeCurrent =
        sumDischargeCurrent + batteryCycleStatisticsData(cycle).value.averageDischargeCurrent!;
    } 
  });

  const averageDischargeCurrent = sumDischargeCurrent / count;

  const result: BatteryStatistics = {
    value: {
      averageDischargeCurrent,
    },
    string: {
      averageDischargeCurrent: `${(averageDischargeCurrent / 1000).toFixed(1)} A/min avg`,
    },
  }
  return result;
};
