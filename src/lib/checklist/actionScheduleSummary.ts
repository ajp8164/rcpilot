import { ChecklistActionNonRepeatingScheduleTimeframe, ChecklistActionRepeatingScheduleFrequency, ChecklistActionScheduleType, ChecklistType } from "types/checklist";

import { JChecklistAction } from "realmdb/Checklist";

export const actionScheduleSummary = (action: JChecklistAction, checklistType: ChecklistType) => {
  let result = '';
  if (action.schedule.type === ChecklistActionScheduleType.Repeating) {
    let when = '';
    let times = '';
    let freq = '';

    if (action.schedule.period === ChecklistActionRepeatingScheduleFrequency.ModelMinutes) {
      times = action.schedule.value.toString();
      freq = ` minute${action.schedule.value === 1 ? '' : 's'} of model time`;
    } else {
      if (action.schedule.value === 1) {
        times = '';
        freq = action.schedule.period.toLowerCase().replace(/s$/, '');
      } else {
        times = `${action.schedule.value} `;
        freq = action.schedule.period.toLowerCase();
      }

      if (action.schedule.period !== ChecklistActionRepeatingScheduleFrequency.Events) {
        freq += ' of calendar time';
      }
    }

    if (checklistType === ChecklistType.PreEvent) {
      when = 'before every';
    } else {
      when = 'after every';
    }
    result = `Perform ${when} ${times}${freq}`;
  } else {
    let after = '';
    let value = '';
    let timeframe = '';

    if (action.schedule.period === ChecklistActionNonRepeatingScheduleTimeframe.Today) {
      value = '';
      timeframe = '';
      after = 'immediatley at install';
    } else {
      value = `${action.schedule.value} `;
      timeframe = action.schedule.period!.toString().toLowerCase();

      if (action.schedule.value === 1) {
        timeframe = timeframe.replace(/s$/, '');
      }

      if (action.schedule.period === ChecklistActionNonRepeatingScheduleTimeframe.ModelMinutes) {
        timeframe = 'minutes';
        if (action.schedule.value === 1) {
          timeframe = timeframe.replace(/s$/, '');
        }  
        after = ' after total model time at install';
      } else if (action.schedule.period === ChecklistActionNonRepeatingScheduleTimeframe.Events) {
        after = ' after total events at install';
      }  else {
        after = ' after date at install';
      }
    }
    result = `Perform once ${value}${timeframe}${after}`;
  }
  return result;
};
